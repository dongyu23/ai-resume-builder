import os
import json
import logging
import asyncio
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

# Valid models whitelist
ALLOWED_MODELS = [
    "DeepSeek-V3.2", "GLM-5", "GLM-4.7",
    "MiniMax-M2.5", "Kimi-K2.5", "Kimi-K2-Turbo", "Qwen3-Coder",
    "glm-4.7" # Allow lowercase
]

async def optimize_resume_for_jd(job_description: str, files: list, model: str = "glm-4.7", language: str = "zh-CN"):
    if model not in ALLOWED_MODELS:
        raise ValueError(f"Model {model} is not allowed. Choose from: {', '.join(ALLOWED_MODELS)}")

    # Get from environment or use the user provided values as fallback
    api_key = os.getenv("OPENAI_API_KEY", "sk-PCV43uGsNiwy_a4W2CnpCQ")
    base_url = os.getenv("OPENAI_BASE_URL", "https://llmapi.paratera.com")

    if not api_key or api_key == "pk-dummy-key" or api_key.strip() == "":
        raise ValueError("API Key is completely missing or invalid. Please configure a valid API Key for production use.")

    # We only process the .tex files (mostly main.tex)
    tex_files = [f for f in files if f['path'].endswith('.tex')]

    # -------------------------------------------------------------------------
    # REAL API MODE ONLY (MOCK DELETED)
    # -------------------------------------------------------------------------
    client = AsyncOpenAI(
        api_key=api_key,
        base_url=base_url,
        timeout=180.0  # Explicitly set a long timeout for slow models like DeepSeek
    )

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
                {"role": "system", "content": "You are a helpful LaTeX resume optimization assistant. You must ONLY return a valid JSON object, without any markdown wrappers or conversational text."},
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
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON from AI: {content}")
        raise ValueError("AI returned invalid JSON format. Please try again.")
    except Exception as e:
        logger.error(f"AI Optimization failed: {e}")
        # In production, we explicitly raise the error to the frontend
        raise e
