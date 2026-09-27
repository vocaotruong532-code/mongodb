# Đặc sản Tây Nguyên

## Chạy ứng dụng

1. Đảm bảo MongoDB đang chạy.
2. Chạy `npm start` hoặc mở `start-local.bat` để khởi động website và API tại `http://localhost:3001`.
3. Mở terminal khác, chạy `npm run import` để gửi dữ liệu trong `products.json` qua API vào MongoDB.

API thay thế toàn bộ danh sách sản phẩm trong collection `sanpham` bằng mảng JSON được gửi đến `POST /api/products/sync`. Website chỉ đọc sản phẩm từ `GET /api/products`.
