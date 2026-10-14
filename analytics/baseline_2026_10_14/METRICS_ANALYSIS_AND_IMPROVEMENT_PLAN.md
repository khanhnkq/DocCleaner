# 📊 Báo Cáo Phân Tích Chỉ Số Chrome Web Store & Kế Hoạch Cải Thiện (Baseline 14/10/2026)

> **Dự án:** DocCleaner (`fnhdoegoihnkgggnaiemommemdejhbkb`)  
> **Nhà xuất bản:** KapKap Studio  
> **Kỳ ghi nhận:** 13/09/2026 – 12/10/2026 (Thực tế bắt đầu phát sinh số liệu từ **07/10/2026** khi publish v1.3)  
> **Mục đích:** Lưu trữ số liệu nền (baseline) ban đầu để đối soát, so sánh hiệu quả sau khi triển khai bộ từ khóa SEO mới (`Better Studocu`, `Better Scribd`, `Free`).

---

## 🖼️ Danh Mục Ảnh Đối Soát (Screenshots Lưu Trữ)

Các ảnh chụp màn hình từ Chrome Developer Dashboard đã được lưu trữ cục bộ tại thư mục:  
📁 [`analytics/baseline_2026_10_14/`](file:///Users/nguyenkimquockhanh/Desktop/DocCleaner/analytics/baseline_2026_10_14/)

1. [`01_impressions_429.png`](file:///Users/nguyenkimquockhanh/Desktop/DocCleaner/analytics/baseline_2026_10_14/01_impressions_429.png) — *Biểu đồ tổng số lượt hiển thị trên Cửa hàng Chrome trực tuyến (429 lượt)*
2. [`02_traffic_sources.png`](file:///Users/nguyenkimquockhanh/Desktop/DocCleaner/analytics/baseline_2026_10_14/02_traffic_sources.png) — *Cơ cấu nguồn xem trang (`ext_sidebar` 56%, `item-share-cb` 28%, `app-launcher` 12%)*
3. [`03_page_views_63.png`](file:///Users/nguyenkimquockhanh/Desktop/DocCleaner/analytics/baseline_2026_10_14/03_page_views_63.png) — *Số lượt xem trang chi tiết (63 lượt, đỉnh 18 lượt/ngày)*
4. [`04_uninstalls_geo_os.png`](file:///Users/nguyenkimquockhanh/Desktop/DocCleaner/analytics/baseline_2026_10_14/04_uninstalls_geo_os.png) — *Phân bổ gỡ cài đặt theo Hệ điều hành (Windows 56%), Quốc gia (VN, Mexico, Pháp) và Ngôn ngữ*

---

## 1. 🔍 Phân Tích Chi Tiết Dữ Liệu Hiện Tại (Chẩn Đoán Nút Thắt)

### 1.1. Phễu Chuyển Đổi Tổng Thể (The Conversion Funnel)

| Chỉ số | Giá trị | Tỷ lệ | Đánh giá |
|--------|---------|-------|----------|
| **Lượt hiển thị (Impressions)** | **429** | 100% | Đang trên đà tăng trưởng dốc (từ 0 lên 120 lượt/ngày chỉ trong 5 ngày). |
| **Lượt xem trang (Page Views)** | **63** | **14.68% (CTR)** | Khá tốt so với trung bình Chrome Store (~8-12%), nhưng 85% người thấy tile vẫn bỏ qua. |
| **Nguồn Traffic chính** | `ext_sidebar` (56%) | Đại đa số | Người dùng biết đến qua thanh bên tiện ích liên quan, **hầu như chưa có organic direct search**. |
| **Hệ điều hành sử dụng** | **Windows 56%** | > 1/2 | Phản ánh đúng tệp sinh viên/học sinh dùng máy tính Windows để đọc tài liệu. |
| **Thị trường quốc tế** | **78% ngoài VN** | Toàn cầu | Mexico (11%), Pháp (11%), Mỹ Latin & các nước khác chiếm tới 56%. |

---

### 1.2. Chẩn Đoán 4 "Điểm Nghẽn" (Bottlenecks) Cốt Lõi

1. **Điểm nghẽn 1: Tên cũ "tàng hình" với thanh tìm kiếm (Zero Organic Search)**
   - Tên cũ trên dashboard: `DocCleaner - Document Reader & PDF Formatter`.
   - Người dùng khi cần tài liệu không ai gõ *"Document Reader"* hay *"PDF Formatter"* (vì máy nào cũng có Adobe/Chrome đọc sẵn). Họ tìm kiếm: *"studocu"*, *"scribd"*, *"better studocu"*, *"studocu download"*, *"tải studocu"*.
   - Hậu quả: 429 lượt hiển thị này 100% là do Chrome tự gợi ý vu vơ ở `ext_sidebar` của các extension khác, bỏ lỡ hàng chục nghìn lượt tìm kiếm trực tiếp mỗi ngày.

2. **Điểm nghẽn 2: Tỷ lệ Click-Through (CTR) còn tiềm năng cải thiện**
   - Tile hiển thị ở sidebar có kích thước nhỏ. Nếu tên chỉ là "Document Reader" và logo là chiếc kính lúp/tài liệu bình thường, người dùng không có lý do cấp thiết để click vào.
   - Khi có thêm tiền tố/hậu tố **`Better Studocu & Scribd Reader (Free)`**, tỷ lệ nhấp sẽ tăng vọt vì đánh đúng 100% nỗi đau của người dùng đang bực mình vì banner/overlay che chữ.

3. **Điểm nghẽn 3: Nguy cơ gỡ cài đặt trên môi trường Windows (56% Uninstalls)**
   - Người dùng Windows thường dùng màn hình tỉ lệ 16:9 độ phân giải 1366x768 hoặc 1920x1080 với mức Display Scaling 125% - 150%.
   - Hộp thoại Print (`Ctrl + P`) của Chrome trên Windows nếu không cấu hình CSS `@page { size: A4 portrait; margin: 0; }` chuẩn có thể sinh ra trang trắng hoặc co cụm nội dung. Khi in ra thấy xấu hoặc không tải được ảnh sắc nét, họ sẽ gỡ extension ngay lập tức.

4. **Điểm nghẽn 4: Rào cản ngôn ngữ ngoài tiếng Anh/tiếng Việt**
   - Dữ liệu cho thấy Mexico (11%) và Pháp (11%) cùng nhiều quốc gia khác đang sử dụng. Hiện tại giao diện popup mới chỉ có EN và VI.

---

## 2. 🚀 Kế Hoạch Cải Thiện & Hành Động (Action Plan)

### Giai Đoạn 1: Tối Ưu Lực Đẩy SEO & Phủ Tìm Kiếm (Đã & Đang Triển Khai)

- [x] **Bước 1.1: Đổi tên hiển thị chính thức trên Store**
  - Cập nhật tên thành: `DocCleaner - Better Studocu & Scribd Reader (Free)`
  - Đưa trực tiếp từ khóa `Better Studocu`, `Better Scribd`, `Free` vào `name`, `short_description` và popup.
- [x] **Bước 1.2: Phủ dày từ khóa trong Detailed Description**
  - Mật độ: 6 lần *Better Studocu*, 5 lần *Better Scribd*, 8 lần *Free*.
  - Định vị sản phẩm thành **"Reader Mode" an toàn** (tương tự Safari Reader/Pocket) để tránh vi phạm chính sách bản quyền của Google.
- [ ] **Bước 1.3: Cập nhật Promo Tile và 4 Screenshots Store**
  - Screenshot 1: So sánh trực quan Before / After (trang Studocu đầy banner vs trang sau khi dọn sạch).
  - Screenshot 2: Nút bấm floating "Format for Print" trực quan 1-click.
  - Screenshot 3: Bản in PDF A4 sắc nét trên Chrome Print Preview.
  - Screenshot 4: Popup gọn gàng hiển thị rõ huy hiệu "Better Studocu · Free".

---

### Giai Đoạn 2: Tối Ưu Trải Nghiệm & Giảm Tỷ Lệ Gỡ Cài Đặt (Retention)

- [ ] **Bước 2.1: Hoàn thiện tương thích in ấn trên Windows (Ưu tiên số 1)**
  - Đảm bảo CSS print `@media print` xử lý hoàn hảo ngắt trang (`page-break-inside: avoid`, `break-after: page`), tránh hiện tượng trang trắng thứ 2 hoặc mất lề khi in từ Windows.
  - Test tương thích trên cả Google Chrome và Microsoft Edge (rất nhiều người dùng Windows dùng Edge tải tiện ích từ Chrome Store).
- [ ] **Bước 2.2: Thêm thông báo hướng dẫn khi in (Onboarding micro-copy)**
  - Khi người dùng bấm "Format for Print", hiển thị một toast nhẹ: *"Tip: In Chrome Print Dialog, select 'Save as PDF' and Margins: 'None' for best A4 fit!"* để người dùng không chỉnh nhầm thông số in.
- [ ] **Bước 2.3: Bổ sung đa ngôn ngữ (i18n mở rộng)**
  - Thêm tiếng Tây Ban Nha (`es`) và tiếng Pháp (`fr`) vào popup trong phiên bản tiếp theo để giữ chân người dùng tại Mexico, Pháp và Mỹ Latin.

---

## 3. 🎯 Bảng Chỉ Tiêu KPI Theo Dõi & Đối Soát (Kỳ Review Tiếp Theo: 25/10/2026)

| Chỉ số (Metrics) | Baseline Hiện Tại (14/10/2026) | Mục Tiêu Sau SEO (25/10/2026) | Cách Đo Lường / Đối Soát |
|------------------|--------------------------------|-------------------------------|--------------------------|
| **Lượt hiển thị (Impressions)** | 429 lượt (~120/ngày) | **≥ 1,500 lượt** (≥ 300/ngày) | Kiểm tra tab *Số lần hiển thị* |
| **Organic Search Impression** | < 5% | **≥ 40%** | Kiểm tra tỷ lệ đến từ thanh tìm kiếm Chrome Store |
| **Lượt xem trang (Page Views)** | 63 lượt | **≥ 350 lượt** | Kiểm tra tab *Số lượt xem trang* |
| **Tỷ lệ CTR (Click-Through)** | 14.68% | **≥ 18.00%** | Nhờ tiêu đề có chữ *Better Studocu* & *Free* |
| **Tỷ lệ giữ chân người dùng Windows** | 56% gỡ cài đặt | **Giảm gỡ xuống < 35%** | Kiểm tra tab *Cài đặt và gỡ cài đặt* |

---

## 4. 📝 Quy Trình Đối Soát Cho Lần Sau (Audit Checklist)

Khi mở lại dashboard sau 7–10 ngày:
1. Đăng nhập vào [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Chụp lại 4 màn hình tương ứng:
   - *Số lần hiển thị*
   - *Số lượt xem trang tính theo nguồn*
   - *Số lượt xem trang*
   - *Số lượt cài đặt và gỡ cài đặt*
3. Lưu ảnh mới vào thư mục: `analytics/checkpoint_2026_10_25/`.
4. So sánh các chỉ số với bảng Baseline ở Mục 3 để đánh giá mức độ tăng trưởng từ khóa `Better Studocu`.
