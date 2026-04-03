from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from ..services.ai_optimizer import optimize_resume_for_jd

router = APIRouter()

class AIRequest(BaseModel):
    job_description: str
    files: List[Dict[str, str]] # [{'path': 'main.tex', 'content': '...'}, ...]
    model: str = "Qwen3-Coder"
    language: str = "zh-CN"

@router.post("/optimize")
async def optimize_resume(request: AIRequest):
    try:
        result = await optimize_resume_for_jd(
            request.job_description,
            request.files,
            request.model,
            request.language
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
