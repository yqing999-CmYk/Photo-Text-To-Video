from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import OUTPUT_DIR, UPLOAD_DIR
from backend.routes.video import router as video_router

app = FastAPI(title="Photo-To-Video", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure storage directories exist on startup.
Path(UPLOAD_DIR).mkdir(exist_ok=True)
Path(OUTPUT_DIR).mkdir(exist_ok=True)

# API routes
app.include_router(video_router, prefix="/api")

# Serve generated videos at /outputs/<filename>
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# Serve frontend (must be last — catch-all)
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
