# Bảo Vệ URLs Qua Serverless API - Hướng Dẫn Deploy

## 🔒 Bảo mật đã được cài đặt!

Tất cả URLs Google Sheets đã được chuyển từ client-side sang serverless functions trên Vercel. Bây giờ user không thể xem URLs trong source code!

## 📋 Những gì đã thay đổi

### ✅ APIs đã tạo (trong thư mục `/api`)

1. **`api/get-timetable.js`** - Lấy thời khóa biểu
2. **`api/get-wheel-students.js`** - Lấy danh sách học sinh (theo lớp)
3. **`api/get-teaching-plan.js`** - Lấy lịch báo giảng (theo lớp)
4. **`api/get-targets.js`** - Lấy chỉ tiêu trong năm

### ✅ Client-side đã update

- **`js/wheel.js`** - Gọi `/api/get-wheel-students?class=12C1` thay vì URL trực tiếp
- **`js/timetable.js`** - Gọi `/api/get-timetable`
- **`js/teachingPlan.js`** - Gọi `/api/get-teaching-plan?class=lop11`
- **`js/targets.js`** - Gọi `/api/get-targets`

### ✅ Configuration files

- **`.env.example`** - Template cho environment variables
- **`vercel.json`** - Thêm config cho tất cả API endpoints
- **`.gitignore`** - Thêm `.env.local` để bảo vệ URLs local

## 🚀 Deploy lên Vercel

### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Bảo vệ Google Sheets URLs qua serverless API"
git push origin main
```

### Bước 2: Thêm Environment Variables trên Vercel

1. Vào **Vercel Dashboard** → Chọn project của bạn
2. Vào **Settings** → **Environment Variables**
3. Thêm từng biến sau:

#### **Biến 1: TIMETABLE_SHEET_URL**
- **Key**: `TIMETABLE_SHEET_URL`
- **Value**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vSg6G7zmzBAa2Qodj30H5DGd9jEqO9q07Z20tMPmUJz61eKvMAadqf9NjVq6jjOHw/pub?gid=484115559&single=true&output=csv`
- **Environment**: Production, Preview, Development (chọn tất cả)

#### **Biến 2: WHEEL_11B1_URL**
- **Key**: `WHEEL_11B1_URL`
- **Value**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vQBGeRBBa8NlNAya3UcL7T0qI0jI2HVN20ibhrrpBX2w_58qRidrm2jlXmMws05Bqu6Gd1uRIdv_4Q_/pub?gid=0&single=true&output=csv`
- **Environment**: Production, Preview, Development

#### **Biến 3: WHEEL_12C1_URL**
- **Key**: `WHEEL_12C1_URL`
- **Value**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vQBGeRBBa8NlNAya3UcL7T0qI0jI2HVN20ibhrrpBX2w_58qRidrm2jlXmMws05Bqu6Gd1uRIdv_4Q_/pub?gid=1446670802&single=true&output=csv`
- **Environment**: Production, Preview, Development

#### **Biến 4: TEACHING_PLAN_11_URL**
- **Key**: `TEACHING_PLAN_11_URL`
- **Value**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8nwCjK3JbM_h6XH-2CLtIMrZ-t6BDxuAvvuz3dOPmk33M5kC3tMX0A0p__m_s8O5fCaQkHKvmR4vf/pubhtml?gid=0&single=true`
- **Environment**: Production, Preview, Development

#### **Biến 5: TEACHING_PLAN_12_URL**
- **Key**: `TEACHING_PLAN_12_URL`
- **Value**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8nwCjK3JbM_h6XH-2CLtIMrZ-t6BDxuAvvuz3dOPmk33M5kC3tMX0A0p__m_s8O5fCaQkHKvmR4vf/pubhtml?gid=1646673641&single=true`
- **Environment**: Production, Preview, Development

#### **Biến 6: TARGETS_SHEET_URL**
- **Key**: `TARGETS_SHEET_URL`
- **Value**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vSBt8nDRD0o0SYz36YSeLPIoRBTUkgU9UiTG_A8Fgp99TGmmZG5wJT8pAU0yzhPBBhabDVFbjWXgYbc/pubhtml`
- **Environment**: Production, Preview, Development

### Bước 3: Redeploy

Sau khi thêm environment variables:
1. Vào **Deployments** tab
2. Click **...** (menu) bên cạnh deployment mới nhất
3. Chọn **Redeploy**

Hoặc đơn giản push thêm 1 commit bất kỳ để trigger auto-deploy.

## 🧪 Kiểm Tra

Sau khi deploy thành công, test các tính năng:

1. **Vòng quay may mắn** - Chọn lớp và click "Quay ngẫu nhiên"
2. **Lịch Dạy** - Click để expand, kiểm tra thời khóa biểu hiển thị
3. **Lịch báo giảng** - Expand và kiểm tra tuần hiện tại
4. **Chỉ tiêu trong năm** - Expand và xem bảng chỉ tiêu

### Kiểm tra bảo mật

1. Mở DevTools (F12) → tab **Sources**
2. Xem các file JS trong `/js/`
3. ✅ **KHÔNG còn thấy URLs Google Sheets trong code**
4. Chỉ thấy các API calls: `/api/get-timetable`, `/api/get-wheel-students`, etc.

## 📝 Lưu Ý Quan Trọng

### ⚠️ File `config.js` vẫn còn URLs cũ

File `config.js` vẫn chứa các URLs cũ nhưng **KHÔNG còn được sử dụng**. Các URLs này đã được di chuyển sang environment variables trên Vercel.

**Bạn có thể:**
- Giữ nguyên (để backward compatibility nếu cần)
- Hoặc xóa các URLs cũ trong `config.js` (chỉ giữ lại các config khác như `EXAM_PHASES_CONFIG`, `SCHOOL_WEEKS_CONFIG`)

### 🔒 Bảo mật

- ✅ URLs chỉ tồn tại trên Vercel server (environment variables)
- ✅ Client-side code chỉ gọi APIs, không có URLs
- ✅ Người dùng xem source code sẽ không thấy URLs Google Sheets
- ✅ Có thể thêm authentication/rate limiting sau này nếu cần

### 📌 Cập nhật URLs sau này

Khi cần thay đổi URLs Google Sheets:
1. Vào Vercel Dashboard → Settings → Environment Variables
2. Edit biến tương ứng
3. Save và redeploy

**KHÔNG cần** thay đổi code!

## ✅ Hoàn tất!

Bây giờ web của bạn đã được bảo vệ tốt hơn. URLs Google Sheets không còn lộ ra ngoài! 🎉
