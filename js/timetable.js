/**
 * timetable.js - Xử lý thời khóa biểu từ Google Sheets
 */

// Lấy config từ config.js
const TIMETABLE_URL = typeof TIMETABLE_SHEET_URL !== "undefined" ? TIMETABLE_SHEET_URL : null;

// Flag để tránh load đồng thời nhiều lần
let isLoadingTimetable = false;

/**
 * Map tên thứ sang index cột (Hai=1, Ba=2, Tư=3, Năm=4, Sáu=5, Bảy=6, CN=7)
 */
function getDayIndex(dayName) {
  const day = dayName.toLowerCase().trim();
  const map = {
    "hai": 1, "thứ hai": 1, "2": 1,
    "ba": 2, "thứ ba": 2, "3": 2,
    "tư": 3, "thứ tư": 3, "4": 3,
    "năm": 4, "thứ năm": 4, "5": 4,
    "sáu": 5, "thứ sáu": 5, "6": 5,
    "bảy": 6, "thứ bảy": 6, "7": 6,
    "cn": 7, "chủ nhật": 7, "sunday": 7
  };
  for (const [key, idx] of Object.entries(map)) {
    if (day.includes(key)) return idx;
  }
  return -1;
}

/**
 * Render bảng thời khóa biểu từ grid data
 */
