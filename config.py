import os
from dotenv import load_dotenv

load_dotenv()

KLING_ACCESS_KEY_ID = os.getenv("KLING_ACCESS_KEY_ID", "")
KLING_ACCESS_KEY_SECRET = os.getenv("KLING_ACCESS_KEY_SECRET", "")
KLING_API_BASE = "https://api.klingai.com"

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

MAX_IMAGE_SIZE_MB = 10
