# 🎨 DocCleaner Design System & Web Visual Guidelines

> **Phiên bản:** v1.0  
> **Nguồn cảm hứng:** Giao diện Graphic Poster Popup của DocCleaner (`popup.css`) & phong cách nghệ thuật Store Assets (`marquee_1400x560.png`, `promo_small_440x280.png`).  
> **Tuân thủ:** Vercel Web Interface Guidelines (Accessibility, Contrast, Semantic Structure) & Tiêu chuẩn Art-Direction hiện đại.

---

## 🖼️ Bộ Ảnh Ý Tưởng Visual Concept (Đã Khởi Tạo)

Hai hình ảnh ý tưởng chuẩn tỷ lệ ngang **16:9** được xây dựng đồng nhất theo ngôn ngữ đồ họa của Store Assets:

| Tên ảnh | Mục đích trên Landing Page | File lưu trữ |
|---|---|---|
| **Hero Concept Banner** | Visual chính ở Hero Section: Các trang tài liệu A4 bán trong suốt (glassmorphic), các huy hiệu phát sáng (*Better Studocu*, *1-Click Print*, *100% Free*), icon tài liệu và biểu tượng in phát sáng trên nền xanh đêm sâu thẳm. | [`store-assets/hero_concept_banner.jpg`](file:///Users/nguyenkimquockhanh/Desktop/DocCleaner/store-assets/hero_concept_banner.jpg) |
| **Before / After Feature** | Visual cho mục So sánh: Minh họa trực quan một bên tài liệu bị che phủ bởi banner quảng cáo/overlay gây rối mắt vs. một bên được dọn sạch tinh tươm, chuẩn khổ đọc sách kèm dấu chứng nhận *Distraction-Free*. | [`store-assets/before_after_feature.jpg`](file:///Users/nguyenkimquockhanh/Desktop/DocCleaner/store-assets/before_after_feature.jpg) |

---

## 1. 🌈 Bảng Màu Cốt Lõi (Color Palette Tokens)

DocCleaner sử dụng phong cách **"Graphic Poster" kết hợp "Deep Modern Studio"**: Nền tối xanh navy hoàng gia tương phản cực mạnh với các khối thẻ kem ấm áp và các mảng nhấn màu axit rực rỡ.

### 1.1. Bảng mã màu chuẩn (Core Tokens)

```css
:root {
  /* Nền chính & Bề mặt tối */
  --bg-deep-navy: #07122b;       /* Nền landing page toàn trang (Midnight Space) */
  --bg-navy-card: #193582;       /* Nền popup & khối thẻ chính (Royal Navy) */
  --bg-navy-dark: #091b42;       /* Chữ đậm & viền icon (Deep Ink) */

  /* Bề mặt sáng (Tactile Poster Surfaces) */
  --card-cream: #f6f7ef;         /* Màu giấy kem ấm (nền nội dung thẻ) */
  --card-white: #ffffff;         /* Trắng tinh khiết khi hover thẻ */
  --card-surface-subtle: #f0f2eb;

  /* Màu nhấn chức năng (Functional Neon Accents) */
  --accent-lime: #c6eb34;        /* Acid Lime (Thương hiệu Studocu & Nút PRO) */
  --accent-green: #58c474;       /* Emerald Mint (Thương hiệu Scribd & Bảo vệ) */
  --accent-cyan: #06b6d4;        /* Electric Cyan (Hiệu ứng phát sáng & in ấn) */
  --accent-yellow: #ffdd00;      /* Vibrant Mustard (Ủng hộ cà phê & Cảnh báo) */

  /* Hệ thống chữ (Typography Colors) */
  --text-main-dark: #091b42;     /* Chữ đen navy trên nền sáng (Độ tương phản 13.5:1) */
  --text-muted-dark: #5e6d8a;    /* Chữ phụ xám xanh trên nền sáng */
  --text-main-light: #ffffff;    /* Chữ trắng trên nền navy */
  --text-muted-light: rgba(255, 255, 255, 0.65); /* Chữ phụ mờ trên nền navy */

  /* Viền & Đổ bóng (Borders & Shadows) */
  --border-glass: rgba(255, 255, 255, 0.12);
  --border-subtle: rgba(9, 27, 66, 0.08);
  --shadow-tactile: 0 4px 14px rgba(0, 0, 0, 0.12);
  --shadow-hover: 0 8px 24px rgba(9, 27, 66, 0.35);
  --glow-lime: 0 0 24px rgba(198, 235, 52, 0.35);
  --glow-cyan: 0 0 28px rgba(6, 182, 212, 0.4);
}
```

### 1.2. Tuân thủ Độ Tương Phản (WCAG 2.1 AA Checklist)
* **Chữ navy (`#091b42`) trên nền kem (`#f6f7ef`):** Tỉ lệ **12.8 : 1** (Vượt xa chuẩn AAA là 7:1).
* **Chữ navy (`#091b42`) trên nền Acid Lime (`#c6eb34`):** Tỉ lệ **13.5 : 1** (Cực kỳ sắc nét, dễ đọc).
* **Chữ trắng (`#ffffff`) trên nền Deep Navy (`#07122b`):** Tỉ lệ **16.2 : 1**.

---

## 2. 🔠 Hệ Thống Typography (Font Hierarchy)

Sử dụng hệ phông **Clean Grotesk / Inter / System Fonts** mang hơi hướng Poster Thụy Sĩ hiện đại:

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

| Cấp bậc | Cỡ chữ / Line Height | Trọng số (Weight) | Letter Spacing | Ứng dụng |
|---|---|---|---|---|
| **Display 1** | `56px` / `1.1` | 900 (Black) | `-0.03em` | Tiêu đề chính Hero Section |
| **Heading 2** | `36px` / `1.2` | 800 (ExtraBold) | `-0.02em` | Tiêu đề các mục Bento Grid, FAQ |
| **Heading 3** | `20px` / `1.3` | 800 (ExtraBold) | `-0.01em` | Tiêu đề thẻ tính năng, tên Popup |
| **Body Large** | `17px` / `1.6` | 400 (Regular) | `normal` | Đoạn văn mô tả giới thiệu ở Hero |
| **Body Regular** | `14px` / `1.5` | 500 (Medium) | `normal` | Nội dung thẻ tính năng, câu trả lời FAQ |
| **Button / CTA** | `15px` / `1.0` | 800 (ExtraBold) | `+0.01em` | Chữ trên nút bấm hành động |
| **Pill / Badge** | `11px` / `1.0` | 800 (ExtraBold) | `+0.05em` | Huy hiệu (PRO, STUDOCU, FREE) |

---

## 3. 🧩 Thư Viện Thành Phần Giao Diện (Core Components)

### 3.1. Thẻ 2 Khối Đồng Nhất (Uniform 2-Block Card)
Được trích xuất nguyên bản từ cấu trúc thẻ thông minh của `popup.css`:
* **Khối bên trái (Square Icon Badge):** Kích thước vuông tỉ lệ 1:1, bo góc tròn `--radius-badge: 18px`, màu nền là màu nhấn rực rỡ (Lime cho Studocu, Green cho Scribd, Gold cho Cà phê).
* **Khối bên phải (Card Body):** Bo góc `--radius-card: 18px`, nền giấy kem `#f6f7ef`, tự động sáng thành trắng `#ffffff` và nhấc nhẹ lên 2px khi người dùng di chuột (`hover`).

### 3.2. Nút Bấm Hành Động Nổi Bật (Graphic Poster Action Buttons)
* Bo góc dạng **Pill (18px – 24px)**.
* Khi di chuột: `transform: translateY(-2px);` kèm bóng mờ phát sáng nhẹ (`--glow-lime`).
* Khi bấm: `transform: translateY(0px) scale(0.98);`.

### 3.3. Dấu Chấm Trạng Thái Phát Sáng (Pulsing Status Indicator)
* Đường kính `8px`, bo tròn 100%.
* Màu xanh Lime phát sáng (`#c6eb34`), biểu thị trạng thái "Sẵn sàng hoạt động (Ready - 100% Free)".

---

## 4. 📐 Lưới Layout & Không Gian Đệm (Spacing & Bento System)

Dựa trên nguyên tắc của `/imagegen-frontend-web`: **"Không gian thở rộng rãi, nhịp điệu thị giác đa dạng"**:

* **Khoảng cách giữa các Section:** `96px` đến `120px` (đảm bảo trang có độ thông thoáng chuẩn cao cấp).
* **Khoảng cách Bento Grid:** `20px` đến `24px` giữa các khối thẻ.
* **Độ bo góc chuẩn:**
  * Modal / Container lớn: `24px`
  * Thẻ Card / Khối con: `18px`
  * Nút bấm & Badge: `14px – 18px`

---

## 5. ✅ Tiêu Chuẩn Trải Nghiệm Web (Web Design Guidelines Audit)

1. **Accessibility (Hỗ trợ tiếp cận):**
   * Mọi nút bấm và link đều có viền `focus-visible: 2px solid var(--accent-lime)` với `outline-offset: 3px`.
   * Vùng chạm bấm (Touch Target) trên thiết bị di động tối thiểu `48px x 48px`.
2. **Hiệu năng & Chuyển động (Reduced Motion):**
   * Tự động tắt toàn bộ hiệu ứng chuyển động và phóng to/thu nhỏ khi người dùng bật chế độ `prefers-reduced-motion: reduce`.
3. **Responsive Breakpoints:**
   * Mobile: `< 640px` (chuyển sang dạng 1 cột vuốt dọc mượt mà).
   * Tablet: `640px – 1024px` (Lưới Bento 2 cột).
   * Desktop: `> 1024px` (Lưới 3 hoặc 4 cột cân xứng với container tối đa `1140px`).
