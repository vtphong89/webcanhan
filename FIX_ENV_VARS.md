# Checklist Fix Lỗi Environment Variables

## ✅ Bạn cần làm NGAY:

### 1. REDEPLOY Project (QUAN TRỌNG NHẤT!)

Sau khi add environment variables, **BẮT BUỘC phải redeploy**:

**Cách 1: Redeploy trên Vercel Dashboard**
1. Vào https://vercel.com → Chọn project
2. Click tab **"Deployments"** (bên trái)
3. Tìm deployment mới nhất (phía trên cùng)
4. Click nút **"..."** (3 chấm) bên phải
5. Chọn **"Redeploy"**
6. Đợi 1-2 phút cho build xong

**Cách 2: Push code mới**
```bash
git commit --allow-empty -m "Trigger redeploy with env vars"
git push origin main
```

---

### 2. Kiểm tra Environment Variables đã đúng chưa

Vào **Vercel Dashboard** → **Settings** → **Environment Variables**

**Checklist:**
- [ ] Có đủ 6 biến:
  - TIMETABLE_SHEET_URL
  - WHEEL_11B1_URL
  - WHEEL_12C1_URL
  - TEACHING_PLAN_11_URL
  - TEACHING_PLAN_12_URL
  - TARGETS_SHEET_URL

- [ ] Mỗi biến đã chọn cả 3 môi trường:
  - ✅ Production
  - ✅ Preview  
  - ✅ Development

- [ ] Value không có khoảng trống đầu/cuối
- [ ] Value không bị ngắt dòng giữa chừng

**Screenshot cho tôi xem nếu không chắc!**

---

### 3. Test API trực tiếp

Sau khi redeploy, mở browser và test:

```
https://your-project.vercel.app/api/get-timetable
```

**Kết quả mong đợi:**
- ✅ Trả về CSV data (nhiều dòng text)
- ❌ Nếu vẫn lỗi: `{"error":"Configuration error","message":"TIMETABLE_SHEET_URL not configured"}`

Nếu vẫn báo "not configured" → Environment variables chưa apply đúng!

---

### 4. Xem Deployment Logs

1. Vào **Deployments** tab
2. Click vào deployment mới nhất
3. Xem **Build Logs**
4. Tìm dòng có "Environment Variables" → Phải thấy 6 biến được load

---

### 5. Clear Cache và Hard Reload

Sau khi redeploy xong:
1. Mở web của bạn
2. Nhấn **Ctrl + Shift + R** (Windows) hoặc **Cmd + Shift + R** (Mac)
3. Mở DevTools (F12) → Tab **Application** → **Clear storage** → **Clear site data**
4. Reload lại trang

---

## 🔍 Nếu vẫn không được

**Cho tôi screenshot của:**
1. Vercel Settings → Environment Variables (toàn bộ list)
2. Vercel Deployments → Latest deployment status
3. DevTools Console (F12) khi click vào các tính năng lỗi

Hoặc test API này và gửi kết quả cho tôi:
```
https://your-project.vercel.app/api/get-news
```

(API này KHÔNG cần env vars nên sẽ hoạt động ngay)

Nếu API get-news hoạt động → Vấn đề chắc chắn là env vars chưa được apply!
