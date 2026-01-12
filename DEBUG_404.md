# Debug 404 API Errors - Quick Fix Guide

## 🔴 Vấn Đề: Tất cả API trả về 404

### ✅ Checklist Debug

#### 1. Environment Variables (NGUYÊN NHÂN CHÍNH - 99%)

**Đã thêm 6 environment variables trên Vercel chưa?**

Vào **Vercel Dashboard** → Project → **Settings** → **Environment Variables**

Cần thêm:
- ✅ `TIMETABLE_SHEET_URL`
- ✅ `WHEEL_11B1_URL`
- ✅ `WHEEL_12C1_URL`
- ✅ `TEACHING_PLAN_11_URL`
- ✅ `TEACHING_PLAN_12_URL`
- ✅ `TARGETS_SHEET_URL`

**Chọn môi trường**: Production, Preview, Development (CHECK TẤT CẢ 3)

Sau khi add → **Redeploy** project!

---

#### 2. Kiểm tra API endpoints có deploy không

Vào **Vercel Dashboard** → **Functions** tab

Phải thấy 5 functions:
- `/api/get-news`
- `/api/get-timetable`
- `/api/get-wheel-students`
- `/api/get-teaching-plan`
- `/api/get-targets`

Nếu KHÔNG thấy → Có vấn đề với deployment

---

#### 3. Test API endpoints trực tiếp

Mở browser và thử:
```
https://your-project.vercel.app/api/get-news
https://your-project.vercel.app/api/get-timetable
```

**Kết quả mong đợi**:
- có environment variables → Trả về data hoặc error config
- KHÔNG có env vars → 500 error "not configured"
- 404 → Functions không được deploy

---

## 🔧 Giải pháp theo lỗi

### Lỗi: 404 Not Found

**Nguyên nhân:** Serverless functions không được Vercel nhận diện

**Fix:**
1. Kiểm tra file `vercel.json` có đúng không (đã OK)
2. Kiểm tra files trong `/api` có extension `.js` (đã OK)
3. Push lại code:
   ```bash
   git add .
   git commit -m "Trigger redeploy"
   git push origin main
   ```

---

### Lỗi: 500 "TIMETABLE_SHEET_URL not configured"

**Nguyên nhân:** Đã add environment variables nhưng chưa chọn đúng môi trường

**Fix:**
1. Vào Settings → Environment Variables
2. Edit từng biến
3. Đảm bảo check cả 3: **Production**, **Preview**, **Development**
4. Save → Redeploy

---

### Lỗi: CORS error

**Nguyên nhân:** Headers không apply đúng

**Fix:** Đã config CORS trong `vercel.json`, nên không lỗi này

---

## 🧪 Test từng bước

### Step 1: Test API get-news (không cần env vars)
```
https://your-project.vercel.app/api/get-news
```

**Mong đợi:** Trả về JSON với tin tức từ ToanMath

**Nếu 404:** Functions không deploy → Check Functions tab

---

### Step 2: Test API get-timetable (cần env vars)
```
https://your-project.vercel.app/api/get-timetable
```

**Mong đợi:** 
- ✅ Có env vars: Trả về CSV data
- ❌ Không có: `{"error":"Configuration error","message":"TIMETABLE_SHEET_URL not configured"}`

**Nếu 404:** Giống Step 1

---

### Step 3: Test trên web

1. Mở `https://your-project.vercel.app`
2. Mở DevTools (F12) → Console tab
3. Click vào các tính năng:
   - Vòng quay may mắn
   - Lịch Dạy
   - Lịch báo giảng
4. Xem Console có lỗi gì

---

## 💡 Giải pháp nhanh nhất

**90% lỗi 404 do chưa add environment variables!**

👉 **HÀNH ĐỘNG NGAY:**
1. Vào Vercel Dashboard
2. Settings → Environment Variables
3. Add 6 biến từ file `.env.example`
4. Click **Redeploy**

---

## 🆘 Vẫn lỗi?

Gửi cho tôi:
1. Screenshot từ **Vercel Dashboard** → **Functions** tab
2. Screenshot từ **Settings** → **Environment Variables**
3. Error log từ DevTools Console (F12)

Tôi sẽ debug cụ thể hơn!
