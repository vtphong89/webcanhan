/**
 * main.js - File khởi tạo chính, điều phối các module
 */

/**
 * Thiết lập link cập nhật lịch dạy từ config
 */
let retryCount = 0;
const MAX_RETRIES = 50; // Tối đa 5 giây (50 * 100ms)

function setupTimetableUpdateLink() {
  const updateLink = document.getElementById("timetable-update-link");
  if (updateLink) {
    // Đợi config.js load xong
    if (typeof TIMETABLE_EDIT_URL !== "undefined" && TIMETABLE_EDIT_URL) {
      updateLink.href = TIMETABLE_EDIT_URL;
      console.log("Timetable update link set from config");
      retryCount = 0; // Reset counter
    } else if (retryCount < MAX_RETRIES) {
      // Retry nếu config chưa load
      retryCount++;
      setTimeout(setupTimetableUpdateLink, 100);
    } else {
      console.warn("TIMETABLE_EDIT_URL not found in config.js after retries");
    }
  }
}

function setupTeachingPlanUpdateLink() {
  const updateLink = document.getElementById("teaching-plan-update-link");
  if (updateLink) {
    if (typeof TEACHING_PLAN_EDIT_URL !== "undefined" && TEACHING_PLAN_EDIT_URL) {
      updateLink.href = TEACHING_PLAN_EDIT_URL;
    } else {
      updateLink.href = "javascript:void(0)";
    }
  }
}

/**
 * Khởi tạo tất cả các module khi DOM đã sẵn sàng
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing modules...");
  
  // Thiết lập link cập nhật lịch dạy từ config
  setupTimetableUpdateLink();
  setupTeachingPlanUpdateLink();
  
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
  
  if (typeof initTeachingPlan === "function") {
    initTeachingPlan();
  }
  
  console.log("All modules initialized.");
});

// Đảm bảo link được set ngay cả khi scripts load không đúng thứ tự
window.addEventListener("load", () => {
  setupTimetableUpdateLink();
  setupTeachingPlanUpdateLink();
});

