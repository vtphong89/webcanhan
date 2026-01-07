# Web Quản Lý Công Việc Giáo Viên

Trang web cá nhân dành cho giáo viên để quản lý công việc, lịch dạy, và các công cụ hỗ trợ giảng dạy.

## 📁 Cấu trúc dự án

```
Web ca nhan/
├── index.html          # File HTML chính
├── config.js           # File cấu hình (URLs Google Sheets, ngày thi, tuần học)
├── api/
│   └── get-news.js     # Serverless function để cào tin tức từ ToanMath.com
├── js/
│   ├── utils.js        # Các hàm tiện ích dùng chung
│   ├── wheel.js        # Xử lý vòng quay may mắn (TRỢ THỦ TRI BÀI)
│   ├── timetable.js    # Xử lý thời khóa biểu từ Google Sheets
│   ├── countdown.js    # Xử lý đếm ngược các mốc thi
│   ├── schoolWeek.js   # Xử lý hiển thị tuần học hiện tại
│   ├── teachingPlan.js # Xử lý lịch báo giảng
│   ├── targets.js      # Xử lý chỉ tiêu trong năm
│   ├── news.js         # Xử lý hiển thị tin tức toán học
│   └── main.js         # File khởi tạo chính, điều phối các module
├── package.json        # Dependencies cho serverless function
└── vercel.json         # Cấu hình Vercel
└── README.md           # File này
```

## 🔧 Các module JavaScript

### 1. `config.js`
File cấu hình tập trung, chứa:
- `WHEEL_SHEETS_CONFIG`: URLs Google Sheets cho danh sách học sinh từng lớp
- `EXAM_PHASES_CONFIG`: Các mốc thi quan trọng (HK1, HK2, TN THPT)
- `HSG_EXAM_TIME_CONFIG`: Ngày thi Học sinh giỏi
- `SCHOOL_WEEKS_CONFIG`: Lịch tuần học trong năm

**Cách sử dụng**: Chỉ cần chỉnh sửa file này để cập nhật cấu hình, không cần đụng vào các file khác.

### 2. `js/utils.js`
Các hàm tiện ích dùng chung:
- `parseCsv(text)`: Parse CSV text thành mảng 2 chiều
- `hashClassName(className)`: Hash tên lớp để map sang màu nhất quán
- `getClassColor(className)`: Lấy màu tự động cho lớp học (có cache)
- `resetColorCache()`: Reset cache màu khi reload timetable
- `CLASS_COLORS`: Mảng 20 màu sắc để phân phối cho các lớp

### 3. `js/wheel.js`
Module xử lý vòng quay may mắn (TRỢ THỦ TRI BÀI):
- `initWheel()`: Khởi tạo module, đăng ký event listeners
- `loadStudentsForClass(classId)`: Tải danh sách học sinh từ Google Sheets
- `spinRandom()`: Quay ngẫu nhiên chọn học sinh (có animation)

**Dependencies**: `config.js`, `utils.js` (parseCsv)

### 4. `js/timetable.js`
Module xử lý thời khóa biểu:
- `loadTimetable()`: Load và parse CSV từ Google Sheets
- `renderTimetableGrid(tableId, gridData)`: Render bảng thời khóa biểu
- `initTimetableToggle()`: Khởi tạo toggle ẩn/hiện thời khóa biểu
- `getDayIndex(dayName)`: Map tên thứ sang index cột

**Dependencies**: `config.js`, `utils.js` (parseCsv, getClassColor, resetColorCache)

### 5. `js/countdown.js`
Module xử lý đếm ngược:
- `renderCountdown()`: Render countdown cho các mốc thi chính (HK1, HK2, TN THPT)
- `renderHsgCountdown()`: Render countdown cho thi Học sinh giỏi
- `initCountdown()`: Khởi tạo timers, chạy countdown mỗi giây

**Dependencies**: `config.js`

### 6. `js/schoolWeek.js`
Module hiển thị tuần học hiện tại:
- `findCurrentSchoolWeek()`: Tìm tuần học hiện tại dựa vào ngày hôm nay
- `parseVNDate(str)`: Parse ngày định dạng Việt Nam (dd/mm/yyyy)
- `initSchoolWeek()`: Khởi tạo và hiển thị tuần học trên button

**Dependencies**: `config.js`

### 7. `js/news.js`
Module xử lý tin tức toán học:
- `fetchNews()`: Gọi API serverless function để lấy 10 bài viết mới nhất từ ToanMath.com
- `renderNews(articles)`: Hiển thị danh sách tin tức dạng card
- `initNews()`: Khởi tạo module, đăng ký toggle expand/collapse

