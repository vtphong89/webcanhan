# Hướng Dẫn Deploy Lên Vercel

## ✅ Đã Fix

Các vấn đề sau đây đã được sửa:

1. ✅ Thêm `"type": "commonjs"` vào `package.json`
2. ✅ Chuẩn hóa Node.js version requirement (`18.x`)
3. ✅ Tạo file `.vercelignore` để tối ưu deployment
4. ✅ Cải thiện error handling trong `api/get-news.js`

## 🚀 Cách Deploy

### Option 1: Deploy qua Vercel Dashboard (KHUYẾN NGHỊ)

#### Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Fix Vercel deployment configuration"
git push origin main
```

#### Bước 2: Kết nối Vercel với GitHub

1. Truy cập https://vercel.com
2. Đăng nhập bằng GitHub account
3. Click **"Add New Project"** hoặc **"Import Project"**
4. Chọn repository của bạn từ danh sách
5. Click **"Import"**

#### Bước 3: Cấu hình Project (thường không cần chỉnh)

- **Framework Preset**: Other (hoặc để mặc định)
- **Root Directory**: `./`
- **Build Command**: để trống
- **Output Directory**: để trống
- **Install Command**: `npm install` (Vercel tự động)

#### Bước 4: Deploy

1. Click **"Deploy"**
2. Đợi 1-2 phút để Vercel build và deploy
3. Lấy URL project (ví dụ: `https://your-project.vercel.app`)

### Option 2: Deploy qua Vercel CLI

**Lưu ý**: Cần cài Node.js trước (https://nodejs.org)

```bash
# Cài Vercel CLI
npm install -g vercel

# Deploy
cd "c:\Users\vtpho\OneDrive\Máy tính\Web ca nhan"
vercel

# Hoặc deploy production ngay
vercel --prod
```

## 🧪 Kiểm Tra Sau Khi Deploy

1. Mở URL Vercel project của bạn
2. Kiểm tra các tính năng:
   - ✅ Trang web hiển thị bình thường
   - ✅ Vòng quay may mắn hoạt động
   - ✅ Thời khóa biểu load từ Google Sheets
   - ✅ **Tin tức Toán học** - Click để test API serverless function
3. Mở DevTools (F12) → tab Console, kiểm tra không có lỗi

## ⚙️ Auto-Deployment

Sau lần deploy đầu tiên:
- Mỗi khi push code lên GitHub (branch `main`)
- Vercel sẽ **TỰ ĐỘNG** build và deploy lại
- Bạn sẽ nhận email thông báo khi deploy xong

## 🔧 Troubleshooting

### Lỗi: "Build failed"

**Nguyên nhân**: Dependencies không cài được

**Giải pháp**:
1. Kiểm tra `package.json` có đúng format không
2. Đảm bảo dependencies version hợp lệ
3. Xem Build Log trên Vercel Dashboard

### Lỗi: "Function timeout"

**Nguyên nhân**: API `get-news.js` chạy quá lâu

**Giải pháp**: Đã set `maxDuration: 10` trong `vercel.json`

### Lỗi: CORS

**Nguyên nhân**: API không cho phép truy cập từ domain khác

**Giải pháp**: Đã fix trong `api/get-news.js` và `vercel.json`

## 📝 Lưu Ý

- ⚠️ **Không cần cài Node.js trên máy local** để deploy qua GitHub
- ✅ Vercel sẽ tự động cài dependencies khi build
- ✅ File `.vercelignore` đảm bảo chỉ upload code cần thiết
- 🎯 Sau khi deploy, URL sẽ là: `https://[tên-project].vercel.app`

## 🆘 Cần Trợ Giúp?

Nếu vẫn gặp lỗi, hãy:
1. Copy error message từ Vercel deployment log
2. Gửi cho tôi để debug cụ thể hơn
