# Chrome Web Store Listing — DocCleaner

> Last Updated: 2026-10-07  
> Version: 1.3  
> Target Platforms: Chrome Web Store (Manifest V3)

---

## 1. Store Listing Metadata

### Extension Name [REQUIRED]
*English:* `DocCleaner - Document Reader & PDF Formatter`  
*Tiếng Việt:* `DocCleaner - Đọc Tài Liệu & Định Dạng PDF`  
*(Max 75 characters. Khuyến nghị không đưa thẳng nhãn hiệu bên thứ ba vào tiêu đề chính để tránh vi phạm chính sách Trademark của Google).*

### Short Description [REQUIRED]
*English (115 chars):*  
`Clean reading view, removes clutter and banners, and formats documents into print-ready HD PDFs on study platforms.`

*Tiếng Việt (118 chars):*  
`Chế độ đọc tập trung, loại bỏ banner vướng mắt và tối ưu định dạng trang in PDF độ nét cao cho các nền tảng học tập.`

### Detailed Description [REQUIRED]
*(Plain text format, Chrome Web Store tự động loại bỏ Markdown)*

```text
DocCleaner is a lightweight document reading and print formatting companion designed to enhance your document viewing experience on study and reading platforms like Studocu and Scribd.

FEATURES
• Clean Reading Mode: Automatically eliminates intrusive floating banners, overlapping promotional overlays, and cookie consent backdrops for distraction-free reading.
• High-Definition Print Layout: Preloads document pages smoothly to prevent blank pages and aligns content perfectly into an A4 print-ready layout.
• 1-Click Fast PDF Export: Floating action button lets you format the document and open Chrome's native print-to-PDF dialog in one click.
• 100% Client-Side & Private: Zero external tracking, zero cloud dependencies. All formatting and cleaning executes locally on your own machine.
• Dual-Language Interface: Seamlessly toggle between English and Vietnamese right inside the popup.

HOW TO USE
1. Navigate to any study document on supported platforms (Studocu or Scribd).
2. DocCleaner automatically cleans the view for an uncluttered reading environment.
3. Click the floating "Download HD PDF" button at the bottom-right corner (or open the extension popup).
4. Wait a few moments while pages are preloaded.
5. In the Chrome print dialog, choose "Save as PDF" and enjoy your clean document!

PRIVACY & SECURITY
DocCleaner values your privacy above all. The extension operates completely offline inside your browser:
• Does NOT collect, store, or transmit any personal data.
• Does NOT track your browsing history or collect analytics.
• Does NOT communicate with any external remote servers.

PERMISSIONS EXPLAINED
• "storage": Saves your local UI preferences (such as selected language).
• "cookies": Clears temporary session view cookies locally on supported document domains.
• "scripting" & "activeTab": Injects page formatting styles and preloads pages for printing when you click the action button.
• "webNavigation": Detects navigation events to apply clean reading styles on document pages.

SUPPORT & FEEDBACK
Have a suggestion, question, or bug report?
• GitHub: https://github.com/khanhnkq/DocCleaner
• Coffee & Support: https://khanhnkq.quizken.com/buy-me-a-coffee

Version 1.3 — Enhanced Scribd & Studocu DOM preloader, graphic poster UI theme, and dual language support.
```

### Category [REQUIRED]
`Productivity` *(Hoặc `Accessibility`)*

### Single Purpose Statement [REQUIRED for Developer Dashboard Review]
`"Provides a clutter-free reading view and formats study documents for print-ready PDF export on supported platforms."`

---

## 2. Graphics & Assets Checklist

