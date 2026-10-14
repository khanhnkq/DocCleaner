# Chrome Web Store Listing — DocCleaner

> Last Updated: 2026-10-14  
> Version: 1.4  
> Target Platforms: Chrome Web Store (Manifest V3)

---

## 1. Store Listing Metadata

### Extension Name [REQUIRED]
*English:* `DocCleaner - Better Studocu & Scribd Reader (Free)`  
*Tiếng Việt:* `DocCleaner - Đọc Studocu & Scribd Tốt Hơn (Miễn Phí)`  
*(Max 75 characters. Nhãn hiệu bên thứ ba được dùng theo dạng mô tả "better [platform]" — tương tự pattern "Better TweetDeck", "Better YouTube" trên Chrome Web Store).*

### Short Description [REQUIRED]
*English (127 chars):*  
`Free clean reader for Studocu & Scribd. Better reading: remove clutter, distraction-free focus mode, and print-friendly layout.`

*Tiếng Việt (130 chars):*  
`Đọc Studocu & Scribd tốt hơn, miễn phí. Dọn sạch banner vướng mắt, chế độ đọc tập trung, tối ưu bố cục trang in.`

### Detailed Description [REQUIRED]
*(Plain text format, Chrome Web Store tự động loại bỏ Markdown)*

```text
DocCleaner is a free, lightweight reading companion that gives you a better, 
cleaner experience when studying documents on Studocu and Scribd.

Think of it as "Reader Mode" for your study platforms — like the clean reading 
experience on Pocket or Safari Reader, but designed specifically for Better 
Studocu and Better Scribd document viewing.

WHY DOCCLEANER?
Studocu and Scribd are amazing platforms for study documents, but floating 
banners, promotional overlays, and cookie popups can break your focus. 
DocCleaner gives you a better, distraction-free reading experience — for free.

FEATURES (100% FREE)
• Better Studocu Reading — Clean layout, remove floating banners and 
  promotional overlays for a distraction-free Studocu experience.
• Better Scribd Reading — Strip visual clutter and cookie consent popups 
  so you can focus on Scribd document content.
• Smart Page Formatter — Pre-renders all document pages smoothly to prevent 
  blank sections, then aligns everything into a clean print-friendly layout.
• 1-Click Print Format — A floating button lets you prepare the entire 
  document for Chrome's native print dialog. Perfect for creating study notes.
• Dual-Language Interface — Switch between English and Vietnamese right 
  inside the popup. Completely free.

PLATFORMS SUPPORTED (FREE)
• Better Studocu (studocu.com, studocu.vn) — Free clean reader
• Better Scribd (scribd.com) — Free clean reader

HOW IT WORKS
1. Open any document on Studocu or Scribd.
2. DocCleaner automatically cleans the layout for better, distraction-free reading.
3. Click the floating button to format the document for printing.
4. Use Chrome's "Save as PDF" to keep a clean copy for offline study.

FREE FOREVER
DocCleaner is and will always be 100% free. No premium tiers, no subscriptions, 
no hidden fees. Better Studocu and Better Scribd reading for everyone.

PRIVACY & SECURITY
DocCleaner runs 100% locally in your browser:
• No data collection, no tracking, no analytics.
• No external servers or cloud dependencies.
• All processing happens on your own device.
• Free and open source.

PERMISSIONS EXPLAINED
• "storage" — Saves your language preference locally.
• "cookies" — Clears cached display states on document pages.
• "scripting" & "activeTab" — Applies reading-mode styles when you 
  click the action button.
• "webNavigation" — Detects page loads to apply clean layout early.

SUPPORT & FEEDBACK
• GitHub: https://github.com/khanhnkq/DocCleaner
• Support the author: https://khanhnkq.quizken.com/buy-me-a-coffee

Version 1.4 — Better Studocu & Better Scribd support, free clean reader with 
print formatter and dual-language interface.
```

### Category [REQUIRED]
`Productivity`

### Single Purpose Statement [REQUIRED for Developer Dashboard Review]
`"Provides a free, distraction-free reading mode and clean print layout for study documents on Studocu and Scribd."`

---

## 2. Graphics & Assets Checklist

