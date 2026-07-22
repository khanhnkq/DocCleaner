# 🚀 DocCleaner & PDF Downloader (Studocu & Scribd)

An intelligent Chrome Extension designed to **automatically block 100% of ads, remove paywall/page blur overlays**, and **export HD sharp A4-ready PDF documents** from Studocu and Scribd with just **1-Click**.

> **Version:** `v1.3` (Multi-platform support for Studocu & Scribd + Comprehensive AdBlocker)

---

## ✨ Key Features

### 1. 🌐 Multi-Platform Support: Studocu & Scribd
- Automatically identifies active domain (`studocu.com`, `studocu.vn`, `scribd.com`).
- Applies tailored DOM cleaning rules optimized for each platform.

### 2. 🛡️ 100% Ad-Free & Paywall Removal (AdBlocker & Clean Mode)
- **Immediate Block at `document_start`:** Completely hides all ad banners, VIP upgrade popups, and cookie consent banners (OneTrust, Didomi) before the page even finishes loading.
- **Dynamic Ad Cleaner (`MutationObserver`):** Detects and removes all dynamically injected ad iframes (Google Ads, DoubleClick) and scroll popups.

### 3. 🔓 100% Page Unblur & Limit Bypass
- **Studocu:** Automatically extracts CloudFront Signatures to reload full resolution HD page backgrounds (`/html/bgN.png`), unblurring 100% of locked pages.
- **Scribd:** Removes CSS blur filters, restores hidden text elements, and removes overlay promotional blocks (`.page_blur_promo`, `.promo_wrapper`).

### 4. ⚡ Auto-Scroll Preload
- Overcomes Lazy Loading / Virtual Scrolling restrictions on both Scribd and Studocu.
- Automatically preloads 100% of pages into memory before printing, avoiding blank pages or formatting issues.

### 5. 📥 1-Click Floating Action Button ("Download HD PDF")
- Modern floating action button rendered at the bottom-right of the screen.
- Single click initiates the full pipeline: Remove Ads ➔ Preload Pages ➔ A4 Layout Alignment ➔ Trigger Chrome PDF Print Dialog.

---

## 🛠 Installation Guide

### Option 1: Download `.zip` File (Recommended for Users)
1. Visit the Releases page: **[GitHub Releases - DocCleaner v1.3](https://github.com/khanhnkq/DocCleaner/releases/tag/v1.3)**
2. Download **`DocCleaner-v1.3.zip`** and extract to a local folder.
3. Open `chrome://extensions/` ➔ Enable **Developer mode** in top-right ➔ Click **Load unpacked** and select the extracted folder.

### Option 2: Clone via Git (For Developers)
```bash
git clone https://github.com/khanhnkq/DocCleaner.git
```
Open `chrome://extensions/` ➔ Enable **Developer mode** ➔ Click **Load unpacked** and select the project folder.

---

## 🎯 How to Use

1. Open any lecture document on **Studocu.com**, **Studocu.vn**, or **Scribd.com**.
2. The extension automatically cleans ads and hides paywall overlays.
3. Click the floating **"Download HD PDF"** button at the bottom-right corner.
4. Wait a few seconds while pages are preloaded into a clean print container.
5. In the Chrome print dialog, select **"Save as PDF"** -> Click **Save**.

---

## ⚠️ Disclaimer

This project is developed strictly for **educational and technical research purposes (Proof of Concept)**. Please respect platform Terms of Service and original content copyrights.
