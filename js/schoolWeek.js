/**
 * schoolWeek.js - Xử lý hiển thị tuần học hiện tại trong năm học
 */

// Lấy config từ config.js
const SCHOOL_WEEKS =
  typeof SCHOOL_WEEKS_CONFIG !== "undefined" ? SCHOOL_WEEKS_CONFIG : [];

/**
 * Parse ngày định dạng Việt Nam (dd/mm/yyyy)
 */
function parseVNDate(str) {
  const [d, m, y] = str.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

/**
 * Tìm tuần học hiện tại dựa vào ngày hôm nay
 */
function findCurrentSchoolWeek() {
  const today = new Date();
  let chosen = null;
  let closest = null;
  let minDiff = Infinity;

  for (const w of SCHOOL_WEEKS) {
    const from = parseVNDate(w.from);
    const to = parseVNDate(w.to);
    if (!from || !to) continue;

    if (today >= from && today <= to) {
      chosen = w;
      break;
    }

    const diff = Math.min(Math.abs(today - from), Math.abs(today - to));
    if (diff < minDiff) {
      minDiff = diff;
      closest = w;
    }
  }

  return chosen || closest || null;
}

/**
 * Khởi tạo hiển thị tuần học hiện tại
 */
function initSchoolWeek() {
  const weekBtn = document.getElementById("week-button");
  const w = findCurrentSchoolWeek();
  
  if (weekBtn && w) {
    const label = `Tuần ${w.week}: ${w.from} → ${w.to}`;
    weekBtn.textContent = label;
    if (w.note) {
      weekBtn.title = w.note;
    }
  }
}