| Asset | Dimensions | Format | Status | File Path |
|-------|-----------|--------|--------|-----------|
| **Store Icon** [REQUIRED] | 128×128 px | PNG (transparent/solid) | ✅ Ready | `icons/icon128.png` |
| **Screenshot 1** [REQUIRED] | 1280×800 px (hoặc 640×400) | PNG/JPEG | 🟡 Cần chụp | Chụp popup v1.3 hiển thị "Better Studocu · Free" |
| **Screenshot 2** [RECOMMENDED] | 1280×800 px | PNG/JPEG | 🟡 Cần chụp | Chụp FAB button "Format for Print" góc dưới màn hình |
| **Screenshot 3** [RECOMMENDED] | 1280×800 px | PNG/JPEG | 🟡 Cần chụp | Before/After: trang Studocu trước và sau khi DocCleaner dọn sạch |
| **Screenshot 4** [RECOMMENDED] | 1280×800 px | PNG/JPEG | 🟡 Cần chụp | Hộp thoại Print — "Better Studocu free print layout" |
| **Small Promo Tile** [RECOMMENDED] | 440×280 px | PNG/JPEG | ✅ Ready | `store-assets/promo_small_440x280.png` |
| **Marquee Promo Tile** | 1400×560 px | PNG/JPEG | ✅ Ready | `store-assets/marquee_1400x560.png` |

> **Lưu ý chụp Screenshot:**
> - Kích thước bắt buộc phải chuẩn xác: đúng `1280 x 800` px hoặc `640 x 400` px.
> - Không để viền đen xung quanh, không dùng mockup điện thoại/tablet.
> - Nên hiển thị branding "Better Studocu" / "Better Scribd" / "Free" trong screenshot.

---

## 3. Permissions Justification (Giải trình quyền hạn cho Google Review)

*Điền vào form "Permissions justification" trên Developer Dashboard:*

| Permission | Type | Plain-English Justification (Copy nguyên văn gửi Google) |
|------------|------|----------------------------------------------------------|
| `storage` | permissions | Used exclusively to save the user's preferred interface language (English or Vietnamese) locally on their device. |
| `cookies` | permissions | Used solely to clear cached display states locally on specified document domains (studocu.com, scribd.com) so that the reading interface displays with a clean, consistent layout. |
| `scripting` | permissions | Used to dynamically apply reading-mode CSS rules and page formatter scripts into the active document tab when the user triggers the print format function. |
| `activeTab` | permissions | Grants temporary access to the active document tab when the user clicks the extension popup or floating action button, allowing the extension to apply clean reading styles. |
| `webNavigation` | permissions | Listens to navigation events on supported study domains to automatically apply clean reading CSS stylesheets as early as document_start. |
| `*://*.studocu.com/*` | host_permissions | Allows clean reading mode stylesheets and document formatter scripts to run on Studocu document pages for a better reading experience. |
| `*://*.studocu.vn/*` | host_permissions | Allows clean reading mode stylesheets and document formatter scripts to run on localized Vietnamese Studocu document pages. |
| `*://*.scribd.com/*` | host_permissions | Allows clean reading mode stylesheets and document formatter scripts to run on Scribd document pages for a better reading experience. |

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

- **Visibility:** Public
- **Regions:** All regions (Toàn cầu)
- **Pricing:** Free (Miễn phí 100%)

---

## 6. Developer Information

- **Publisher Name:** Khanhnkq
- **Contact Email:** *(Email tài khoản Google Developer của bạn)*
- **Support URL:** `https://github.com/khanhnkq/DocCleaner/issues`
- **Homepage URL:** `https://khanhnkq.github.io/DocCleaner/`

---

## 7. SEO Keyword Density Map

| Keyword | Lần xuất hiện trong Detailed Description | Vị trí |
|---------|----------------------------------------|--------|
| **Better Studocu** | 6 lần | Title, features, platforms, version note |
| **Better Scribd** | 5 lần | Title, features, platforms, version note |
| **Free** | 8 lần | Title, features header, platforms, "Free Forever" section, privacy |
| **clean reader** | 4 lần | Intro, platforms list |
| **distraction-free** | 3 lần | Intro, features, how-to |
| **print** | 4 lần | Features, how-to |
| **study documents** | 2 lần | Intro, how-to |
| **reading mode** | 1 lần | Intro analogy |

---

## 8. Version History

| Version | Date | Changes Summary | Status |
|---------|------|-----------------|--------|
| 1.3 | 2026-10-14 | SEO update: "Better Studocu & Scribd" branding, "Free" emphasis, clean reader positioning. All user-facing text sanitized. | Draft |
| 1.3 | 2026-10-07 | First public package. Multi-platform support (Studocu + Scribd), A4 PDF Print preloader, Graphic Poster popup UI. | Published |
