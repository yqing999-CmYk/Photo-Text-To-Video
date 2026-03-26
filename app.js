/* ── State ── */
let selectedFile = null;
let pollTimer = null;
let currentJobId = null;

/* ── DOM refs ── */
const uploadZone       = document.getElementById('uploadZone');
const fileInput        = document.getElementById('fileInput');
const browseBtn        = document.getElementById('browseBtn');
const uploadPlaceholder= document.getElementById('uploadPlaceholder');
const uploadPreview    = document.getElementById('uploadPreview');
const previewImg       = document.getElementById('previewImg');
const removeBtn        = document.getElementById('removeBtn');

const promptInput      = document.getElementById('promptInput');
const charCount        = document.getElementById('charCount');
const generateBtn      = document.getElementById('generateBtn');
const generateLabel    = document.getElementById('generateLabel');

const durationGroup    = document.getElementById('durationGroup');
const ratioGroup       = document.getElementById('ratioGroup');
const modelGroup       = document.getElementById('modelGroup');

const resultIdle       = document.getElementById('resultIdle');
const resultProgress   = document.getElementById('resultProgress');
const resultError      = document.getElementById('resultError');
const resultSuccess    = document.getElementById('resultSuccess');
const progressLabel    = document.getElementById('progressLabel');
const errorMsg         = document.getElementById('errorMsg');
const retryBtn         = document.getElementById('retryBtn');
const videoPlayer      = document.getElementById('videoPlayer');
const downloadBtn      = document.getElementById('downloadBtn');

/* ══ File upload ══ */

browseBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  fileInput.click();
});

uploadZone.addEventListener('click', () => {
  if (!selectedFile) fileInput.click();
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

/* Drag & drop */
uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});
uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('drag-over');
});
uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
});

function setFile(file) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    showError('Please upload a JPEG, PNG, or WebP image.');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showError('Image must be under 10 MB.');
    return;
  }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    uploadPlaceholder.hidden = true;
    uploadPreview.hidden = false;
  };
  reader.readAsDataURL(file);
  updateGenerateBtn();
}

removeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  clearFile();
});

function clearFile() {
  selectedFile = null;
  fileInput.value = '';
  previewImg.src = '';
  uploadPreview.hidden = true;
  uploadPlaceholder.hidden = false;
  updateGenerateBtn();
}

/* ══ Prompt character counter ══ */
promptInput.addEventListener('input', () => {
  charCount.textContent = `${promptInput.value.length} / 500`;
  updateGenerateBtn();
});

/* ══ Toggle button groups ══ */
function initToggleGroup(group) {
  group.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-btn');
    if (!btn) return;
    group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
}
initToggleGroup(durationGroup);
initToggleGroup(ratioGroup);
initToggleGroup(modelGroup);

function getToggleValue(group) {
  return group.querySelector('.toggle-btn.active')?.dataset.value ?? '';
}

/* ══ Generate button state ══ */
function updateGenerateBtn() {
  generateBtn.disabled = !(selectedFile && promptInput.value.trim());
}

/* ══ Generate ══ */
generateBtn.addEventListener('click', startGeneration);
retryBtn.addEventListener('click', () => {
  showState('idle');
});

async function startGeneration() {
  if (!selectedFile || !promptInput.value.trim()) return;

  stopPolling();
  showState('progress');
  setProgressLabel('Submitting to Kling AI…');
  setGenerating(true);

  const formData = new FormData();
  formData.append('image', selectedFile);
  formData.append('prompt', promptInput.value.trim());
  formData.append('duration', getToggleValue(durationGroup));
  formData.append('aspect_ratio', getToggleValue(ratioGroup));
  formData.append('model', getToggleValue(modelGroup));

  try {
    const resp = await fetch('/api/generate', { method: 'POST', body: formData });
    const body = await resp.json();
    if (!resp.ok) {
      throw new Error(body.detail || `Server error ${resp.status}`);
    }
    currentJobId = body.job_id;
    setProgressLabel('Kling AI is generating your video…');
    startPolling(currentJobId);
  } catch (err) {
    showError(err.message);
    setGenerating(false);
  }
}

/* ══ Polling ══ */
const POLL_INTERVAL_MS = 4000;

function startPolling(jobId) {
  pollTimer = setInterval(() => pollStatus(jobId), POLL_INTERVAL_MS);
}

function stopPolling() {
  if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
}

async function pollStatus(jobId) {
  try {
    const resp = await fetch(`/api/status/${jobId}`);
    const body = await resp.json();
    if (!resp.ok) throw new Error(body.detail || 'Status check failed.');

    const { status, video_url, error } = body;

    if (status === 'done') {
      stopPolling();
      setGenerating(false);
      showVideo(video_url);
    } else if (status === 'failed') {
      stopPolling();
      setGenerating(false);
      showError(error || 'Generation failed. Try a different image or prompt.');
    } else {
      // still processing — update label for feedback
      setProgressLabel('Kling AI is generating your video…');
    }
  } catch (err) {
    stopPolling();
    setGenerating(false);
    showError(err.message);
  }
}

/* ══ UI state helpers ══ */

function showState(state) {
  resultIdle.hidden     = state !== 'idle';
  resultProgress.hidden = state !== 'progress';
  resultError.hidden    = state !== 'error';
  resultSuccess.hidden  = state !== 'success';
}

function setProgressLabel(text) {
  progressLabel.textContent = text;
}

function showError(message) {
  errorMsg.textContent = message;
  showState('error');
}

function showVideo(url) {
  videoPlayer.src = url;
  downloadBtn.href = url;
  showState('success');
  videoPlayer.play().catch(() => {});
}

function setGenerating(on) {
  generateLabel.textContent = on ? 'Generating…' : 'Generate Video';
  if (on) {
    generateBtn.disabled = true;
  } else {
    // Fix #5: re-evaluate based on current state, not unconditionally enable
    updateGenerateBtn();
  }
}