**Dependencies**: API serverless function (`api/get-news.js`)

### 8. `api/get-news.js`
Serverless function (Vercel/Netlify):
- Cào dữ liệu từ ToanMath.com sử dụng axios và cheerio
- Cache dữ liệu trong 1 giờ để tránh cào quá nhiều
- Trả về JSON với 10 bài viết mới nhất (title, link, img)

**Dependencies**: `axios`, `cheerio` (cài đặt qua `npm install`)

### 9. `js/main.js`
File khởi tạo chính:
- Điều phối việc khởi tạo tất cả các module khi DOM đã sẵn sàng
- Đảm bảo thứ tự load đúng: config.js → utils.js → các module khác → main.js

## 📝 Thứ tự load script

Trong `index.html`, các script được load theo thứ tự:

```html
<script src="config.js"></script>          <!-- 1. Config trước -->
<script src="js/utils.js"></script>        <!-- 2. Utils (dùng bởi các module khác) -->
<script src="js/wheel.js"></script>        <!-- 3. Wheel module -->
<script src="js/timetable.js"></script>    <!-- 4. Timetable module -->
<script src="js/countdown.js"></script>    <!-- 5. Countdown module -->
<script src="js/schoolWeek.js"></script>   <!-- 6. SchoolWeek module -->
<script src="js/teachingPlan.js"></script> <!-- 7. Teaching Plan module -->
<script src="js/targets.js"></script>      <!-- 8. Targets module -->
<script src="js/news.js"></script>         <!-- 9. News module -->
<script src="js/main.js"></script>         <!-- 10. Main - khởi tạo tất cả -->
```

## 🎯 Cách sử dụng

1. **Cấu hình**: Chỉnh sửa `config.js` để cập nhật URLs Google Sheets, ngày thi, tuần học
2. **Cài đặt dependencies** (cho serverless function):
   ```bash
   npm install
   ```
3. **Chạy web local**: Mở `index.html` trong trình duyệt hoặc chạy local server:
   ```bash
   python -m http.server 8000
   ```
   Sau đó truy cập: `http://localhost:8000/`

## 🚀 Deploy lên Vercel (cho tính năng tin tức)

Tính năng tin tức toán học cần serverless function, nên cần deploy lên Vercel:

1. **Cài đặt Vercel CLI** (nếu chưa có):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Hoặc kết nối GitHub repo với Vercel qua web interface.

3. **Cập nhật URL API** trong `js/news.js`:
   - Sau khi deploy, Vercel sẽ cung cấp URL như: `https://your-project.vercel.app`
   - Cập nhật `NEWS_API_URL` trong `js/news.js`:
     ```javascript
     const NEWS_API_URL = 'https://your-project.vercel.app/api/get-news';
     ```

4. **Lưu ý**: 
   - Serverless function sẽ tự động cache dữ liệu trong 1 giờ
   - Nếu cần điều chỉnh selector HTML của ToanMath, chỉnh sửa trong `api/get-news.js`

## 🔄 Cập nhật dữ liệu

- **Thời khóa biểu**: Chỉ cần cập nhật Google Sheets, web sẽ tự động lấy dữ liệu mới khi reload
- **Danh sách học sinh**: Cập nhật Google Sheets, web sẽ tự động load khi chọn lớp
- **Tuần học**: Cập nhật `SCHOOL_WEEKS_CONFIG` trong `config.js`
- **Ngày thi**: Cập nhật `EXAM_PHASES_CONFIG` và `HSG_EXAM_TIME_CONFIG` trong `config.js`

## 📌 Lưu ý

- Tất cả Google Sheets phải được **Publish to web** ở dạng **CSV**
- Cần chạy web qua HTTP server (không thể mở trực tiếp file://) để tránh lỗi CORS
- File `index.html` chỉ chứa HTML và CSS, không còn JavaScript inline
- **Tính năng tin tức**: Cần deploy lên Vercel để serverless function hoạt động. Nếu chạy local, tính năng này sẽ không hoạt động (có thể bỏ qua hoặc dùng proxy khác)

## 🛠️ Phát triển

Khi thêm tính năng mới:
1. Tạo file `.js` mới trong thư mục `js/`
2. Thêm `<script src="js/new-feature.js"></script>` vào `index.html` (sau utils.js, trước main.js)
3. Gọi hàm khởi tạo trong `main.js`

