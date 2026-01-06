const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");
const scheduleContainer = document.querySelector("#schedule-container");
const sheetFrame = document.querySelector(".sheet-frame");
const todoForm = document.querySelector("#todo-form");
const todoInput = document.querySelector("#todo-input");
const todoList = document.querySelector("#todo-list");
const todoClear = document.querySelector("#todo-clear");
const todayLabel = document.querySelector("#today-label");
const todayClasses = document.querySelector("#today-classes");
const todayTodos = document.querySelector("#today-todos");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    nav?.classList.toggle("open");
  });
}

// Hiển thị thứ hiện tại (VI)
const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
const now = new Date();
if (todayLabel) {
  todayLabel.textContent = days[now.getDay()];
}

// TODO list lưu trong localStorage
const STORAGE_KEY = "teacher-math-todos";

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderTodos() {
  if (!todoList) return;
  const items = loadTodos();
  todoList.innerHTML = "";
  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "todo-item" + (item.done ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = item.done;
    checkbox.addEventListener("change", () => {
      const updated = loadTodos();
      updated[index].done = !updated[index].done;
      saveTodos(updated);
      renderTodos();
      updateTodoCount();
    });

    const span = document.createElement("span");
    span.textContent = item.text;

    li.appendChild(checkbox);
    li.appendChild(span);
    todoList.appendChild(li);
  });
}

function updateTodoCount() {
  if (!todayTodos) return;
  const items = loadTodos();
  const remaining = items.filter((i) => !i.done).length;
  todayTodos.textContent = `${remaining} mục`;
}

if (todoForm && todoInput && todoList && todoClear) {
  renderTodos();
  updateTodoCount();

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    const items = loadTodos();
    items.unshift({ text, done: false, createdAt: Date.now() });
    saveTodos(items);
    todoInput.value = "";
    renderTodos();
    updateTodoCount();
  });

  todoClear.addEventListener("click", () => {
    const items = loadTodos().filter((i) => !i.done);
    saveTodos(items);
    renderTodos();
    updateTodoCount();
  });
}

// --- Lịch dạy từ Google Sheets (CSV) ---
// Link gốc bạn đưa: https://docs.google.com/spreadsheets/d/e/2PACX-1vSg6G7zmzBAa2Qodj30H5DGd9jEqO9q07Z20tMPmUJz61eKvMAadqf9NjVq6jjOHw/pubhtml?gid=484115559&single=true
// Dạng CSV tương ứng:
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg6G7zmzBAa2Qodj30H5DGd9jEqO9q07Z20tMPmUJz61eKvMAadqf9NjVq6jjOHw/pub?gid=484115559&single=true&output=csv";

