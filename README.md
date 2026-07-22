# 🚀 DocCleaner & PDF Downloader (Studocu & Scribd)

Một tiện ích mở rộng (Chrome Extension) thông minh giúp **tự động diệt 100% quảng cáo, loại bỏ lớp mờ paywall/khóa trang** và **xuất tài liệu Studocu & Scribd sang file PDF HD sắc nét** chuẩn A4 chỉ bằng **1 Click**.

> **Phiên bản:** `v1.3` (Hỗ trợ đa nền tảng Studocu & Scribd + AdBlocker toàn diện)

---

## ✨ Tính năng nổi bật

### 1. 🌐 Hỗ Trợ Đa Nền Tảng: Studocu & Scribd
- Tự động nhận diện domain đang truy cập (`studocu.com`, `studocu.vn`, `scribd.com`).
- Tự động áp dụng bộ xử lý tối ưu DOM chuẩn xác cho từng trang web.

### 2. 🛡️ Loại Bỏ 100% Quảng Cáo & Khung Paywall (AdBlocker & Clean Mode)
- **Triệt hạ ngay từ `document_start`:** Ẩn hoàn toàn tất cả các loại banner quảng cáo, popup mua VIP, cửa sở đồng ý Cookie (OneTrust, Didomi) ngay trước khi trang web kịp nạp.
- **Diệt quảng cáo động (`MutationObserver`):** Tự động phát hiện và xóa sạch mọi iframe quảng cáo (Google Ads, DoubleClick) hoặc popup nạp ngầm khi cuộn chuột.

### 3. 🔓 Unblur 100% Trang Bị Khóa & Bypass Giới Hạn Xem
- **Studocu:** Tự động trích xuất CloudFront Signature và nạp lại toàn bộ hình ảnh HD sắc nét (`/html/bgN.png`), giải mã 100% trang mờ.
- **Scribd:** Tự động loại bỏ filter mờ CSS, hiển thị rõ văn bản bị ẩn và xóa lớp phủ nhòe (`.page_blur_promo`, `.promo_wrapper`).

### 4. ⚡ Auto-Scroll Preload (Tải Trước Toàn Bộ Trang)
- Khắc phục triệt để cơ chế Lazy Loading / Virtual Scrolling của Scribd và Studocu.
- Tự động cuộn và nạp đủ 100% số trang vào bộ nhớ đệm trước khi in, tránh tối đa tình trạng trang trắng hay vỡ lề.

### 5. 📥 Nút "Tải PDF HD" Nổi Trực Tiếp (1-Click Floating Action Button)
- Nút bấm thiết kế hiện đại ở góc dưới bên phải màn hình.
- Nhấn 1-Click để khởi tạo toàn bộ quy trình: Diệt QC ➔ Preload trang ➔ Căn chỉnh A4 ➔ Bật cửa sổ lưu PDF.

---

## 🛠 Hướng dẫn cài đặt

### Cách 1: Tải file `.zip` (Nhanh nhất cho người dùng)
1. Truy cập trang Releases: **[GitHub Releases - DocCleaner v1.3](https://github.com/khanhnkq/DocCleaner/releases/tag/v1.3)**
2. Tải về tệp **`DocCleaner-v1.3.zip`** và giải nén ra một thư mục.
3. Mở `chrome://extensions/` ➔ Bật **Developer mode** ở góc phải ➔ Chọn **Load unpacked** thư mục vừa giải nén.

### Cách 2: Tải bằng Git (Dành cho Developer)
```bash
git clone https://github.com/khanhnkq/DocCleaner.git
```
Mở `chrome://extensions/` ➔ Bật **Developer mode** ➔ Chọn **Load unpacked** thư mục dự án.

---

## 🎯 Cách sử dụng

1. Truy cập vào bất kỳ bài giảng/tài liệu nào trên **Studocu.com**, **Studocu.vn** hoặc **Scribd.com**.
2. Tiện ích sẽ tự động diệt quảng cáo và ẩn các khung thông báo phiền phức.
3. Click trực tiếp vào nút nổi **"Tải PDF HD"** ở góc dưới bên phải màn hình.
4. Chờ vài giây để công cụ tự động preload toàn bộ trang và bật cửa sổ in PDF của Chrome.
5. Chọn **"Save as PDF" (Lưu dưới dạng PDF)** -> Nhấn **Save**.

---

## ⚠️ Miễn trừ trách nhiệm (Disclaimer)

Dự án này được phát triển **thuần túy phục vụ mục đích nghiên cứu kỹ thuật & học tập cá nhân (Proof of Concept)**. Vui lòng tôn trọng bản quyền của tác giả và điều khoản dịch vụ của nền tảng gốc.
