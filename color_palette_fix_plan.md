# Kế Hoạch Chuẩn Hóa Màu Sắc (Color Palette Fix Plan)
> Căn cứ theo hình mẫu người dùng cung cấp: Nền Xanh Dương Navy `#193582` + Nút Xanh Lá Chanh `#c6eb34` (chữ `#091b42`) + Nền Canvas Sáng `#f6f7ef`.

---

## 1. Nguyên Nhân Gây Lỗi ("Tùm Lum Màu")
Trước đó, trang bị pha trộn quá nhiều mã màu khác nhau:
- Xanh lá có tới 4 sắc độ: `#16a34a`, `#10b981`, `#58c474`, `#c6eb34`
- Xanh dương có tới 3 sắc độ: `#1d4ed8`, `#193582`, `#091b42`
- Thêm các màu phụ như Cyan `#06b6d4`, Đỏ `#ef4444`, Vàng `#ffdd00`, v.v. khiến tổng thể bị rối mắt và mất tính đồng bộ.

---

## 2. Hệ Màu Chuẩn Duy Nhất (Strict 2-Color Duo)
Chỉ dùng duy nhất bảng màu từ hình mẫu và popup:

| Thành phần | Mã Màu | Ý nghĩa sử dụng |
| :--- | :--- | :--- |
| **Xanh lá (Lime Green)** | `#c6eb34` | **Tất cả nút bấm chính (`.btn-primary`)**, badge nổi bật, icon badge, điểm nhấn active |
| **Xanh dương chính (Navy)** | `#193582` | Nền khối CTA lớn (như hình mẫu), viền nút phụ, link active |
| **Xanh dương đậm (Deep Navy)** | `#091b42` | Chữ tiêu đề H1/H2/H3, chữ nằm trong nút xanh lá, nét icon |
| **Xanh xám (Muted Navy)** | `#5e6d8a` | Toàn bộ chữ nội dung, mô tả, ngày tháng, phụ đề |
| **Nền Canvas (Cream)** | `#f6f7ef` | Nền toàn trang Light Mode (chuẩn Graphic Poster của popup) |
| **Nền Card (White)** | `#ffffff` | Nền các khối thẻ nội dung (Bento, so sánh, Quizken mockup) |

> 🚫 **Nghiêm cấm:** Không dùng bất kỳ mã màu xanh lá nào khác ngoài `#c6eb34` và không dùng xanh dương nào khác ngoài `#193582` / `#091b42`.

---

## 3. Các Bước Triển Khai (Action Items)

### Bước 1: Chuẩn Hóa Toàn Diện Biến CSS trong `index.css`
- Định nghĩa lại `:root` chỉ gồm 5 token cốt lõi:
  - `--bg-navy: #193582;`
  - `--text-navy: #091b42;`
  - `--text-muted: #5e6d8a;`
  - `--accent-lime: #c6eb34;`
  - `--card-cream: #f6f7ef;`
  - `--card-white: #ffffff;`
- Xóa sạch toàn bộ token rác (`--accent-green: #58c474`, `#10b981`, `#16a34a`, `#1d4ed8`, cyan, v.v.).

### Bước 2: Thiết Kế Button Giống Hệt 100% Như Hình Mẫu
- `.btn-primary`:
  - Nền: `background: #c6eb34;`
  - Chữ: `color: #091b42;` (đậm 900)
  - Bóng phát sáng: `box-shadow: 0 4px 16px rgba(198, 235, 52, 0.45);`
  - Hover: `background: #d4f73e; box-shadow: 0 8px 24px rgba(198, 235, 52, 0.6); transform: translateY(-2px);`
- Áp dụng đồng nhất cho:
  - Nút Hero: `Add to Chrome — It's Free`
  - Nút Navbar: `Add to Chrome`
  - Nút Quizken: `Try Quizken AI Free`
  - Nút Cuối Trang: `Add to Chrome — Free Extension`

### Bước 3: Đồng Bộ Toàn Bộ Icon Về 1 Quy Chuẩn
- Icon badges trên toàn trang:
  - Nền: `background: #c6eb34;`
  - Nét icon: `color: #091b42;`
  (Y hệt như `.card-badge` bên trong popup của tiện ích).
- Triệt tiêu hoàn toàn các badge màu đỏ, cyan, vàng, xanh khác.

### Bước 4: Chuẩn Hóa Khối Thẻ & Section
- Khối CTA cuối trang: Nền `#193582` với nút `#c6eb34` (khớp 100% hình mẫu).
- Khối Quizken: Thẻ trắng `#ffffff` trên nền `#f6f7ef`, viền thanh trên gradient `#193582` -> `#c6eb34`. Tùy chọn đáp án đúng được viền và đánh dấu bằng `#c6eb34`.
- Navbar: Kính mờ `#f6f7ef` với viền `rgba(9, 27, 66, 0.1)`.

### Bước 5: Kiểm Tra & Đóng Gói
- Chạy `./package-extension.sh --no-bump` để đảm bảo file zip tiện ích luôn sạch sẽ 152KB.
