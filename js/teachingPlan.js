/**
 * Chuẩn hóa URL Google Sheets: nếu là pubhtml hoặc thiếu output=csv, chuyển sang output=csv
 */
function normalizeSheetUrl(url) {
  if (!url) return url;
  let out = url.trim();
  if (out.includes("pubhtml")) {
    // đổi pubhtml -> pub?output=csv
    out = out.replace("pubhtml", "pub?output=csv");
  } else if (!out.includes("output=csv")) {
    // thêm output=csv nếu chưa có
    if (out.includes("?")) {
      out += "&output=csv";
    } else {
      out += "?output=csv";
    }
  }
  return out;
}
/**
 * teachingPlan.js - Xử lý hiển thị Lịch Báo Giảng từ Google Sheets
 * 
 * Cấu trúc dữ liệu:
 * - Cột A: Tuần (ví dụ: "75", "1", "1,2", "1-3")
 * - Cột B: Tiết thứ (ví dụ: "1", "1,2", "1-3")
 * - Cột C: Bài dạy (tên bài)
 * 
 * Xử lý merge cells: Nếu ô trống, tham chiếu giá trị từ dòng trước đó
 */

/**
 * Parse chuỗi số (có thể là số đơn, nhiều số cách nhau bằng dấu phẩy, hoặc khoảng)
 * Ví dụ: "1" -> [1], "1,2" -> [1,2], "1-3" -> [1,2,3], "1,3,5" -> [1,3,5]
 */
function parseNumberRange(str) {
  if (!str || !str.trim()) return [];
  
  const cleaned = str.toString().trim();
  const numbers = [];
  
  // Tách theo dấu phẩy trước
  const parts = cleaned.split(',').map(s => s.trim());
  
  for (const part of parts) {
    if (part.includes('-')) {
      // Xử lý khoảng (ví dụ: "1-3")
      const [start, end] = part.split('-').map(s => parseInt(s.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          numbers.push(i);
        }
      }
    } else {
      // Số đơn
      const num = parseInt(part);
      if (!isNaN(num)) {
        numbers.push(num);
      }
    }
  }
  
  return numbers;
}

/**
 * Parse CSV và xử lý merge cells
 */
function parseTeachingPlanCSV(csvText) {
  const rows = parseCsv(csvText);
  if (!rows || rows.length < 2) return [];
  
  const records = [];
  let lastWeek = null;
  let lastPeriod = null;
  
  // Bỏ qua header (dòng đầu)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 3) continue;
    
    const weekStr = (row[0] || '').trim();
    const periodStr = (row[1] || '').trim();
    const lesson = (row[2] || '').trim();
    
    // Xử lý merge cells: nếu ô trống, dùng giá trị từ dòng trước
    const currentWeek = weekStr || lastWeek;
    const currentPeriod = periodStr || lastPeriod;
    
    // Bỏ qua dòng không có dữ liệu
    if (!currentWeek && !currentPeriod && !lesson) continue;
    
    // Parse tuần và tiết
    const weeks = parseNumberRange(currentWeek);
    const periods = parseNumberRange(currentPeriod);
    
    // Nếu có tuần và tiết hợp lệ
    if (weeks.length > 0 && periods.length > 0 && lesson) {
      // Tạo record cho mỗi tổ hợp tuần-tiết
      for (const week of weeks) {
        for (const period of periods) {
          records.push({
            week: week,
            period: period,
            lesson: lesson
          });
        }
      }
    }
    
    // Cập nhật giá trị cuối cùng (để xử lý merge cells)
    if (weekStr) lastWeek = weekStr;
    if (periodStr) lastPeriod = periodStr;
  }
  
  return records;
}

/**
 * Lấy tuần hiện tại từ schoolWeek.js
 */
function getCurrentWeek() {
  if (typeof findCurrentSchoolWeek === "function") {
    const weekInfo = findCurrentSchoolWeek();
    return weekInfo ? weekInfo.week : null;
  }
  return null;
}

/**
 * Render lịch báo giảng theo tuần hiện tại cho một lớp
 */
