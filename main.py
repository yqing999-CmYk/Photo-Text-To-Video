from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.config import FRONTEND_DIR, OUTPUT_DIR, UPLOAD_DIR, KLING_ACCESS_KEY_ID, KLING_ACCESS_KEY_SECRET
from backend.routes.video import router as video_router

# ── Startup validation ──────────────────────────────────────────────────────
if not KLING_ACCESS_KEY_ID or not KLING_ACCESS_KEY_SECRET:
    raise RuntimeError(
        "Kling API keys are not set. "
        "Create a .env file with KLING_ACCESS_KEY_ID and KLING_ACCESS_KEY_SECRET. "
        "See .env.example for the format."
    )

# ── Ensure storage directories exist ────────────────────────────────────────
Path(UPLOAD_DIR).mkdir(parents=True, exist_ok=True)
Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

# ── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(title="Photo-To-Video", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(video_router, prefix="/api")

# Serve generated videos at /outputs/<filename>
app.mount("/outputs", StaticFiles(directory=OUTPUT_DIR), name="outputs")

# Serve frontend (must be last — catch-all)
app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
