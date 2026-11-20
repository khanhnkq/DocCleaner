# Chrome Web Store Listing — DocCleaner v1.8.0

> **Last Updated:** November 2026  
> **Release Version:** `1.8.0`  
> **Target Platform:** Chrome Web Store (Manifest V3)  
> **Package File:** `DocCleaner-v1.8.0.zip` (and `dist/DocCleaner-v1.8.0.zip`)

---

## 1. Store Listing Metadata

### Extension Name [REQUIRED — Max 75 characters]
* **English:** `DocCleaner - Better Studocu & Scribd Reader (Free)`
* **Tiếng Việt:** `DocCleaner - Đọc Studocu & Scribd Tốt Hơn (Miễn Phí)`
* **Español:** `DocCleaner - Mejor Lector de Studocu y Scribd (Gratis)`
* **Français:** `DocCleaner - Meilleur Lecteur Studocu & Scribd (Gratuit)`

*(Third-party brand names used descriptively: "Better [Platform]" pattern approved by Chrome Web Store policies).*

---

### Short Description [REQUIRED — Max 132 characters]
* **English (127 chars):**  
  `Free clean reader for Studocu & Scribd. Better reading: remove clutter, distraction-free focus mode, and print-friendly layout.`

* **Tiếng Việt (130 chars):**  
  `Đọc Studocu & Scribd tốt hơn, miễn phí. Dọn sạch banner vướng mắt, chế độ đọc tập trung, tối ưu bố cục trang in.`

* **Español (131 chars):**  
  `Lector limpio y gratuito para Studocu y Scribd. Elimina distracciones, modo lectura sin anuncios y diseño listo para imprimir.`

* **Français (131 chars):**  
  `Lecteur propre et gratuit pour Studocu et Scribd. Supprime les bannières, mode lecture concentré et mise en page d'impression A4.`

---

### Detailed Description [REQUIRED]
*(Copy and paste the plain text below into the Chrome Web Store Developer Dashboard)*

```text
DocCleaner is a 100% free, lightweight reading companion designed to provide a better, distraction-free experience when studying lecture notes, textbooks, and documents on Studocu and Scribd.

Think of it as "Reader Mode" for academic study platforms — similar to Safari Reader or Pocket, but tailored specifically to optimize document layouts, eliminate clutter, and create flawless print-ready A4 notes.

WHY STUDENTS LOVE DOCCLEANER
Studocu and Scribd host millions of invaluable study materials, but intrusive promotional banners, floating overlays, and multi-layer popups constantly disrupt student focus. DocCleaner eliminates distractions instantly, allowing you to focus purely on learning.

CORE FEATURES (100% FREE FOREVER)

1. Distraction-Free Study Reader
• Automatically strips floating banners, upgrade nag bars, and promotional overlays.
• Smooth continuous document viewer without jarring page popups.

2. Mathematical A4 Print Engine
• Solves Chrome's alternating blank page issue by normalizing document canvases to exact A4 printing dimensions (794px × 1123px).
• Pre-renders pages smoothly to prevent blank sections during print spooling.
• Pro-Tip: In Chrome's print dialog, set Margins to "None" and check "Background graphics" for crisp notes!

3. Local Study Shelf (Recent Documents & Starred Favorites)
• Automatically remembers your recently cleaned documents (up to 25 items).
• 1-Click Launch: Reopen any cleaned document directly into clean view.
• Star / Favorite documents for fast revision before exams.
• Stored 100% locally in your browser — zero tracking, zero server uploads.

4. Campus Lab & Library PC Mode
• Studying on a public university workstation or library computer?
• Enable "Lab PC Mode" to keep study history strictly in ephemeral session memory.
• 1-Click "Clean & Burn Session" instantly wipes local cache and document cookies when you finish your study session.

5. 4-Language Interface
• Switch between English, Vietnamese, Spanish, and French ([VN] [EN] [ES] [FR]) with zero page reload.

6. Pure Flat Graphic Design
• High-contrast, clean typography inspired by functional editorial posters.
• Zero heavy shadows, zero GPU blur effects, zero battery drain.

SUPPORTED PLATFORMS (FREE)
• Studocu (studocu.com, studocu.vn)
• Scribd (scribd.com)

HOW TO USE
1. Open any document on Studocu or Scribd.
2. DocCleaner automatically cleans the visual clutter.
3. Click the bottom-right floating button or popup icon to format for print or view in Clean Reader.
4. Save as A4 PDF or print directly for your study binder!

PRIVACY & SECURITY FIRST
• 100% Local Execution: Everything runs directly inside your browser.
• Zero Tracking / Telemetry: No browsing history, document contents, or personal info is ever tracked, stored on servers, or transmitted.
• Open Source: Fully transparent codebase audited for safety.

SUPPORT & COMMUNITY
• GitHub: https://github.com/khanhnkq/DocCleaner
• Buy Me A Coffee: https://khanhnkq.quizken.com/buy-me-a-coffee

Release v1.8.0 — Full Study Shelf, Lab PC Mode, 4-Language i18n, and Day-0 Onboarding Tour.
```

