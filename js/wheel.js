/**
 * wheel.js - Xử lý vòng quay may mắn (TRỢ THỦ TRI BÀI)
 */

// Lấy config từ config.js
const WHEEL_SHEETS = typeof WHEEL_SHEETS_CONFIG !== "undefined" ? WHEEL_SHEETS_CONFIG : {};

// DOM elements
let wheelClassSelect, wheelStatus, randomResultEl, wheelCircle;

// State
let currentClassId = "12C1";
let currentStudents = [];

/**
 * Khởi tạo module wheel
 */
function initWheel() {
  wheelClassSelect = document.getElementById("wheel-class-select");
  wheelStatus = document.getElementById("wheel-status");
  randomResultEl = document.getElementById("random-result");
  wheelCircle = document.getElementById("wheel-circle");

  if (wheelClassSelect) {
    wheelClassSelect.addEventListener("change", async (e) => {
      currentClassId = e.target.value;
      await loadStudentsForClass(currentClassId);
    });
  }

  // Load danh sách lớp mặc định
  loadStudentsForClass(currentClassId);
}

/**
 * Cập nhật trạng thái hiển thị
 */
function setWheelStatus(text) {
  if (wheelStatus) wheelStatus.textContent = text;
}

/**
 * Tải danh sách học sinh từ Google Sheets theo lớp
 */
async function loadStudentsForClass(classId) {
  try {
    const url = WHEEL_SHEETS[classId];
    if (!url) {
      currentStudents = [];
      setWheelStatus(`Chưa cấu hình URL cho lớp ${classId}.`);
      return;
    }

    setWheelStatus(`Đang tải danh sách ${classId} từ Google Sheets...`);
    const resp = await fetch(url, { cache: "no-store" });
    if (!resp.ok) {
      throw new Error("HTTP " + resp.status);
    }
    const text = await resp.text();
    const rows = parseCsv(text);
    if (!rows.length) {
      throw new Error("Không có dữ liệu");
    }

    // CSV: cột 0 = số thứ tự, cột 1 = Họ tên
    const names = rows
      .map((r) => (r[1] || "").trim())
      .filter((name) => name && !/tên|họ tên|danh\s*sách/i.test(name));

    currentStudents = names;
    if (!currentStudents.length) {
      setWheelStatus(`Không tìm thấy tên học sinh cho lớp ${classId}.`);
    } else {
      setWheelStatus(`Đã tải ${currentStudents.length} học sinh lớp ${classId}.`);
    }
  } catch (e) {
    console.error(e);
    currentStudents = [];
    setWheelStatus(
      `Không tải được danh sách lớp ${classId}. Kiểm tra lại link CSV hoặc kết nối mạng.`
    );
  }
}

/**
 * Quay ngẫu nhiên chọn học sinh
 */
function spinRandom() {
  if (!currentStudents.length) {
    if (randomResultEl) {
      randomResultEl.textContent = "Chưa có danh sách tên của lớp này.";
      randomResultEl.style.color = "#e74c3c";
    }
    return;
  }

  if (wheelCircle) {
    wheelCircle.classList.add("spinning");
  }

  const names = currentStudents.slice();
  const resultEl = randomResultEl;
  const start = performance.now();
  const duration = 6000;
  const startSpeed = 40;
  const endSpeed = 260;

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function tick() {
    const now = performance.now();
    const progress = Math.min((now - start) / duration, 1);
    const ease = easeOutCubic(progress);
    const speed = startSpeed + (endSpeed - startSpeed) * ease;

    const randomIndex = Math.floor(Math.random() * names.length);
    if (resultEl) {
      resultEl.textContent = names[randomIndex];
      resultEl.style.color = "#333";
    }

    if (progress >= 1) {
      if (resultEl) {
        resultEl.style.color = "#e74c3c";
        resultEl.style.transform = "scale(1.2)";
        setTimeout(() => (resultEl.style.transform = "scale(1)"), 220);
      }
      if (wheelCircle) {
        setTimeout(() => wheelCircle.classList.remove("spinning"), 220);
      }
      return;
    }

    setTimeout(tick, speed);
  }

  tick();
}

// Export function để có thể gọi từ HTML
window.spinRandom = spinRandom;

