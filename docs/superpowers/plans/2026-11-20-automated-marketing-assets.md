# Automated Marketing Screenshots & Demo Video Generation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated marketing asset generation pipeline using a local document mock showcase harness, the `/browser` subagent, Google Chrome automation, and `ffmpeg` to create 5 standard Chrome Web Store screenshots (1280×800), 2 promotional tiles (1400×560 & 440×280), an optimized animated GIF, and a 1080p 60fps demo video showcasing DocCleaner v1.8.0.

**Architecture:** 
1. Build a local lightweight HTTP server (`scripts/marketing-harness/`) serving high-fidelity mock Studocu and Scribd document pages that realistically reproduce paywalls, blurs, and clutter, while embedding the extension's live stylesheets (`viewer_styles.css`, `popup.css`), content scripts (`content.js`, `scribd_handler.js`), and popup UI (`popup.html`).
2. Implement an automated Chrome capture controller (`scripts/marketing-harness/record-demo.js`) that uses native Google Chrome on macOS with smooth mouse trajectory interpolation to capture frame-by-frame interactions.
3. Process frames via `/opt/homebrew/bin/ffmpeg` into a crisp 1080p MP4 demo video and a 60fps palette-quantized animated GIF for GitHub README and social media.
4. Delegate visual inspection and quality audit to the `/browser` subagent on `http://localhost:PORT/gallery.html`.

**Tech Stack:** Node.js, Native Google Chrome (macOS), `ffmpeg`, HTML5 Canvas / SVG Frame Mockups, `/browser` subagent.

**Spec / Requirements:**
- Chrome Web Store Standard Screenshot dimensions: 1280×800px (16:10 aspect ratio), PNG/JPEG.
- Marquee Promotional Tile: 1400×560px.
- Small Promotional Tile: 440×280px.
- Demo Video: 1080p (1920×1080 or 1280×720), 15–20s, MP4 (H.264 / AAC).
- GitHub / Social Animated GIF: < 10MB, smooth 30-50fps, sharp 256-color palette.
- Design Language: DocCleaner Strict Flat Graphic Poster Theme (`#091b42`, `#193582`, `#c6eb34`, `#58c474`, `#f6f7ef`, `#ffffff`), 1.5px crisp borders, zero blur/shadow slop.

---

## Global Constraints

- Must represent DocCleaner v1.8.0 accurately (Studocu + Scribd support, 44px compact FAB with Lucide download icon, Study Shelf with ST/SC badges, bookmark stars, inline delete, and 4-locale switcher `[VN] [EN] [ES] [FR]`).
- Strictly zero active box-shadow, zero `filter: blur()`, and zero backdrop-filter in DocCleaner's own UI elements.
- Zero emojis across all marketing copy, headers, badges, and overlays.
- Real local document mock pages must be self-contained (no external network dependencies or fragile live scraping that could break during capture).
- Generated assets must be exported into `store-assets/` and `assets/demo/`.

---

## Review Focus

1. **Resolution & Distortion:** Screenshot dimensions must match exactly 1280×800px and promo tiles must match 1400×560px and 440×280px without stretching or letterbox artifacts.
2. **Text Legibility:** Marketing headlines, feature pills, and document text must remain crisp and readable at 50% display zoom in Chrome Web Store search results.
3. **Smooth Video Motion:** Converted MP4 and GIF must maintain consistent framerate without stuttering or sudden cursor teleportation.
4. **Before vs After Contrast:** The unblur and clutter removal must show an unmistakable, dramatic contrast between the paywalled/blurred state and the clean readable state.
5. **Brand Consistency:** Colors must adhere strictly to DocCleaner Graphic Poster tokens (`#091b42`, `#193582`, `#c6eb34`, `#58c474`).

---

## Implementation Tasks

### Task 1: Build Local Mock Document Showcase Harness (`demo-server`)

**Files:**
- Create: `scripts/marketing-harness/server.js`
- Create: `scripts/marketing-harness/mock-studocu.html`
- Create: `scripts/marketing-harness/mock-scribd.html`
- Create: `scripts/marketing-harness/mock-popup-view.html`

