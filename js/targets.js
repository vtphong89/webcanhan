// targets.js - Hiển thị "Chỉ tiêu trong năm" từ Google Sheets

async function loadTargets() {
  const statusEl = document.getElementById("targets-status");
  const container = document.getElementById("targets-table-wrap");

  if (!statusEl || !container) return;

  try {
    statusEl.textContent = "Đang tải dữ liệu chỉ tiêu trong năm...";
    statusEl.style.color = "#555";

    // Gọi API serverless thay vì truy cập trực tiếp Google Sheets
    const resp = await fetch('/api/get-targets', { cache: "no-store" });
    if (!resp.ok) {
      throw new Error("HTTP " + resp.status);
    }
    const csvText = await resp.text();
    const rows = parseCsv(csvText);

    if (!rows || rows.length < 3) {
      statusEl.textContent = "Không đọc được dữ liệu chỉ tiêu.";
      return;
    }

    // Hàng 2: chỉ tiêu chủ nhiệm (index 1)
    const rowCN = rows[1] || [];
    const cnGood = parseFloat(rowCN[1] || 0) || 0;      // B2 - HS giỏi
    const cnWeak = parseFloat(rowCN[2] || 0) || 0;      // C2 - HS yếu
    const cnExcellent = parseFloat(rowCN[3] || 0) || 0; // D2 - HS xuất sắc
    const cnTotal = parseFloat(rowCN[4] || 0) || 0;     // E2 - Tổng

    // Hàng 3: chỉ tiêu giảng dạy (index 2)
    const rowTeach = rows[2] || [];
    const teachGood = parseFloat(rowTeach[1] || 0) || 0;  // B3 - HS giỏi
    const teachWeak = parseFloat(rowTeach[2] || 0) || 0;  // C3 - HS yếu
    const teachTotal = parseFloat(rowTeach[4] || 0) || 0; // E3 - Tổng

    const pct = (value, total) => {
      if (!total || total <= 0) return "-";
      return (value * 100 / total).toFixed(1) + "%";
    };

    const html = `
      <table class="teaching-plan-table targets-table">
        <thead>
          <tr>
            <th>Mục</th>
            <th>HS xuất sắc</th>
            <th>Tỷ lệ</th>
            <th>HS giỏi</th>
            <th>Tỷ lệ</th>
            <th>HS yếu</th>
            <th>Tỷ lệ</th>
            <th>Tổng số HS</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td data-label="Mục"><strong>Chủ nhiệm</strong></td>
            <td data-label="HS xuất sắc">${cnExcellent}</td>
            <td data-label="Tỷ lệ">${pct(cnExcellent, cnTotal)}</td>
            <td data-label="HS giỏi">${cnGood}</td>
            <td data-label="Tỷ lệ">${pct(cnGood, cnTotal)}</td>
            <td data-label="HS yếu">${cnWeak}</td>
            <td data-label="Tỷ lệ">${pct(cnWeak, cnTotal)}</td>
            <td data-label="Tổng số HS">${cnTotal}</td>
          </tr>
          <tr>
            <td data-label="Mục"><strong>Chỉ tiêu giảng dạy</strong></td>
            <td data-label="HS xuất sắc">-</td>
            <td data-label="Tỷ lệ">-</td>
            <td data-label="HS giỏi">${teachGood}</td>
            <td data-label="Tỷ lệ">${pct(teachGood, teachTotal)}</td>
            <td data-label="HS yếu">${teachWeak}</td>
            <td data-label="Tỷ lệ">${pct(teachWeak, teachTotal)}</td>
            <td data-label="Tổng số HS">${teachTotal}</td>
          </tr>
        </tbody>
      </table>
    `;

    container.innerHTML = html;
    statusEl.textContent = "Đã tải dữ liệu chỉ tiêu trong năm.";
    statusEl.style.color = "#27ae60";
  } catch (e) {
    console.error("Lỗi tải chỉ tiêu:", e);
    const statusEl2 = document.getElementById("targets-status");
    if (statusEl2) {
      statusEl2.textContent = "Lỗi tải chỉ tiêu: " + e.message;
      statusEl2.style.color = "#e74c3c";
    }
  }
}

function initTargets() {
  loadTargets();
}

function initTargetsToggle() {
  const toggle = document.getElementById("targets-toggle");
  const content = document.getElementById("targets-content");
  if (toggle && content) {
    toggle.addEventListener("click", () => {
      toggle.classList.toggle("collapsed");
      content.classList.toggle("collapsed");
    });
  }
}


