# Photo to Video

A web application that turns a person's photo into a short video driven by a text prompt. Upload a photo, describe an action, and the app generates a video of that person performing it.

---

## How It Works

1. **Upload** a photo of a person (JPEG, PNG, or WebP, max 10 MB)
2. **Describe** the action in a text prompt (e.g. _"The person waves and smiles at the camera"_)
3. **Choose** duration (5 s or 10 s), aspect ratio, and model quality
4. **Click Generate** — the request is sent to the Kling AI image-to-video API
5. The backend polls Kling every few seconds; when the video is ready it is downloaded locally
6. The **video plays automatically** in the browser and can be downloaded as MP4


---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Backend   | Python 3.11, FastAPI, Uvicorn |
| Frontend  | HTML5, CSS3, Vanilla JavaScript |
| AI Model  | [Kling AI](https://developer.klingai.com/) image-to-video API |
| Auth      | JWT (HS256) generated from Kling access keys |
| HTTP      | httpx (async), python-multipart (file upload) |
| File I/O  | aiofiles (non-blocking) |
| Config    | python-dotenv |

---

## Project Structure

```
Photo-To-Video/
├── backend/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, middleware, static mounts
│   ├── config.py            # Settings, absolute paths, env var loading
│   ├── routes/
│   │   └── video.py         # POST /api/generate, GET /api/status/{job_id}
│   └── services/
│       └── kling_service.py # JWT auth, Kling API calls, video download
├── frontend/
│   ├── index.html           # Single-page UI
│   ├── style.css            # Dark-theme styles
│   └── app.js               # Upload, polling, video player logic
├── uploads/                 # Uploaded photos (auto-created, gitignored)
├── outputs/                 # Generated videos (auto-created, gitignored)
├── Plan/
│   └── plan.txt             # Research notes and architecture decisions
├── .env                     # Your API keys (never commit this)
├── .env.example             # Key name template
├── .gitignore
├── requirements.txt
├── start.bat                # One-click launcher for Windows
└── README.md
```

---

## Environment Setup

### Prerequisites

- Python 3.11
- A free [Kling AI developer account](https://developer.klingai.com/) — get your **Access Key ID** and **Access Key Secret**

### 1. Install dependencies

```bash
pip install -r requirements.txt
```

### 2. Create your `.env` file

Copy the template and fill in your Kling credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```

> The server will refuse to start with a clear error message if these keys are missing.

---

## How to Run

### Windows — double-click launcher

Double-click **`start.bat`**.
It clears any conflicting Python environment variables, then starts the server automatically.

### Any platform — command line

```bash
cd /path/to/Photo-To-Video
uvicorn backend.main:app --reload --port 8000
```

Then open **http://localhost:8000** in your browser.

---

---

## Deployment

### Option A — Railway.app (recommended, free tier)

1. Push the project to a GitHub repository
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Set environment variables in Railway dashboard:
   - `KLING_ACCESS_KEY_ID`
   - `KLING_ACCESS_KEY_SECRET`
4. Set the start command:
   ```
   uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```
5. Railway assigns a public URL automatically

> **Note:** Railway's free tier has ephemeral storage — generated videos are lost on redeploy. For persistence, add Cloudflare R2 or AWS S3 (swap `download_video()` in `kling_service.py` to upload there instead of local disk).




