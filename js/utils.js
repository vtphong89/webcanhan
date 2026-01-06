/**
 * utils.js - Các hàm tiện ích dùng chung
 */

/**
 * Parse CSV text thành mảng 2 chiều
 * @param {string} text - CSV text
 * @returns {Array<Array<string>>} - Mảng các hàng, mỗi hàng là mảng các cột
 */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i + 1];
    if (c === '"' && inQuotes && next === '"') {
      current += '"';
      i++;
    } else if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if ((c === "\n" || c === "\r") && !inQuotes) {
      if (current !== "" || row.length) {
        row.push(current);
        rows.push(row);
        row = [];
        current = "";
      }
    } else {
      current += c;
    }
  }
  if (current !== "" || row.length) {
    row.push(current);
    rows.push(row);
  }
  return rows;
}

/**
 * Mảng 20 màu sắc để tự động phân phối cho các lớp học
 */
const CLASS_COLORS = [
  { bg: "linear-gradient(135deg,#667eea,#764ba2)", text: "#fff" },      // 0: Tím
  { bg: "linear-gradient(135deg,#f093fb,#f5576c)", text: "#fff" },      // 1: Hồng
  { bg: "linear-gradient(135deg,#4facfe,#00f2fe)", text: "#fff" },      // 2: Xanh dương
  { bg: "linear-gradient(135deg,#fa709a,#fee140)", text: "#fff" },      // 3: Vàng hồng
  { bg: "linear-gradient(135deg,#43e97b,#38f9d7)", text: "#fff" },      // 4: Xanh lá
  { bg: "linear-gradient(135deg,#30cfd0,#330867)", text: "#fff" },      // 5: Xanh đậm
  { bg: "linear-gradient(135deg,#ff8a80,#ea6100)", text: "#fff" },      // 6: Cam đỏ
  { bg: "linear-gradient(135deg,#ffecd2,#fcb69f)", text: "#333" },      // 7: Cam nhạt
  { bg: "linear-gradient(135deg,#ffd700,#ffed4e)", text: "#333" },       // 8: Vàng
  { bg: "linear-gradient(135deg,#a8edea,#fed6e3)", text: "#333" },      // 9: Xanh hồng nhạt
  { bg: "linear-gradient(135deg,#84fab0,#8fd3f4)", text: "#333" },      // 10: Xanh lá nhạt
  { bg: "linear-gradient(135deg,#a1c4fd,#c2e9fb)", text: "#333" },      // 11: Xanh dương nhạt
  { bg: "linear-gradient(135deg,#d4fc79,#96e6a1)", text: "#333" },      // 12: Xanh vàng
  { bg: "linear-gradient(135deg,#ff9a9e,#fecfef)", text: "#333" },      // 13: Hồng nhạt
  { bg: "linear-gradient(135deg,#fbc2eb,#a6c1ee)", text: "#fff" },      // 14: Tím hồng
  { bg: "linear-gradient(135deg,#ffecd2,#fcb69f)", text: "#333" },      // 15: Cam be
  { bg: "linear-gradient(135deg,#a8c0ff,#3e7bfa)", text: "#fff" },      // 16: Xanh đậm
  { bg: "linear-gradient(135deg,#ff6b6b,#ee5a6f)", text: "#fff" },      // 17: Đỏ hồng
  { bg: "linear-gradient(135deg,#c471ed,#f64f59)", text: "#fff" },      // 18: Tím đỏ
  { bg: "linear-gradient(135deg,#12c2e9,#c471ed,#f64f59)", text: "#fff" } // 19: Cầu vồng
];

/**
 * Cache để lưu mapping lớp -> màu (đảm bảo cùng lớp cùng màu)
 */
const classColorCache = new Map();

/**
 * Hàm hash đơn giản để map tên lớp sang index màu
 * @param {string} className - Tên lớp học
 * @returns {number} - Index trong mảng CLASS_COLORS
 */
function hashClassName(className) {
  if (!className) return 0;
  const normalized = String(className).toLowerCase().trim().replace(/[^a-z0-9]/g, "");
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % CLASS_COLORS.length;
}

/**
 * Lấy màu cho lớp học (tự động và nhất quán)
 * @param {string} className - Tên lớp học
 * @returns {Object|null} - Object {bg, text} hoặc null
 */
function getClassColor(className) {
  if (!className) return null;
  
  const classLower = String(className).toLowerCase().trim();
  
  // Kiểm tra cache trước
  if (classColorCache.has(classLower)) {
    return classColorCache.get(classLower);
  }
  
  // Tính hash và lấy màu từ mảng
  const colorIndex = hashClassName(classLower);
  const color = CLASS_COLORS[colorIndex];
  
  // Lưu vào cache
  classColorCache.set(classLower, color);
  
  return color;
}

/**
 * Reset cache màu (dùng khi reload timetable)
 */
function resetColorCache() {
  classColorCache.clear();
}