function renderTimetableGrid(tableId, gridData) {
  const table = document.getElementById(tableId);
  if (!table) {
    console.error(`Table ${tableId} not found`);
    return;
  }

  // Xác định tbody ID theo tableId
  let tbodyId;
  if (tableId === "timetable-morning") {
    tbodyId = "timetable-morning-body";
  } else if (tableId === "timetable-afternoon") {
    tbodyId = "timetable-afternoon-body";
  } else if (tableId === "timetable-evening") {
    tbodyId = "timetable-evening-body";
  } else {
    tbodyId = null;
  }

  let tbody = tbodyId ? document.getElementById(tbodyId) : null;
  if (!tbody) {
    tbody = table.querySelector("tbody");
  }
  if (!tbody) {
    console.error(`Tbody not found for ${tableId}`);
    return;
  }

  // XÓA SẠCH DỮ LIỆU CŨ
  tbody.innerHTML = "";

  // Số tiết hiển thị: sáng/chiều 5 tiết, tối chỉ 2 tiết
  const totalPeriods = tableId === "timetable-evening" ? 2 : 5;

  // Đảm bảo gridData có đủ số hàng cần thiết và 7 cột (Hai-Bảy-CN)
  while (gridData.length < totalPeriods) {
    gridData.push(Array(7).fill(null));
  }

  // Render từ grid data
  for (let period = 1; period <= totalPeriods; period++) {
    const tr = document.createElement("tr");
    const periodTd = document.createElement("td");
    periodTd.textContent = period;
    tr.appendChild(periodTd);

    const rowIdx = period - 1;
    const rowData = gridData[rowIdx] || Array(7).fill(null);

    for (let dayIdx = 1; dayIdx <= 7; dayIdx++) {
      const colIdx = dayIdx - 1;
      const cellValue = rowData[colIdx];

      const td = document.createElement("td");
      if (cellValue && String(cellValue).trim() !== "" && String(cellValue).trim() !== "null") {
        td.textContent = cellValue;

        // Áp dụng màu tự động theo lớp học
        const color = getClassColor(cellValue);
        if (color) {
          td.style.background = color.bg;
          td.style.color = color.text;
          td.style.fontWeight = "600";
          td.style.cursor = "help";
          td.style.transition = "all 0.2s ease";

          // Thêm hover effect
          td.addEventListener("mouseenter", function () {
            this.style.transform = "scale(1.05)";
            this.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
          });
          td.addEventListener("mouseleave", function () {
            this.style.transform = "scale(1)";
            this.style.boxShadow = "none";
          });
        }

        // Thêm tooltip cho các lớp GVCN dạy
        const classLower = String(cellValue).toLowerCase().trim();
        if (classLower.includes("12c1") || classLower.includes("11b1") || classLower.includes("12c3")) {
          td.setAttribute("data-tooltip", "Võ Thanh Phong");
          td.setAttribute("data-tooltip-gvcn", "");
        }
      } else {
        td.textContent = "-";
      }
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  console.log(`Rendered ${tableId}: ${totalPeriods} rows created`);
}

/**
 * Load và parse thời khóa biểu từ Google Sheets
 */
async function loadTimetable() {
  // Tránh load đồng thời nhiều lần
  if (isLoadingTimetable) {
    console.log("Timetable đang được load, bỏ qua request này");
    return;
  }

  const statusEl = document.getElementById("timetable-status");
  if (!TIMETABLE_URL) {
    if (statusEl) statusEl.textContent = "Chưa cấu hình URL thời khóa biểu.";
    return;
  }

  isLoadingTimetable = true;

  try {
    if (statusEl) {
      statusEl.textContent = "Đang tải thời khóa biểu từ Google Sheets...";
      statusEl.style.color = "#555";
      statusEl.style.display = "block";
    }

    // RESET CACHE MÀU mỗi lần load
    resetColorCache();
    console.log("Reset color cache");

    // XÓA SẠCH DỮ LIỆU CŨ TRƯỚC
    const morningBody = document.getElementById("timetable-morning-body");
    const afternoonBody = document.getElementById("timetable-afternoon-body");
    const eveningBody = document.getElementById("timetable-evening-body");
    if (morningBody) morningBody.innerHTML = "";
    if (afternoonBody) afternoonBody.innerHTML = "";
    if (eveningBody) eveningBody.innerHTML = "";

    // Gọi API serverless thay vì truy cập trực tiếp Google Sheets
    const resp = await fetch('/api/get-timetable', { cache: "no-store" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const text = await resp.text();
    console.log("CSV raw text (first 2000 chars):", text.substring(0, 2000));

    const rows = parseCsv(text);
    console.log("Parsed rows count:", rows.length);
    console.log("First 10 rows:", rows.slice(0, 10));

    if (!rows.length) throw new Error("Không có dữ liệu");

    // Tìm header row với các cột: TIẾT, T2, T3, T4, T5, T6, T7, CN
    let headerRowIdx = -1;
    let colMap = {};

    // Thử tìm header trong 15 dòng đầu
    for (let i = 0; i < Math.min(15, rows.length); i++) {
      const row = rows[i] || [];
      const rowLower = row.map(c => String(c || "").toLowerCase().trim());

      let foundTiet = false;
      let foundDays = 0;
      const tempColMap = {};

      rowLower.forEach((cell, idx) => {
        const cellLower = String(cell).toLowerCase().trim();
        if (cellLower === "tiết" || cellLower === "tiet" || cellLower === "period" || cellLower.includes("tiết")) {
          tempColMap.tiet = idx;
          foundTiet = true;
        }
        if (cellLower === "t2" || cellLower === "hai" || cellLower.includes("thứ hai") || cellLower === "mon" || cellLower === "monday") {
          tempColMap.t2 = idx;
          foundDays++;
        }
        if (cellLower === "t3" || cellLower === "ba" || cellLower.includes("thứ ba") || cellLower === "tue" || cellLower === "tuesday") {
          tempColMap.t3 = idx;
          foundDays++;
        }
        if (cellLower === "t4" || cellLower === "tư" || cellLower.includes("thứ tư") || cellLower === "wed" || cellLower === "wednesday") {
          tempColMap.t4 = idx;
          foundDays++;
        }
        if (cellLower === "t5" || cellLower === "năm" || cellLower.includes("thứ năm") || cellLower === "thu" || cellLower === "thursday") {
          tempColMap.t5 = idx;
          foundDays++;
        }
        if (cellLower === "t6" || cellLower === "sáu" || cellLower.includes("thứ sáu") || cellLower === "fri" || cellLower === "friday") {
          tempColMap.t6 = idx;
          foundDays++;
        }
        if (cellLower === "t7" || cellLower === "bảy" || cellLower.includes("thứ bảy") || cellLower === "sat" || cellLower === "saturday") {
          tempColMap.t7 = idx;
          foundDays++;
        }
        if (cellLower === "cn" || cellLower.includes("chủ nhật") || cellLower === "sun" || cellLower === "sunday") {
          tempColMap.cn = idx;
          foundDays++;
        }
      });

      // Nếu tìm thấy ít nhất TIẾT và 2 cột thứ trở lên
      if (foundTiet && foundDays >= 2) {
        headerRowIdx = i;
        colMap = tempColMap;
        console.log(`Found header at row ${i} with ${foundDays} day columns`);
        break;
      }

      // Nếu không tìm thấy TIẾT nhưng có nhiều cột thứ
      if (!foundTiet && foundDays >= 4) {
        headerRowIdx = i;
        colMap = tempColMap;
        colMap.tiet = 0; // Giả định cột đầu là TIẾT
        console.log(`Found header at row ${i} (no TIẾT column, assuming first column is TIẾT)`);
        break;
      }
    }

    if (headerRowIdx === -1) {
      console.error("Could not find header row. First 10 rows:", rows.slice(0, 10));
      throw new Error("Không tìm thấy header row với định dạng TIẾT, T2-T7, CN. Xem Console để biết chi tiết.");
    }

    console.log("Header row index:", headerRowIdx);
    console.log("Column mapping:", colMap);

    // Map cột thứ sang index trong bảng HTML
    const dayColMap = {
      t2: 1, // Hai
      t3: 2, // Ba
      t4: 3, // Tư
      t5: 4, // Năm
      t6: 5, // Sáu
      t7: 6, // Bảy
      cn: 7  // Chủ Nhật
    };

    // Parse dữ liệu từ dòng sau header
    const morningData = Array(5).fill(null).map(() => Array(7).fill(null));
    const afternoonData = Array(5).fill(null).map(() => Array(7).fill(null));
    const eveningData = Array(5).fill(null).map(() => Array(7).fill(null));

    let currentSession = "morning"; // mặc định là sáng
    let countAdded = 0;

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i] || [];
      if (row.length === 0) continue;

      const firstCell = String(row[0] || "").trim().toLowerCase();
      const firstCellFull = String(row[0] || "").trim();

      // Kiểm tra nếu là marker buổi
      let isSessionMarker = false;
      if (firstCell.includes("7h") || firstCell.includes("sáng") || firstCell === "morning" || firstCellFull.match(/^7[:\s]/i)) {
        currentSession = "morning";
        isSessionMarker = true;
      }
      if (firstCell.includes("2h") || firstCell.includes("chiều") || firstCell === "afternoon" || firstCellFull.match(/^2[:\s]/i)) {
        currentSession = "afternoon";
        isSessionMarker = true;
      }
      if (firstCell.includes("20h30") || firstCell.includes("20h") || firstCell.includes("tối") || firstCell.includes("evening") || firstCellFull.match(/^20[:\s]/i)) {
        currentSession = "evening";
        isSessionMarker = true;
      }
      if (firstCell.includes("nghỉ") || firstCell.includes("break") || firstCell.includes("rest")) {
        continue; // Bỏ qua dòng nghỉ
      }

      // Lấy số tiết từ cột TIẾT
      let periodStr = "";
      let period = null;

      if (colMap.tiet !== undefined && row[colMap.tiet] !== undefined && row[colMap.tiet] !== null) {
        periodStr = String(row[colMap.tiet]).trim();
        period = parseInt(periodStr);
        if (period >= 1 && period <= 5) {
          // Đã tìm thấy số tiết hợp lệ
        } else {
          period = null;
        }
      }

      // Nếu không có từ cột TIẾT, tìm số trong các cột từ index 1 trở đi
      if (!period || period < 1 || period > 5) {
        for (let j = 1; j < Math.min(6, row.length); j++) {
          const testStr = String(row[j] || "").trim();
          if (testStr.toLowerCase().includes("7h") || testStr.toLowerCase().includes("2h") ||
            testStr.toLowerCase().includes("20h") || testStr.toLowerCase().includes("20h30") ||
            testStr.toLowerCase().includes("sáng") || testStr.toLowerCase().includes("chiều") ||
            testStr.toLowerCase().includes("tối") || testStr.toLowerCase().includes("evening")) {
            continue;
          }
          const testNum = parseInt(testStr);
          if (testNum >= 1 && testNum <= 5) {
            period = testNum;
            periodStr = testStr;
            break;
          }
        }
      }

      // Nếu vẫn không có và không phải session marker, thử từ cột đầu tiên
      if ((!period || period < 1 || period > 5) && !isSessionMarker && row[0]) {
        const firstStr = String(row[0]).trim();
        if (!firstStr.toLowerCase().includes("7h") && !firstStr.toLowerCase().includes("2h") &&
          !firstStr.toLowerCase().includes("20h") && !firstStr.toLowerCase().includes("20h30") &&
          !firstStr.toLowerCase().includes("sáng") && !firstStr.toLowerCase().includes("chiều") &&
          !firstStr.toLowerCase().includes("tối") && !firstStr.toLowerCase().includes("evening")) {
          periodStr = firstStr;
          period = parseInt(periodStr);
          if (period >= 1 && period <= 5) {
            // OK
          } else {
            period = null;
          }
        }
      }

      // Nếu không tìm thấy số tiết hợp lệ, bỏ qua
      if (!period || period < 1 || period > 5) {
        let hasData = false;
        for (const [dayKey, dayIdx] of Object.entries(dayColMap)) {
          const colIdx = colMap[dayKey];
          if (colIdx !== undefined && colIdx < row.length) {
            const cellValue = String(row[colIdx] || "").trim();
            if (cellValue && cellValue !== "-" && cellValue !== "" && cellValue.toLowerCase() !== "nghỉ") {
              hasData = true;
              break;
            }
          }
        }
        if (!hasData) {
          continue;
        } else {
          continue; // Có dữ liệu nhưng không có số tiết - bỏ qua
        }
      }

      const rowIdx = period - 1;
      let targetData;
      if (currentSession === "morning") {
        targetData = morningData;
      } else if (currentSession === "afternoon") {
        targetData = afternoonData;
      } else if (currentSession === "evening") {
        targetData = eveningData;
      } else {
        targetData = morningData; // fallback
      }

      // Đọc giá trị lớp từ các cột T2-T7 và CN
      for (const [dayKey, dayIdx] of Object.entries(dayColMap)) {
        const colIdx = colMap[dayKey];
        if (colIdx !== undefined && colIdx < row.length && row[colIdx] !== undefined && row[colIdx] !== null) {
          const cellValue = String(row[colIdx]).trim();
          if (cellValue && cellValue !== "-" && cellValue !== "" &&
            cellValue.toLowerCase() !== "nghỉ" && cellValue.toLowerCase() !== "null" &&
            cellValue.toLowerCase() !== "nghỉ ngơi" && cellValue.toLowerCase() !== "break") {
            const arrayIdx = dayIdx - 1;
            if (arrayIdx >= 0 && arrayIdx < 7 && rowIdx >= 0 && rowIdx < 5) {
              targetData[rowIdx][arrayIdx] = cellValue;
              countAdded++;
            }
          }
        }
      }
    }

    console.log(`Parsed sessions. Total cells filled: ${countAdded}`);

    // Render vào 3 bảng
    renderTimetableGrid("timetable-morning", morningData);
    renderTimetableGrid("timetable-afternoon", afternoonData);
    renderTimetableGrid("timetable-evening", eveningData);

    if (statusEl) {
      statusEl.textContent = `Đã tải ${countAdded} lớp học thành công.`;
      statusEl.style.color = "#27ae60";
      setTimeout(() => {
        statusEl.style.display = "none";
      }, 3000);
    }
  } catch (e) {
    console.error("Lỗi tải thời khóa biểu:", e);
    console.error("Stack:", e.stack);
    if (statusEl) {
      statusEl.textContent = `Lỗi: ${e.message}. Kiểm tra lại link CSV hoặc kết nối mạng. Mở Console (F12) để xem chi tiết.`;
      statusEl.style.color = "#e74c3c";
    }
  } finally {
    isLoadingTimetable = false;
  }
}

/**
 * Khởi tạo toggle ẩn/hiện thời khóa biểu
 */
function initTimetableToggle() {
  const timetableToggle = document.getElementById("timetable-toggle");
  const timetableContent = document.getElementById("timetable-content");

  if (timetableToggle && timetableContent) {
    timetableToggle.addEventListener("click", () => {
      timetableToggle.classList.toggle("collapsed");
      timetableContent.classList.toggle("collapsed");
    });
  }
}

