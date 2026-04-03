import os
import shutil
import uuid
import base64
import asyncio
from typing import List, Optional, Dict
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from fastapi.responses import FileResponse, StreamingResponse
from ..services.compile_runner import compile_latex, get_compile_status, get_pdf_path

router = APIRouter()

class FileItem(BaseModel):
    path: str
    content: str
    is_base64: bool = False

class CompileRequest(BaseModel):
    project_id: str
    files: List[FileItem]
    main_tex: str = "main.tex"
    compiler: str = "xelatex" # xelatex, lualatex

def secure_join(base: str, *paths: str) -> str:
    """Safely join paths to prevent directory traversal attacks."""
    final_path = os.path.abspath(os.path.join(base, *paths))
    if not final_path.startswith(os.path.abspath(base)):
        raise HTTPException(status_code=400, detail="Invalid path: Directory traversal detected")
    return final_path

@router.post("/")
async def start_compile(request: CompileRequest, background_tasks: BackgroundTasks):
    compile_id = str(uuid.uuid4())
    
    # Validate project_id to prevent path traversal
    if ".." in request.project_id or "/" in request.project_id or "\\" in request.project_id:
        raise HTTPException(status_code=400, detail="Invalid project_id")
        
    # Prepare sandbox directory
    sandbox_base = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sandbox"))
    sandbox_dir = secure_join(sandbox_base, request.project_id, compile_id)
    os.makedirs(sandbox_dir, exist_ok=True)
    
    # Write files to sandbox
    try:
        # Template detection
        is_awesome_cv = False
        is_hijiangtao = False
        
        for file in request.files:
            if "awesome-cv" in file.content:
                is_awesome_cv = True
            if "resume-zh_CN" in file.content or "resume.cls" in file.path:
                is_hijiangtao = True

            # If it's a mock class file, skip writing it so we can copy the real one
            if file.path.endswith('.cls') and 'Mock Class File' in file.content:
                continue
            if file.path.endswith('.sty') and 'Mock Sty File' in file.content:
                continue

            # Safely join and check bounds
            file_path = secure_join(sandbox_dir, file.path)
            
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            if file.is_base64:
                with open(file_path, "wb") as f:
                    f.write(base64.b64decode(file.content))
            else:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(file.content)
                    
        # Copy shared latexmkrc if needed
        shared_latexmkrc = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../templates/shared/latexmkrc"))
        target_latexmkrc = os.path.join(sandbox_dir, "latexmkrc")
        if os.path.exists(shared_latexmkrc) and not os.path.exists(target_latexmkrc):
            shutil.copy(shared_latexmkrc, target_latexmkrc)
            
        # Automatically inject awesome-cv.cls if needed
        if is_awesome_cv:
            cls_target = os.path.join(sandbox_dir, "awesome-cv.cls")
            if not os.path.exists(cls_target):
                cls_source = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../templates/awesome-cv/awesome-cv.cls"))
                if os.path.exists(cls_source):
                    shutil.copy(cls_source, cls_target)
                
        # Automatically inject hijiangtao template files
        if is_hijiangtao:
            hijiangtao_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../templates/resume-zh-hijiangtao"))
            if os.path.exists(hijiangtao_dir):
                for template_file in os.listdir(hijiangtao_dir):
                    if template_file.endswith('.cls') or template_file.endswith('.sty'):
                        target_path = secure_join(sandbox_dir, template_file)
                        if not os.path.exists(target_path):
                            shutil.copy(os.path.join(hijiangtao_dir, template_file), target_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # Start compilation in background
    background_tasks.add_task(compile_latex, sandbox_dir, request.main_tex, request.compiler, compile_id)
    
    return {"compile_id": compile_id, "project_id": request.project_id}

@router.get("/{project_id}/{compile_id}/status")
async def check_status(project_id: str, compile_id: str):
    if ".." in project_id or ".." in compile_id:
        raise HTTPException(status_code=400, detail="Invalid path")
        
    sandbox_base = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sandbox"))
    sandbox_dir = secure_join(sandbox_base, project_id, compile_id)
    
    status = get_compile_status(sandbox_dir, compile_id)
    if not status:
        raise HTTPException(status_code=404, detail="Compile job not found")
    return status

@router.get("/{project_id}/{compile_id}/pdf")
async def get_pdf(project_id: str, compile_id: str):
    if ".." in project_id or ".." in compile_id:
        raise HTTPException(status_code=400, detail="Invalid path")
        
    sandbox_base = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sandbox"))
    sandbox_dir = secure_join(sandbox_base, project_id, compile_id)
    
    pdf_path = get_pdf_path(sandbox_dir, compile_id)
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="PDF not found or compilation failed")
    
    # By default FileResponse with a filename triggers a "Content-Disposition: attachment" 
    # causing the browser to download the file instead of rendering it inline in an iframe.
    # We use headers to force inline display, behaving like Overleaf's preview.
    return FileResponse(
        pdf_path, 
        media_type="application/pdf", 
        headers={"Content-Disposition": "inline; filename=resume.pdf"}
    )

@router.get("/{project_id}/{compile_id}/logs")
async def stream_logs(project_id: str, compile_id: str):
    if ".." in project_id or ".." in compile_id:
        raise HTTPException(status_code=400, detail="Invalid path")
        
    sandbox_base = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../sandbox"))
    sandbox_dir = secure_join(sandbox_base, project_id, compile_id)
    log_path = os.path.join(sandbox_dir, "compile.log")
    
    async def log_generator():
        if not os.path.exists(log_path):
            for _ in range(10):
                if os.path.exists(log_path):
                    break
                await asyncio.sleep(0.5)
            if not os.path.exists(log_path):
                yield "data: > [SYSTEM] Log file not found\n\n"
                return
        
        with open(log_path, "r", encoding="utf-8", errors="replace") as f:
            while True:
                line = f.readline()
                if line:
                    yield f"data: {line}\n\n"
                else:
                    status = get_compile_status(sandbox_dir, compile_id)
                    if status and status.get("status") in ["success", "failed"]:
                        break
                    await asyncio.sleep(0.5)
                    
    return StreamingResponse(log_generator(), media_type="text/event-stream")
