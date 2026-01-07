// Cấu hình có thể thay đổi cho Web Làm Việc
// Chỉnh sửa các giá trị trong file này là đủ, không cần đụng vào index.html

// Danh sách sheet Google Sheets dùng cho "TRỢ THỦ TRI BÀI"
// Key: mã lớp, Value: URL CSV đã Publish to web
const WHEEL_SHEETS_CONFIG = {
  "11B1":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQBGeRBBa8NlNAya3UcL7T0qI0jI2HVN20ibhrrpBX2w_58qRidrm2jlXmMws05Bqu6Gd1uRIdv_4Q_/pub?gid=0&single=true&output=csv",
  "12C1":
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQBGeRBBa8NlNAya3UcL7T0qI0jI2HVN20ibhrrpBX2w_58qRidrm2jlXmMws05Bqu6Gd1uRIdv_4Q_/pub?gid=1446670802&single=true&output=csv"
};

// Các mốc đếm ngược chính trong năm
const EXAM_PHASES_CONFIG = [
  { label: "Thi học kỳ 1: 29/12/2025", time: "2025-12-29T00:00:00" },
  { label: "Thi học kỳ 2: 04/05/2026", time: "2026-05-04T00:00:00" },
  { label: "Thi tốt nghiệp THPT: 12/06/2026", time: "2026-06-12T00:00:00" }
];

// Mốc thi Học sinh giỏi
const HSG_EXAM_TIME_CONFIG = "2026-03-12T00:00:00";

// URL Google Sheets cho Thời Khóa Biểu (CSV format)
const TIMETABLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSg6G7zmzBAa2Qodj30H5DGd9jEqO9q07Z20tMPmUJz61eKvMAadqf9NjVq6jjOHw/pub?gid=484115559&single=true&output=csv";

// Link để chỉnh sửa/cập nhật Thời Khóa Biểu trên Google Sheets
const TIMETABLE_EDIT_URL = "https://docs.google.com/spreadsheets/d/1LF78-08bL93xfCu9hdps4OXm2BiJhzXs/edit?usp=sharing&ouid=108769202968830582103&rtpof=true&sd=true";

// Link chỉnh sửa Lịch Báo Giảng
const TEACHING_PLAN_EDIT_URL = "https://docs.google.com/spreadsheets/d/1t7hApGRdGGOLHGi1P2AxTtW6pe_gp-n1ooTDZindiYQ/edit?usp=sharing";

// URL Google Sheets cho Lịch Báo Giảng (CSV format)
// Cột A: Tuần (số hoặc nhiều số cách nhau bằng dấu phẩy)
// Cột B: Tiết thứ (số hoặc nhiều số cách nhau bằng dấu phẩy)
// Cột C: Bài dạy (tên bài)
// Bạn có thể dùng 2 sheet riêng: "Lop 11" và "Lop 12"
// và publish mỗi sheet ra CSV với gid khác nhau.
// Ví dụ bên dưới dùng cùng 1 URL, hãy thay bằng URL CSV thật của từng sheet.
const TEACHING_PLAN_SHEETS = {
  // Lớp 11 (gid=0) - link pubhtml như bạn cung cấp, code sẽ tự chuyển output=csv
  lop11: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8nwCjK3JbM_h6XH-2CLtIMrZ-t6BDxuAvvuz3dOPmk33M5kC3tMX0A0p__m_s8O5fCaQkHKvmR4vf/pubhtml?gid=0&single=true",
  // Lớp 12 (gid=1646673641)
  lop12: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8nwCjK3JbM_h6XH-2CLtIMrZ-t6BDxuAvvuz3dOPmk33M5kC3tMX0A0p__m_s8O5fCaQkHKvmR4vf/pubhtml?gid=1646673641&single=true"
};

// URL Google Sheets cho "Chỉ tiêu trong năm" (dùng link pubhtml, code sẽ tự chuyển CSV)
const TARGETS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSBt8nDRD0o0SYz36YSeLPIoRBTUkgU9UiTG_A8Fgp99TGmmZG5wJT8pAU0yzhPBBhabDVFbjWXgYbc/pubhtml";

// Khung tuần năm học
const SCHOOL_WEEKS_CONFIG = [
  { week: 1, from: "05/09/2025", to: "13/09/2025", note: "Khai giảng 05/09" },
  { week: 2, from: "15/09/2025", to: "20/09/2025", note: "" },
  { week: 3, from: "22/09/2025", to: "27/09/2025", note: "" },
  { week: 4, from: "29/09/2025", to: "04/10/2025", note: "" },
  { week: 5, from: "06/10/2025", to: "11/10/2025", note: "" },
  { week: 6, from: "13/10/2025", to: "18/10/2025", note: "" },
  { week: 7, from: "20/10/2025", to: "25/10/2025", note: "" },
  { week: 8, from: "27/10/2025", to: "01/11/2025", note: "" },
  { week: 9, from: "03/11/2025", to: "08/11/2025", note: "" },
  { week: 10, from: "10/11/2025", to: "15/11/2025", note: "" },
  { week: 11, from: "17/11/2025", to: "22/11/2025", note: "Chào mừng ngày Nhà giáo VN 20/11" },
  { week: 12, from: "24/11/2025", to: "29/11/2025", note: "" },
  { week: 13, from: "01/12/2025", to: "06/12/2025", note: "" },
  { week: 14, from: "08/12/2025", to: "13/12/2025", note: "" },
  { week: 15, from: "15/12/2025", to: "20/12/2025", note: "Kiểm tra cuối kỳ I" },
  { week: 16, from: "22/12/2025", to: "27/12/2025", note: "" },
  { week: 17, from: "29/12/2025", to: "03/01/2026", note: "Nghỉ Tết Dương lịch (01/01)" },
  { week: 18, from: "05/01/2026", to: "10/01/2026", note: "Sơ kết HK I" },
  { week: 19, from: "12/01/2026", to: "17/01/2026", note: "Bắt đầu HK II" },
  { week: 20, from: "19/01/2026", to: "24/01/2026", note: "" },
  { week: 21, from: "26/01/2026", to: "31/01/2026", note: "" },
  { week: 22, from: "02/02/2026", to: "07/02/2026", note: "" },
  { week: 23, from: "09/02/2026", to: "11/02/2026", note: "Học 3 ngày đầu tuần rồi nghỉ Tết" },
  { week: 24, from: "26/02/2026", to: "07/03/2026", note: "Bắt đầu học lại sau Tết" },
  { week: 25, from: "09/03/2026", to: "14/03/2026", note: "" },
  { week: 26, from: "16/03/2026", to: "21/03/2026", note: "" },
  { week: 27, from: "23/03/2026", to: "28/03/2026", note: "Giỗ Tổ Hùng Vương (26/03 DL)" },
  { week: 28, from: "30/03/2026", to: "04/04/2026", note: "" },
  { week: 29, from: "06/04/2026", to: "11/04/2026", note: "" },
  { week: 30, from: "13/04/2026", to: "18/04/2026", note: "" },
  { week: 31, from: "20/04/2026", to: "25/04/2026", note: "" },
  { week: 32, from: "27/04/2026", to: "02/05/2026", note: "Nghỉ lễ 30/04 và 01/05" },
  { week: 33, from: "04/05/2026", to: "09/05/2026", note: "Kiểm tra cuối kỳ II" },
  { week: 34, from: "11/05/2026", to: "16/05/2026", note: "" },
  { week: 35, from: "18/05/2026", to: "23/05/2026", note: "Tổng kết năm học" }
];


