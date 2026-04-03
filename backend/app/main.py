from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import compile, ai

app = FastAPI(title="Resume Builder API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(compile.router, prefix="/api/compile", tags=["compile"])
app.include_router(ai.router, prefix="/api/ai", tags=["ai"])
from .routers import templates
app.include_router(templates.router, prefix="/api/templates", tags=["templates"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