- [ ] **Step 1.1**: Create `scripts/marketing-harness/mock-studocu.html` replicating a realistic Studocu university lecture document:
  - Header with document title: *"Kinh Tế Vi Mô - Đề Thi & Lời Giải Chi Tiết 2025"*.
  - Pages 1-3 readable, Pages 4-6 blurred with CSS `.pf { filter: blur(5px); }`, overlay paywall banner *"Tài liệu bị giới hạn - Mở khóa bằng Premium"*, and floating promo bar.
  - Integration of live `viewer_styles.css`, `content.js`, and live FAB button component.
- [ ] **Step 1.2**: Create `scripts/marketing-harness/mock-scribd.html` replicating a realistic Scribd academic guide:
  - Header: *"English for Everyday Activities - Complete Study Guide"*.
  - Blur overlays with Scribd paywall *"Read with a free 30-day trial"* and bottom ad bar.
  - Integration of live `scribd_handler.js` and live emerald FAB button (`#58c474`).
- [ ] **Step 1.3**: Create `scripts/marketing-harness/mock-popup-view.html` replicating the live 320px popup UI embedded in an attractive poster card:
  - Demonstrates Quick Actions tab (1-Click Print & Clean View buttons).
  - Demonstrates Study Shelf tab with ST and SC documents, bookmark stars, page counts, relative timestamps, and the new inline confirmation delete bar.
- [ ] **Step 1.4**: Create `scripts/marketing-harness/server.js` using Node.js standard `http` module to serve the mock directory on `http://127.0.0.1:4567`.
- [ ] **Step 1.5**: Verify server starts cleanly and pages load with complete styling via `curl -I http://127.0.0.1:4567/mock-studocu.html`.

---

### Task 2: Build Graphic Poster Marketing Frame Composer

**Files:**
- Create: `scripts/marketing-harness/compose-frames.js`
- Create: `scripts/marketing-harness/templates/poster-frame.html`

- [ ] **Step 2.1**: Design the HTML/CSS template `poster-frame.html` adhering to Chrome Web Store 1280×800 aspect ratio:
  - Deep Navy Canvas (`#091b42`) with subtle geometric background grid.
  - Top Editorial Header: High-contrast typography with pill badges (e.g., `[ 1-CLICK CLEAN VIEW ]`, `[ STUDOCU & SCRIBD ]`, `[ 100% FREE ]`).
  - Central Browser Window Mockup with crisp 1.5px navy border, rounded 12px corners, and cream/white body showing the live captured viewport.
  - Floating feature callout pills with arrows pointing to the FAB button and clean document view.
- [ ] **Step 2.2**: Implement `compose-frames.js` to render the 5 target screenshot themes:
  - **Screen 1**: *Xoá Mờ & Bỏ Giới Hạn Đọc* (Side-by-side Before/After on Studocu).
  - **Screen 2**: *Định Dạng In A4 Chuẩn* (Clean A4 pages ready for print/PDF export).
  - **Screen 3**: *Hỗ Trợ Toàn Diện Scribd & Studocu* (Dual platform demonstration).
  - **Screen 4**: *Kệ Học Tập Tự Động & Đánh Dấu Sao* (Study Shelf tab with 4 cards, badges, and quick delete).
  - **Screen 5**: *Đa Ngôn Ngữ VN/EN/ES/FR & Bảo Mật Tuyệt Đối* (Language selector and zero data tracking).
- [ ] **Step 2.3**: Build Marquee Promo Tile template (1400×560px) and Small Promo Tile template (440×280px) in `compose-frames.js`.

---

### Task 3: Automated Chrome Screenshot & Frame Capturer

**Files:**
- Create: `scripts/marketing-harness/capture-assets.js`

- [ ] **Step 3.1**: Implement `capture-assets.js` using native macOS Google Chrome CLI (`/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome`):
  - Flags: `--headless=new`, `--screenshot`, `--window-size=1280,800`, `--hide-scrollbars`, `--force-device-scale-factor=1`.
- [ ] **Step 3.2**: Capture raw document viewport screenshots from `http://127.0.0.1:4567`:
  - `raw_studocu_before.png` (blurred with paywall).
  - `raw_studocu_after.png` (after unblur click).
  - `raw_scribd_clean.png`.
  - `raw_popup_actions.png`.
  - `raw_popup_shelf.png`.
