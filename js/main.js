/**
 * main.js - File khởi tạo chính, điều phối các module
 */

/**
 * Khởi tạo tất cả các module khi DOM đã sẵn sàng
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing modules...");
  
  // Thiết lập link cập nhật lịch dạy từ config
  const updateLink = document.getElementById("timetable-update-link");
  if (updateLink && typeof TIMETABLE_EDIT_URL !== "undefined") {
    updateLink.href = TIMETABLE_EDIT_URL;
  }
  
  // Khởi tạo các module
  if (typeof initWheel === "function") {
    initWheel();
  }
  
  if (typeof initTimetableToggle === "function") {
    initTimetableToggle();
  }
  
  if (typeof loadTimetable === "function") {
    loadTimetable();
  }
  
  if (typeof initCountdown === "function") {
    initCountdown();
  }
  
  if (typeof initSchoolWeek === "function") {
    initSchoolWeek();
  }
  
  console.log("All modules initialized.");
});

