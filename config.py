import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

KLING_ACCESS_KEY_ID = os.getenv("KLING_ACCESS_KEY_ID", "")
KLING_ACCESS_KEY_SECRET = os.getenv("KLING_ACCESS_KEY_SECRET", "")
KLING_API_BASE = "https://api.klingai.com"

# Anchor all storage paths to the project root so the app works
# regardless of which directory uvicorn is launched from.
BASE_DIR = Path(__file__).parent.parent  # Photo-To-Video/

UPLOAD_DIR = str(BASE_DIR / "uploads")
OUTPUT_DIR = str(BASE_DIR / "outputs")
FRONTEND_DIR = str(BASE_DIR / "frontend")

MAX_IMAGE_SIZE_MB = 10