| Asset | Dimensions | Format | Status | File Path |
|-------|-----------|--------|--------|-----------|
| **Store Icon** [REQUIRED] | 128×128 px | PNG (transparent/solid) | ✅ Ready | `icons/icon128.png` |
| **Screenshot 1** [REQUIRED] | 1280×800 px (hoặc 640×400) | PNG/JPEG | 🟡 Cần chụp | Chụp popup giao diện v1.3 trên màn hình tài liệu |
| **Screenshot 2** [RECOMMENDED] | 1280×800 px | PNG/JPEG | 🟡 Cần chụp | Chụp nút Floating Action Button (FAB) góc dưới màn hình |
| **Screenshot 3** [RECOMMENDED] | 1280×800 px | PNG/JPEG | 🟡 Cần chụp | Chụp trang tài liệu trước và sau khi được dọn sạch banner |
| **Screenshot 4** [RECOMMENDED] | 1280×800 px | PNG/JPEG | 🟡 Cần chụp | Hộp thoại Print PDF xuất trang A4 sắc nét |
| **Small Promo Tile** [RECOMMENDED] | 440×280 px | PNG/JPEG | ⬜ Tùy chọn | Banner quảng bá hiển thị trên trang chủ store |
| **Marquee Promo Tile** | 1400×560 px | PNG/JPEG | ⬜ Tùy chọn | Banner lớn đề xuất |

> **Lưu ý chụp Screenshot:**
> - Kích thước bắt buộc phải chuẩn xác: đúng `1280 x 800` px hoặc `640 x 400` px.
> - Không để viền đen xung quanh, không dùng mockup điện thoại/tablet (vì đây là extension máy tính).

---

## 3. Permissions Justification (Giải trình quyền hạn cho Google Review)

*Điền vào form "Permissions justification" trên Developer Dashboard:*

| Permission | Type | Plain-English Justification (Copy nguyên văn gửi Google) |
|------------|------|---------------------------------------------------------|
| `storage` | permissions | Used exclusively to save the user's preferred interface language (English or Vietnamese) locally on their device. |
| `cookies` | permissions | Used solely to clear session cache cookies locally on specified document domains (studocu.com, scribd.com) so that the document reading interface displays without corrupted cached states. |
| `scripting` | permissions | Used to dynamically inject print-layout CSS rules and image preloader scripts into the active document tab when the user triggers the PDF export function. |
| `activeTab` | permissions | Grants temporary access to the active document tab when the user clicks the extension popup or floating action button, allowing the extension to inspect document elements for printing. |
| `webNavigation` | permissions | Listens to navigation events on supported study domains to automatically apply clean reading CSS stylesheets as early as document_start. |
| `*://*.studocu.com/*` | host_permissions | Allows reading mode stylesheets and document preloader scripts to run on Studocu document pages. |
| `*://*.studocu.vn/*` | host_permissions | Allows reading mode stylesheets and document preloader scripts to run on localized Vietnamese Studocu document pages. |
| `*://*.scribd.com/*` | host_permissions | Allows reading mode stylesheets and document preloader scripts to run on Scribd document pages. |

---

## 4. Privacy & Data Use Disclosure (Bản kê khai dữ liệu)

### Data Collection Form
- **Does the extension collect user data?** ❌ **NO**
- Tất cả các mục dữ liệu (Personally Identifiable Info, Health, Financial, Authentication, Web history, User activity, Website content): chọn **"Not Collected"**.

### Data Use Certification
- [x] Extension does not sell user data to third parties.
- [x] Extension does not use or transfer data for purposes unrelated to the item's single purpose.
- [x] Extension does not use or transfer user data for creditworthiness or lending purposes.

### Privacy Policy URL [REQUIRED]
- URL Công khai: `https://github.com/khanhnkq/DocCleaner/blob/main/PRIVACY_POLICY.md`  
  *(Hoặc triển khai qua GitHub Pages: `https://khanhnkq.github.io/DocCleaner/privacy.html`)*

---

## 5. Distribution Settings

- **Visibility:** Public (hoặc Unlisted nếu muốn test kín trước)
- **Regions:** All regions (Toàn cầu)
- **Pricing:** Free (Miễn phí 100%)

---

## 6. Developer Information

- **Publisher Name:** Khanhnkq
- **Contact Email:** *(Email tài khoản Google Developer của bạn)*
- **Support URL:** `https://github.com/khanhnkq/DocCleaner/issues`
- **Homepage URL:** `https://github.com/khanhnkq/DocCleaner`

---

## 7. Version History

| Version | Date | Changes Summary | Status |
|---------|------|-----------------|--------|
| 1.3 | 2026-10-07 | First public package for Chrome Web Store. Multi-platform support (Studocu + Scribd), A4 PDF Print preloader, Graphic Poster popup UI. | Draft |