function renderTeachingPlanForClass(records, currentWeek, container, statusEl, classLabel) {
  if (!container) return;

  const currentWeekRecords = records.filter(r => r.week === currentWeek);
  
  if (!currentWeekRecords || currentWeekRecords.length === 0) {
    container.innerHTML = `
      <div class="teaching-plan-empty">
        <p>Không có lịch báo giảng cho tuần ${currentWeek || 'hiện tại'}${classLabel ? ' (' + classLabel + ')' : ''}.</p>
      </div>
    `;
    if (statusEl) {
      statusEl.textContent = currentWeek 
        ? `Không có dữ liệu cho tuần ${currentWeek}${classLabel ? ' - ' + classLabel : ''}` 
        : "Không xác định được tuần hiện tại";
    }
    return;
  }
  
  currentWeekRecords.sort((a, b) => a.period - b.period);
  
  let html = `
    <div class="teaching-plan-info">
      <p><strong>Tuần ${currentWeek}</strong> - ${currentWeekRecords.length} tiết${classLabel ? ' (' + classLabel + ')' : ''}</p>
    </div>
    <table class="teaching-plan-table">
      <thead>
        <tr>
          <th>Tiết</th>
          <th>Bài dạy</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  currentWeekRecords.forEach(record => {
    html += `
      <tr>
        <td class="teaching-plan-period">Tiết ${record.period}</td>
        <td class="teaching-plan-lesson">${escapeHtml(record.lesson)}</td>
      </tr>
    `;
  });
  
  html += `
      </tbody>
    </table>
  `;
  
  container.innerHTML = html;
  
  if (statusEl) {
    statusEl.textContent = `Đã tải lịch báo giảng tuần ${currentWeek}${classLabel ? ' - ' + classLabel : ''}`;
  }
}

/**
 * Escape HTML để tránh XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Load và hiển thị lịch báo giảng cho một lớp
 */
async function loadTeachingPlanForClass(classKey, url, currentWeek, label) {
  const statusEl = document.getElementById(`teachingPlanStatus-${classKey}`);
  const container = document.getElementById(`teachingPlanContent-${classKey}`);
  
  if (!statusEl || !container) return;
  
  try {
    statusEl.textContent = `Đang tải lịch báo giảng ${label || ''}...`.trim();
    
    if (!url) {
      statusEl.textContent = "Chưa cấu hình URL Google Sheets cho lịch báo giảng.";
      container.innerHTML = '<p class="teaching-plan-empty">Chưa có URL CSV cho lớp này.</p>';
      return;
    }

    let fetchUrl = normalizeSheetUrl(url);
    // Cache buster để tránh dùng lại dữ liệu cũ
    fetchUrl += (fetchUrl.includes("?") ? "&" : "?") + "nocache=" + Date.now();
    
    const response = await fetch(fetchUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    if (!csvText || !csvText.trim()) {
      throw new Error("Không có dữ liệu từ Google Sheets");
    }
    
    const records = parseTeachingPlanCSV(csvText);
    if (!records || records.length === 0) {
      statusEl.textContent = "Không đọc được dữ liệu lịch báo giảng.";
      container.innerHTML = '<p class="teaching-plan-empty">Không có dữ liệu.</p>';
      return;
    }

    // Lưu state cho điều hướng tuần
    const weeks = Array.from(new Set(records.map(r => r.week))).sort((a,b)=>a-b);
    let displayWeek = currentWeek && weeks.includes(currentWeek) ? currentWeek : (weeks[0] || null);
    teachingPlanState[classKey] = {
      records,
      weeks,
      currentWeek: displayWeek,
      label
    };

    renderTeachingPlanForClass(records, displayWeek, container, statusEl, label);
    updateTeachingPlanWeekLabel(classKey);
    
  } catch (error) {
    console.error("Error loading teaching plan:", error);
    statusEl.textContent = `Lỗi: ${error.message}`;
    container.innerHTML = `
      <div class="teaching-plan-error">
        <p>Không tải được lịch báo giảng.</p>
        <p><small>${error.message}</small></p>
      </div>
    `;
  }
}

/**
 * Load và hiển thị lịch báo giảng cho tất cả lớp cấu hình
 */
async function loadTeachingPlan() {
  const currentWeek = getCurrentWeek();
  if (!currentWeek) {
    const container = document.getElementById("teachingPlanContent-lop11") || document.getElementById("teachingPlanContent-lop12");
    const statusEl = document.getElementById("teachingPlanStatus-lop11") || document.getElementById("teachingPlanStatus-lop12");
    if (statusEl) statusEl.textContent = "Không xác định được tuần học hiện tại.";
    if (container) {
      container.innerHTML = '<p class="teaching-plan-empty">Vui lòng kiểm tra cấu hình tuần học.</p>';
    }
    return;
  }

  const sheets =
    typeof TEACHING_PLAN_SHEETS !== "undefined" && TEACHING_PLAN_SHEETS
      ? TEACHING_PLAN_SHEETS
      : {};

  const entries = Object.entries(sheets);
  if (!entries.length) {
    console.warn("TEACHING_PLAN_SHEETS chưa được cấu hình.");
    return;
  }

  await Promise.all(
    entries.map(([key, url]) =>
      loadTeachingPlanForClass(key, url, currentWeek, key === "lop11" ? "Lớp 11" : key === "lop12" ? "Lớp 12" : key)
    )
  );
}

/**
 * State cho điều hướng tuần
 */
const teachingPlanState = {};

function updateTeachingPlanWeekLabel(classKey) {
  const labelEl = document.getElementById(`teachingPlanWeek-${classKey}`);
  const state = teachingPlanState[classKey];
  if (labelEl && state && state.currentWeek) {
    labelEl.textContent = `Tuần ${state.currentWeek}`;
  }
}

function changeTeachingPlanWeek(classKey, delta) {
  const state = teachingPlanState[classKey];
  if (!state) return;
  const idx = state.weeks.indexOf(state.currentWeek);
  if (idx === -1) return;
  const nextIdx = idx + delta;
  if (nextIdx < 0 || nextIdx >= state.weeks.length) return;
  state.currentWeek = state.weeks[nextIdx];

  const container = document.getElementById(`teachingPlanContent-${classKey}`);
  const statusEl = document.getElementById(`teachingPlanStatus-${classKey}`);
  renderTeachingPlanForClass(state.records, state.currentWeek, container, statusEl, state.label);
  updateTeachingPlanWeekLabel(classKey);
}

function teachingPlanPrev(classKey) {
  changeTeachingPlanWeek(classKey, -1);
}

function teachingPlanNext(classKey) {
  changeTeachingPlanWeek(classKey, 1);
}

// Expose to window
window.teachingPlanPrev = teachingPlanPrev;
window.teachingPlanNext = teachingPlanNext;

/**
 * Khởi tạo module
 */
function initTeachingPlan() {
  // Đợi schoolWeek.js load xong
  if (typeof findCurrentSchoolWeek === "function") {
    loadTeachingPlan();
  } else {
    // Retry sau 100ms
    setTimeout(initTeachingPlan, 100);
  }
}

