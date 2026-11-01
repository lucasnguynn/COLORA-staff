# COLORA QR Atelier

Website tĩnh tạo QR theo brand identity COLORA.

## Chạy local

Mở `index.html` trực tiếp hoặc chạy một static server, ví dụ:

```bash
python3 -m http.server 8080
```

Sau đó mở `http://localhost:8080`.

## Deploy

Có thể deploy nguyên thư mục lên GitHub Pages, Netlify, Vercel static hoặc Railway static hosting.

## Cấu trúc

- `index.html`: giao diện + logic QR
- `assets/colora-logo.png`: logo COLORA
- `assets/colora-symbol.png`: symbol COLORA

> QR sử dụng thư viện `qr-code-styling` từ CDN, vì vậy trình duyệt cần internet khi tải trang lần đầu.
