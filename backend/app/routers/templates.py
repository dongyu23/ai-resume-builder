import os
from fastapi import APIRouter, HTTPException
from typing import Dict, List

router = APIRouter()

def read_template_file(filepath: str) -> str:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"% Error loading file: {str(e)}"

@router.get("/")
async def get_templates():
    """返回内置模板的文件内容，供前端初始化文件树使用"""
    templates_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../templates"))
    
    # Awesome-CV
    awesome_cv_dir = os.path.join(templates_dir, "awesome-cv")
    awesome_cv_files = []
    if os.path.exists(awesome_cv_dir):
        awesome_cv_files.append({
            "path": "main.tex",
            "content": read_template_file(os.path.join(awesome_cv_dir, "main.tex")),
            "is_base64": False
        })
        awesome_cv_files.append({
            "path": "preamble/zh.tex",
            "content": read_template_file(os.path.join(awesome_cv_dir, "preamble/zh.tex")),
            "is_base64": False
        })
        awesome_cv_files.append({
            "path": "awesome-cv.cls",
            "content": read_template_file(os.path.join(awesome_cv_dir, "awesome-cv.cls")),
            "is_base64": False
        })
        
    # Hijiangtao (Classic Chinese)
    hijiangtao_dir = os.path.join(templates_dir, "resume-zh-hijiangtao")
    hijiangtao_files = []
    if os.path.exists(hijiangtao_dir):
        hijiangtao_files.append({
            "path": "main.tex",
            # We use their resume-zh_CN.tex as our main.tex
            "content": read_template_file(os.path.join(hijiangtao_dir, "resume-zh_CN.tex")),
            "is_base64": False
        })
        for f in ["resume.cls", "fontawesome.sty", "zh_CN-Adobefonts_external.sty", "linespacing_fix.sty"]:
            hijiangtao_files.append({
                "path": f,
                "content": read_template_file(os.path.join(hijiangtao_dir, f)),
                "is_base64": False
            })

    return {
        "awesome-cv": awesome_cv_files,
        "hijiangtao": hijiangtao_files
    }
