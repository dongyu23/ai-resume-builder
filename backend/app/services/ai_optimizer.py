import os
import json
from openai import AsyncOpenAI
import logging

logger = logging.getLogger(__name__)

# Valid models whitelist
ALLOWED_MODELS = [
    "DeepSeek-V3.2", "GLM-5", "GLM-4.7", 
    "MiniMax-M2.5", "Kimi-K2.5", "Kimi-K2-Turbo", "Qwen3-Coder"
]

async def optimize_resume_for_jd(job_description: str, files: list, model: str = "Qwen3-Coder", language: str = "zh-CN"):
    if model not in ALLOWED_MODELS:
        raise ValueError(f"Model {model} is not allowed. Choose from: {', '.join(ALLOWED_MODELS)}")
        
    api_key = os.getenv("OPENAI_API_KEY", "pk-dummy-key")
    base_url = os.getenv("OPENAI_BASE_URL", "https://modelservice.jdcloud.com/coding/openai/v1")
    
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
    )
    
    # We only process the .tex files (mostly main.tex)
    tex_files = [f for f in files if f['path'].endswith('.tex')]
    
    # Prepare prompt
    prompt = f"""
You are an expert resume reviewer and ATS optimization specialist.
I will provide you with a Job Description (JD) and the LaTeX source code of my resume.
Your task is to optimize the resume content to better align with the JD.

Language: {language}

JD:
{job_description}

Resume Files:
"""
    for tf in tex_files:
        prompt += f"--- {tf['path']} ---\n{tf['content']}\n\n"

    prompt += """
EXPERT RULES:
1. Align keywords with the JD. Do NOT invent or hallucinate experiences.
2. Use STAR method (Situation, Task, Action, Result) for bullet points.
3. Prioritize quantifiable impacts (e.g., "Increased performance by 20%"). If exact numbers don't exist, use qualitative impacts (e.g., "Significantly improved performance").
4. Ensure the output is valid LaTeX and can be compiled. Do NOT change \documentclass or core packages.
5. Return the result as a JSON object containing:
   - "patch": a unified diff string or a direct list of file updates
   - "explanations": a list of objects with {"reason": "...", "rule": "...", "original": "...", "new": "..."}
   - "optimizedFiles": a list of objects with {"path": "...", "content": "..."} containing the full updated content.

Output ONLY valid JSON. Do NOT wrap it in ```json codeblocks.
"""

    try:
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful LaTeX resume optimization assistant."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=4000,
        )
        
        content = response.choices[0].message.content
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
            
        result = json.loads(content)
        return result
    except Exception as e:
        logger.error(f"AI Optimization failed: {e}")
        # Return a mock response for sandbox testing purposes since real API keys might fail
        return {
            "patch": "Diff not available due to API error",
            "explanations": [{"reason": "API Key is likely invalid or missing", "rule": "System", "original": "", "new": ""}],
            "optimizedFiles": tex_files,
            "error": str(e)
        }
