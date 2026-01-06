/**
 * countdown.js - Xử lý đếm ngược các mốc thi quan trọng
 */

// Lấy config từ config.js
const EXAM_PHASES = (typeof EXAM_PHASES_CONFIG !== "undefined"
  ? EXAM_PHASES_CONFIG
  : []
).map((p) => ({
  label: p.label,
  time: new Date(p.time),
}));

const HSG_EXAM_TIME = typeof HSG_EXAM_TIME_CONFIG !== "undefined"
  ? new Date(HSG_EXAM_TIME_CONFIG)
  : null;

/**
 * Lấy mốc thi tiếp theo
 */
function getCurrentPhase() {
  const now = new Date();
  const future = EXAM_PHASES.filter((p) => p.time > now);
  return future.length ? future[0] : null;
}

/**
 * Render countdown cho các mốc thi chính (HK1, HK2, TN THPT)
 */
function renderCountdown() {
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-mins");
  const secsEl = document.getElementById("cd-secs");
  const noteEl = document.querySelector(".countdown-note");
  const boxEl = document.getElementById("phase-countdown");
  
  if (!daysEl || !EXAM_PHASES.length) return;

  const phase = getCurrentPhase();
  if (!phase) {
    if (boxEl) boxEl.style.display = "none";
    return;
  }
  if (boxEl) boxEl.style.display = "";

  if (noteEl) {
    noteEl.textContent = phase.label;
  }

  const now = new Date();
  let diff = phase.time - now;
  if (diff < 0) diff = 0;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
  if (minsEl) minsEl.textContent = String(mins).padStart(2, "0");
  if (secsEl) secsEl.textContent = String(secs).padStart(2, "0");
}

/**
 * Render countdown cho thi Học sinh giỏi
 */
function renderHsgCountdown() {
  const daysEl = document.getElementById("cd2-days");
  const hoursEl = document.getElementById("cd2-hours");
  const minsEl = document.getElementById("cd2-mins");
  const secsEl = document.getElementById("cd2-secs");
  const boxEl = document.getElementById("hsg-countdown");
  
  if (!daysEl || !HSG_EXAM_TIME) return;

  const now = new Date();
  let diff = HSG_EXAM_TIME - now;
  if (diff < 0) diff = 0;
  
  if (diff === 0 && boxEl) {
    boxEl.style.display = "none";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
  if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
  if (minsEl) minsEl.textContent = String(mins).padStart(2, "0");
  if (secsEl) secsEl.textContent = String(secs).padStart(2, "0");
}

/**
 * Khởi tạo countdown timers
 */
function initCountdown() {
  renderCountdown();
  setInterval(renderCountdown, 1000);

  renderHsgCountdown();
  setInterval(renderHsgCountdown, 1000);
}