---

### Category [REQUIRED]
`Productivity`

### Single Purpose Statement [REQUIRED for Developer Dashboard Review]
`"Provides a free, distraction-free reading mode, local study history shelf, and clean A4 print layout for study documents on Studocu and Scribd."`

---

## 2. Permissions Justification (For Google Review)

*Copy the exact plain-English justification for each permission into the Google Developer Console:*

| Permission | Type | Plain-English Justification for Google Reviewers |
|:---|:---|:---|
| `storage` | `permissions` | Used strictly to persist the user's interface language selection (EN, VI, ES, FR), Lab PC Mode state, and the local Study Shelf (up to 25 recent document titles and URLs) on the user's local device. No data is ever sent to external servers. |
| `cookies` | `permissions` | Used exclusively by the "Clean & Burn" feature and layout cleaner to clear cached promotional display states and transient session cookies on supported domains (studocu.com, studocu.vn, scribd.com) so that the document renders cleanly and students on shared library PCs can erase their session data upon departure. |
| `scripting` | `permissions` | Used to dynamically inject reading-mode layout rules and document page normalization scripts into the active tab when the student activates the print format or clean reader mode. |
| `activeTab` | `permissions` | Grants temporary access to the active document tab when the user clicks the extension action button or floating badge, allowing the extension to clean visual clutter and initiate print formatting on demand. |
| `webNavigation` | `permissions` | Listens to navigation events (`onCommitted` / `onHistoryStateUpdated`) exclusively on supported study platforms to apply distraction-free reading styles at `document_start` before intrusive banners render. |
| `*://*.studocu.com/*` | `host_permissions` | Enables reading mode stylesheets, banner removal, and print layout formatting on Studocu global document pages. |
| `*://*.studocu.vn/*` | `host_permissions` | Enables reading mode stylesheets, banner removal, and print layout formatting on localized Vietnamese Studocu document pages. |
| `*://*.scribd.com/*` | `host_permissions` | Enables reading mode stylesheets, banner removal, and print layout formatting on Scribd document pages. |

---

## 3. Privacy & Data Use Disclosure (Declaration Form)

* **Does the extension collect user data?**  
  👉 Select: ❌ **NO**

* **Data Types Assessment:**  
  Set all data types to **"Not Collected"**:
  - Personally Identifiable Information (PII): ❌ Not Collected
  - Health information: ❌ Not Collected
  - Financial and Payment Information: ❌ Not Collected
  - Authentication Information: ❌ Not Collected
  - Personal Communications: ❌ Not Collected
  - Location: ❌ Not Collected
  - Web History: ❌ Not Collected *(Study Shelf is stored 100% on the client device via `chrome.storage.local` and never transmitted)*
  - User Activity: ❌ Not Collected
  - Website Content: ❌ Not Collected

* **Data Use Certification Checkboxes:**  
  - [x] Extension does not sell user data to third parties.
  - [x] Extension does not use or transfer data for purposes unrelated to the item's single purpose.
  - [x] Extension does not use or transfer user data for creditworthiness or lending purposes.

* **Privacy Policy URL [REQUIRED]:**  
  `https://github.com/khanhnkq/DocCleaner/blob/main/PRIVACY_POLICY.md`

---

## 4. Graphics & Visual Assets Checklist