- [ ] **Step 3.3**: Pipe raw captures through `compose-frames.js` to generate final store-ready assets into `store-assets/`:
  - `screenshot1_1280x800.png` (Before vs After Unblur).
  - `screenshot2_1280x800.png` (1-Click Print & A4 Layout).
  - `screenshot3_1280x800.png` (Scribd & Studocu Dual Support).
  - `screenshot4_1280x800.png` (Smart Study Shelf & Bookmarks).
  - `screenshot5_1280x800.png` (4-Language Switcher & Privacy).
  - `marquee_1400x560.png` (Chrome Web Store Hero Banner).
  - `promo_small_440x280.png` (Store Tile).
- [ ] **Step 3.4**: Verify image dimensions with `sips -g pixelWidth -g pixelHeight store-assets/*.png`.

---

### Task 4: Video Demo Frame Recording & `ffmpeg` Encoding (MP4 + GIF)

**Files:**
- Create: `scripts/marketing-harness/record-video.js`

- [ ] **Step 4.1**: Create `record-video.js` to automate a 15-second simulation story:
  - **Act 1 (0s - 4s)**: User lands on blurred Studocu page.
  - **Act 2 (4s - 8s)**: Animated cursor glides towards the Lime FAB button (`.dc-clean-btn`); cursor clicks, ripple animation triggers, paywall dissolves, document renders in clean A4 view.
  - **Act 3 (8s - 13s)**: Cursor moves to extension popup; Study Shelf opens smoothly, document appears at Index 0 with `ST` badge, star button is clicked.
  - **Act 4 (13s - 16s)**: Language pills click `[VN]` -> `[EN]`; end card with DocCleaner logo, "100% Free - Better Studocu & Scribd Reader".
- [ ] **Step 4.2**: Generate sequential frame sequence (`frames/frame_%04d.png`) at 30fps.
- [ ] **Step 4.3**: Encode 1080p MP4 video with `ffmpeg`:
  ```bash
  ffmpeg -y -framerate 30 -i frames/frame_%04d.png \
    -c:v libx264 -pix_fmt yuv420p -crf 18 \
    -vf "scale=1920:1080:flags=lanczos" \
    assets/demo/doccleaner_demo_1080p.mp4
  ```
- [ ] **Step 4.4**: Encode high-quality palette-quantized animated GIF for GitHub README:
  ```bash
  ffmpeg -y -framerate 30 -i frames/frame_%04d.png \
    -vf "fps=24,scale=800:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" \
    assets/demo/doccleaner_demo.gif
  ```
- [ ] **Step 4.5**: Verify MP4 playback and GIF file size (< 8MB).

---

### Task 5: Audit & Validation with `/browser` Subagent

**Files:**
- Create: `scripts/marketing-harness/gallery.html`

- [ ] **Step 5.1**: Build `gallery.html` displaying all generated marketing assets:
  - 5 Store Screenshots with zoom inspection.
  - Marquee Banner & Small Promo Tile.
  - Embedded HTML5 `<video>` playing `doccleaner_demo_1080p.mp4`.
  - Animated `<img>` showing `doccleaner_demo.gif`.
  - Verification checklist for dimensions, color contrast, and typography.
- [ ] **Step 5.2**: Launch the `browser` subagent (`Model: flash`) to navigate to `http://localhost:4567/gallery.html`.
- [ ] **Step 5.3**: Have `/browser` inspect visual elements, click playback controls, verify high-contrast readability, and confirm zero UI glitches.
- [ ] **Step 5.4**: Update `README.md` and `docs/CHROMEWEBSTORE.md` with links to the newly generated marketing assets.

---

## Deliverables & Artifacts
1. **Chrome Web Store Assets** in `store-assets/`:
   - `screenshot1_1280x800.png` through `screenshot5_1280x800.png`
   - `marquee_1400x560.png` (1400×560)
   - `promo_small_440x280.png` (440×280)
2. **Video & GIF Demos** in `assets/demo/`:
   - `doccleaner_demo_1080p.mp4` (1080p, 15-20s, 60fps)
   - `doccleaner_demo.gif` (High-resolution README animated preview)
3. **Reusable Automation Suite** in `scripts/marketing-harness/`:
   - Re-runnable any time a new release or UI update is shipped.