function parseCSV(text) {
  const rows = text.split(/\r?\n/).filter((r) => r.trim() !== "");
  return rows.map((row) => {
    const cells = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQuotes && row[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    cells.push(current);
    return cells.map((c) => c.trim());
  });
}

function normalizeKey(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function normaliseDay(value) {
  const v = value.toLowerCase();
  if (v.includes("hai")) return "Thứ hai";
  if (v.includes("ba")) return "Thứ ba";
  if (v.includes("tư") || v.includes("4")) return "Thứ tư";
  if (v.includes("năm") || v.includes("5")) return "Thứ năm";
  if (v.includes("sáu") || v.includes("6")) return "Thứ sáu";
  if (v.includes("bảy") || v.includes("7")) return "Thứ bảy";
  if (v.includes("cn") || v.includes("chủ")) return "Chủ nhật";
  return value;
}

function dayIndex(label) {
  return days.indexOf(label);
}

function renderScheduleFromSheet(records) {
  if (!scheduleContainer) return;
  scheduleContainer.innerHTML = "";

  // Gom theo thứ
  const byDay = {};
  records.forEach((r) => {
    const day = normaliseDay(r.thu || "");
    if (!day) return;
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(r);
  });

  const orderedDays = days.filter((d) => byDay[d]);

  // Tính số tiết hôm nay
  if (todayClasses) {
    const todayLabelText = days[now.getDay()];
    const todayList = byDay[todayLabelText] || [];
    todayClasses.textContent = `${todayList.length} tiết`;
  }

  orderedDays.forEach((day) => {
    const card = document.createElement("article");
    card.className = "card day-card";

    const h3 = document.createElement("h3");
    h3.textContent = day;
    card.appendChild(h3);

    const ul = document.createElement("ul");
    ul.className = "list list--compact";

    // Sắp xếp theo tiết / buổi nếu có
    const items = byDay[day].slice().sort((a, b) => {
      const t1 = parseInt(a.tiet || a.buoi || "0", 10) || 0;
      const t2 = parseInt(b.tiet || b.buoi || "0", 10) || 0;
      return t1 - t2;
    });

    items.forEach((item) => {
      const li = document.createElement("li");
      const tiet = item.tiet || item.buoi || "";
      const lop = item.lop || item.lop_hoc || "";
      const mon = item.mon || "Toán";
      const phong = item.phong || item.phòng || "";

      const strong = document.createElement("strong");
      strong.textContent = tiet ? `Tiết ${tiet}` : "Tiết";

      li.appendChild(strong);
      li.append(" · ");
      li.append(lop || "Lớp");
      if (mon) {
        li.append(" · ");
        li.append(mon);
      }
      if (phong) {
        li.append(" · Phòng ");
        li.append(phong);
      }
      ul.appendChild(li);
    });

    if (!items.length) {
      const li = document.createElement("li");
      li.textContent = "Không có tiết dạy.";
      ul.appendChild(li);
    }

    card.appendChild(ul);
    scheduleContainer.appendChild(card);
  });
}

function setScheduleMessage(html) {
  if (scheduleContainer) {
    scheduleContainer.innerHTML = `<p class="subtext">${html}</p>`;
  }
}

async function loadSchedule() {
  if (!scheduleContainer) return;
  try {
    setScheduleMessage("Đang tải thời khóa biểu từ Google Sheets...");
    const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
    if (!res.ok) {
      setScheduleMessage("Không tải được thời khóa biểu (fetch không thành công). Kiểm tra trạng thái Publish to web của Google Sheets và kết nối mạng.");
      return;
    }
    const text = await res.text();
    if (!text.trim()) {
      setScheduleMessage("Không có dữ liệu trả về từ Google Sheets. Hãy kiểm tra lại link CSV (Publish to web).");
      return;
    }
    const rows = parseCSV(text);
    if (!rows.length) {
      setScheduleMessage("Không đọc được dữ liệu thời khóa biểu.");
      return;
    }
    const headers = rows[0].map((h) => normalizeKey(h || ""));
    const records = rows.slice(1).map((cells) => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = cells[idx] || "";
      });
      return {
        thu: obj["thu"] || obj["thứ"] || obj["ngay"],
        buoi: obj["buoi"] || obj["buoi hoc"] || obj["buoi1"],
        tiet: obj["tiet"] || obj["tietday"],
        lop: obj["lop"] || obj["lophoc"] || obj["lopday"],
        lop_hoc: obj["lophoc"] || obj["lop hoc"],
        mon: obj["mon"] || obj["monhoc"] || "Toán",
        phong: obj["phong"] || obj["phonghoc"] || obj["phongban"],
      };
    });
    const hasData = records.some((r) => r.thu || r.tiet || r.buoi || r.lop);
    if (!hasData) {
      const headerPreview = headers.join(", ");
      setScheduleMessage(
        `Không thấy cột phù hợp. Kiểm tra tên cột: Thứ, Buổi/Tiết, Lớp, Môn, Phòng.<br>Headers đọc được: ${headerPreview}`
      );
      return;
    }
    renderScheduleFromSheet(records);
  } catch (e) {
    console.error(e);
    setScheduleMessage(
      `Không tải được thời khóa biểu. Kiểm tra lại link Google Sheets (đã Publish to web ở dạng CSV) hoặc kết nối mạng.<br><small>${SHEET_CSV_URL}</small>`
    );
  }
}

loadSchedule();

// Tự động scale Google Sheet theo độ rộng trang
function rescaleSheet() {
  if (!sheetFrame || !sheetFrame.parentElement) return;
  const wrapper = sheetFrame.parentElement;
  const baseWidth = 1200;
  const baseHeight = 520;
  const wrapperWidth = wrapper.clientWidth || baseWidth;
  const scale = wrapperWidth / baseWidth;
  sheetFrame.style.transform = `scale(${scale})`;
  wrapper.style.height = `${baseHeight * scale}px`;
}

window.addEventListener("resize", rescaleSheet);
rescaleSheet();