### English Store Assets (Primary International Listing)
| Asset | Dimensions | Format | Status | Location |
|:---|:---|:---|:---|:---|
| **Store Icon** [REQUIRED] | 128×128 px | PNG | ✅ Ready | `icons/icon128.png` |
| **Screenshot 1** [REQUIRED] | 1280×800 px | PNG | ✅ Ready | `store-assets/en/screenshot1_1280x800.png` (Unblur Content & Remove Paywalls) |
| **Screenshot 2** [RECOMMENDED] | 1280×800 px | PNG | ✅ Ready | `store-assets/en/screenshot2_1280x800.png` (Standardized A4 Print Layout) |
| **Screenshot 3** [RECOMMENDED] | 1280×800 px | PNG | ✅ Ready | `store-assets/en/screenshot3_1280x800.png` (Full Support for Studocu & Scribd) |
| **Screenshot 4** [RECOMMENDED] | 1280×800 px | PNG | ✅ Ready | `store-assets/en/screenshot4_1280x800.png` (Auto Study Shelf & Star Favorites) |
| **Screenshot 5** [RECOMMENDED] | 1280×800 px | PNG | ✅ Ready | `store-assets/en/screenshot5_1280x800.png` (Multilingual & Campus Lab PC Privacy) |
| **Small Promo Tile** [RECOMMENDED] | 440×280 px | PNG | ✅ Ready | `store-assets/en/promo_small_440x280.png` |
| **Marquee Promo Tile** [OPTIONAL] | 1400×560 px | PNG | ✅ Ready | `store-assets/en/marquee_1400x560.png` |
| **1080p Demo Video** [STORE/YOUTUBE] | 1920×1080 px | MP4 (H.264, 30fps) | ✅ Ready | `assets/demo/en/doccleaner_demo_1080p.mp4` |
| **Animated Demo GIF** [README/WEB] | 800×450 px | GIF89a (<8MB) | ✅ Ready | `assets/demo/en/doccleaner_demo.gif` |

### Vietnamese Store Assets (Localized Store Listing)
| Asset | Dimensions | Format | Status | Location |
|:---|:---|:---|:---|:---|
| **Screenshot 1** [REQUIRED] | 1280×800 px | PNG | ✅ Ready | `store-assets/screenshot1_1280x800.png` / `store-assets/vi/` |
| **Screenshot 2** [RECOMMENDED] | 1280×800 px | PNG | ✅ Ready | `store-assets/screenshot2_1280x800.png` / `store-assets/vi/` |
| **Screenshot 3** [RECOMMENDED] | 1280×800 px | PNG | ✅ Ready | `store-assets/screenshot3_1280x800.png` / `store-assets/vi/` |
| **Screenshot 4** [RECOMMENDED] | 1280×800 px | PNG | ✅ Ready | `store-assets/screenshot4_1280x800.png` / `store-assets/vi/` |
| **Screenshot 5** [RECOMMENDED] | 1280×800 px | PNG | ✅ Ready | `store-assets/screenshot5_1280x800.png` / `store-assets/vi/` |
| **Small Promo Tile** [RECOMMENDED] | 440×280 px | PNG | ✅ Ready | `store-assets/promo_small_440x280.png` / `store-assets/vi/` |
| **Marquee Promo Tile** [OPTIONAL] | 1400×560 px | PNG | ✅ Ready | `store-assets/marquee_1400x560.png` / `store-assets/vi/` |
| **1080p Demo Video** [STORE/YOUTUBE] | 1920×1080 px | MP4 (H.264, 30fps) | ✅ Ready | `assets/demo/doccleaner_demo_1080p.mp4` |
| **Animated Demo GIF** [README/WEB] | 800×450 px | GIF89a (<8MB) | ✅ Ready | `assets/demo/doccleaner_demo.gif` |

---

## 5. Submission Step-by-Step Walkthrough

1. Open the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Click on **"DocCleaner"** item in your developer list.
3. In the left navigation, click **"Package"** -> Click **"Upload new package"**.
4. Select the generated file: `DocCleaner-v1.8.0.zip` (located in the project root or `dist/DocCleaner-v1.8.0.zip`).
5. In the **"Store listing"** tab:
   - Check Extension Name: `DocCleaner - Better Studocu & Scribd Reader (Free)`
   - Verify Short Description and Detailed Description (copy from Section 1 above).
   - Ensure Category is `Productivity`.
   - Verify screenshots and promotional tiles.
6. In the **"Privacy"** tab:
   - Set Single Purpose to the text in Section 1.
   - Fill in Permissions Justifications from the table in Section 2.
   - Confirm all Data Collection questions are marked "Not Collected".
   - Confirm Privacy Policy URL is entered.
7. Click **"Save draft"** -> Click **"Submit for review"**.
