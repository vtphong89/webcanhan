/**
 * wheel.js - Xử lý vòng quay may mắn (TRỢ THỦ TRI BÀI)
 */

// Lấy config từ config.js
const WHEEL_SHEETS = typeof WHEEL_SHEETS_CONFIG !== "undefined" ? WHEEL_SHEETS_CONFIG : {};

// DOM elements
let wheelClassSelect, wheelStatus, randomResultEl, wheelCircle, wheelDurationInput;

// State
let currentClassId = "12C1";
let currentStudents = [];
let wheelDurationSeconds = 2; // thời gian quay mặc định: 2s
const COOLDOWN_MINUTES = 90; // Thời gian chờ: 90 phút

/**
 * Khởi tạo module wheel
 */
function initWheel() {
  wheelClassSelect = document.getElementById("wheel-class-select");
  wheelStatus = document.getElementById("wheel-status");
  randomResultEl = document.getElementById("random-result");
  wheelCircle = document.getElementById("wheel-circle");
  wheelDurationInput = document.getElementById("wheel-duration-input");

  if (wheelDurationInput) {
    wheelDurationInput.value = wheelDurationSeconds.toString();
    wheelDurationInput.addEventListener("change", () => {
      const val = parseFloat(wheelDurationInput.value);
      if (!isNaN(val) && val > 0 && val <= 10) {
        wheelDurationSeconds = val;
      } else {
        // reset về giá trị hợp lệ gần nhất
        wheelDurationInput.value = wheelDurationSeconds.toString();
      }
    });
  }

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
 * Lưu tên đã quay vào localStorage với timestamp
 */
function saveSpunName(className, name) {
  try {
    const key = `wheel_spun_${className}`;
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    const now = Date.now();
    
    // Thêm tên mới với timestamp
    data.push({ name, timestamp: now });
    
    // Lưu lại
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving spun name:", e);
  }
}

/**
 * Lấy danh sách tên còn lại (loại bỏ tên đã quay trong vòng 90 phút)
 */
function getAvailableNames(className, allNames) {
  try {
    const key = `wheel_spun_${className}`;
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    const now = Date.now();
    const cooldownMs = COOLDOWN_MINUTES * 60 * 1000; // 90 phút = 5400000 ms
    
    // Lọc bỏ các tên đã quay trong vòng 90 phút
    const recentSpunNames = new Set(
      data
        .filter(item => (now - item.timestamp) < cooldownMs)
        .map(item => item.name)
    );
    
    // Trả về danh sách tên chưa quay hoặc đã hết thời gian chờ
    const available = allNames.filter(name => !recentSpunNames.has(name));
    
    // Nếu không còn tên nào, reset và trả về tất cả
    if (available.length === 0) {
      // Xóa dữ liệu cũ
      localStorage.removeItem(key);
      return allNames;
    }
    
    return available;
  } catch (e) {
    console.error("Error getting available names:", e);
    return allNames; // Trả về tất cả nếu có lỗi
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

  // Lấy danh sách tên còn lại (loại bỏ tên đã quay trong 90 phút)
  const availableNames = getAvailableNames(currentClassId, currentStudents);
  
  if (availableNames.length === 0) {
    if (randomResultEl) {
      randomResultEl.textContent = "Tất cả học sinh đã được quay trong 90 phút qua.";
      randomResultEl.style.color = "#e74c3c";
    }
    return;
  }

  if (wheelCircle) {
    wheelCircle.classList.add("spinning");
  }

  const names = availableNames.slice();
  const resultEl = randomResultEl;
  const start = performance.now();
  const duration = wheelDurationSeconds * 1000;
  const startSpeed = 40;
  const endSpeed = 260;

  function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  let selectedName = null;

  function tick() {
    const now = performance.now();
    const progress = Math.min((now - start) / duration, 1);
    const ease = easeOutCubic(progress);
    const speed = startSpeed + (endSpeed - startSpeed) * ease;

    const randomIndex = Math.floor(Math.random() * names.length);
    const currentName = names[randomIndex];
    
    if (resultEl) {
      resultEl.textContent = currentName;
      resultEl.style.color = "#333";
    }

    if (progress >= 1) {
      // Chọn tên cuối cùng
      selectedName = currentName;
      
      // Lưu tên đã quay
      saveSpunName(currentClassId, selectedName);
      
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

