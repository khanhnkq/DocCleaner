# 🚀 DocCleaner - Better Studocu & Scribd Reader (Free)

An intelligent, lightweight Chrome Extension designed for a **better, distraction-free reading experience** and **clean print-friendly document formatting** on Studocu and Scribd — **100% Free**.

Think of it as **"Reader Mode" for your study platforms** — like Pocket or Safari Reader, but tailored specifically for **Better Studocu** and **Better Scribd** document viewing.

> **Version:** `v1.7.0` (Better Studocu & Better Scribd Support · 100% Free)  
> 🌐 **Official Website:** [https://khanhnkq.github.io/DocCleaner/](https://khanhnkq.github.io/DocCleaner/)

---

## ✨ Key Features (100% Free)

### 1. 📖 Interactive Clean Reader Mode (v1.7)
- **Top Reader Bar:** Fixed status bar with real-time page counter (`Page X of Y`), direct "Print / Save PDF (A4)" button, and "Exit Clean View".
- **Better Studocu Experience:** Automatically cleans the viewing canvas, removes intrusive promotional banners, and provides a focused study environment.
- **Better Scribd Experience:** Strips visual clutter, hides cookie popups, and optimizes text clarity for seamless reading.
- Seamless automatic detection for `studocu.com`, `studocu.vn`, and `scribd.com`.

### 2. 🛡️ Clean, Distraction-Free Layout & Ultra-Light RAM Engine
- **Instant Clean at `document_start`:** Minimizes floating overlays, promotional popups, and cookie consent backdrops (OneTrust, Didomi) before the page finishes loading.
- **Transient Blob URL Engine (>90% RAM Savings):** Employs transient Blob URLs instead of heavy Base64 strings, eliminating tab freezing and browser lag on student laptops.
- **Dynamic Interface Cleaner:** Detects and cleans disruptive floating elements and scroll prompts in real time.

### 3. 📄 Smart Print Layout & A4 Document Formatter (Zero Blank Pages)
- Pre-renders document pages smoothly to eliminate blank sections and virtual scrolling artifacts.
- Automatically calculates scaling and centers pages into clean, crisp, print-ready A4 dimensions (`210mm × 296mm`) with zero alternating blank pages.

### 4. ⚡ 1-Click Floating Action Button & Reader Toolbar
- Sleek floating action button positioned at the bottom-right corner.
- One single click triggers the entire flow: Clean Layout ➔ Preload Pages ➔ A4 Centering ➔ Open Native Print Dialog without DOM destruction race conditions.

### 5. 🌐 Dual-Language Support (English & Tiếng Việt)
- Instant one-tap language switching between English and Vietnamese right inside the popup menu.

---

## 🛠 Installation Guide

### Option 1: Download `.zip` File (Recommended for Users)
1. Download **`DocCleaner-v1.7.0.zip`** from [Releases](https://github.com/khanhnkq/DocCleaner/releases).
2. Extract the ZIP file to a local folder.
3. Open `chrome://extensions/` ➔ Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the extracted folder.

### Option 2: Clone via Git (For Developers)
```bash
git clone https://github.com/khanhnkq/DocCleaner.git
```
Open `chrome://extensions/` ➔ Enable **Developer mode** ➔ Click **Load unpacked** and select the project folder.

---

## 🎯 How to Use

1. Open any study document on **Studocu** or **Scribd**.
2. DocCleaner automatically enables the clean reading view.
3. Click the floating **"Format for Print"** button at the bottom-right (or open the popup).
4. Wait a few seconds while pages are preloaded into a clean print layout.
5. In the Chrome print dialog, choose **"Save as PDF"** to save your clean study notes.

---

## 🔒 Privacy & Safety

DocCleaner runs **100% locally in your browser**:
- ❌ **NO** data collection or user tracking.
- ❌ **NO** external servers or cloud dependencies.
- ❌ **NO** analytics or third-party scripts.
- ✅ **100% Free and Open Source**.

---

## 📚 Development & Plans

- 🎨 [Design System & Visual Guidelines](docs/DESIGN_SYSTEM.md)
- 📋 [Uninstall Flow & Feedback Plan](docs/plans/UNINSTALL_FEATURE_PLAN.md)
- 🎨 [Color Palette Fix Plan](docs/plans/color_palette_fix_plan.md)
- 🏪 [Chrome Web Store Listing Copy](docs/CHROMEWEBSTORE.md)
- 🔒 [Privacy Policy](docs/PRIVACY_POLICY.md)

---

## ⚠️ Disclaimer

This project is developed strictly for **educational and personal productivity purposes**. Please respect platform Terms of Service and original authors' copyrights.
