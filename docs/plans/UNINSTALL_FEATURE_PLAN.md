# 📋 Kế Hoạch Triển Khai Chức Năng Khi Người Dùng Gỡ Tiện Ích (Uninstall Flow)

> **Dự án:** DocCleaner - Better Studocu & Scribd Reader  
> **Phiên bản áp dụng:** `v1.4+`  
> **Trạng thái:** 📝 Đã lập kế hoạch / Sẵn sàng triển khai  
> **Mục tiêu:** Thu thập nguyên nhân gỡ cài đặt (Churn Feedback), hỗ trợ khắc phục sự cố, cung cấp giải pháp cài đặt lại (Win-back), và đảm bảo minh bạch quyền riêng tư (Privacy-first).

---

## 1. ⚙️ Nguyên Lý Kỹ Thuật (Chrome Manifest V3)

### 1.1. Cơ chế hoạt động
Khi người dùng bấm **"Remove from Chrome" (Xóa khỏi Chrome)**, toàn bộ tiến trình JavaScript của Extension (Service Worker, Content Script, popup) sẽ bị hệ điều hành và trình duyệt **hủy ngay lập tức**. Extension **không thể** tự thực thi code dọn dẹp hoặc gửi request từ client tại thời điểm bấm xóa.

Giải pháp chuẩn duy nhất được Google Chrome cung cấp là:
```javascript
chrome.runtime.setUninstallURL(string url, function callback);
```

### 1.2. Giới hạn & Quy chuẩn kỹ thuật
- **Giao thức:** Bắt buộc là `http:` hoặc `https:`.
- **Độ dài URL tối đa:** **1023 ký tự** (giới hạn cứng của Chromium API).
- **Quyền (Permissions):** Không yêu cầu thêm bất kỳ permission nào trong `manifest.json`.
- **Hành vi:** Khi người dùng xóa tiện ích, trình duyệt sẽ tự động kích hoạt một tab mới mở tới URL đã đăng ký trước đó.

---

## 2. 🎯 Mục Tiêu Sản Phẩm (Product Objectives)

1. **Khảo sát lý do rời bỏ (Churn Rate Analysis):**
   - Phân tích nguyên nhân người dùng từ bỏ (do lỗi render trên Studocu/Scribd, trang nguồn đổi cấu trúc DOM, khó thao tác hay chỉ tải một lần).
2. **Giữ chân & Khắc phục sự cố (Troubleshooting & Win-back):**
   - Đưa ra hướng dẫn khắc phục nhanh cho các lỗi hay gặp.
   - Cung cấp nút CTA nổi bật **"Cài đặt lại từ Chrome Web Store"** (phòng trường hợp người dùng xóa nhầm hoặc muốn reset tiện ích).
3. **Bảo mật & Minh bạch dữ liệu:**
   - Cam kết với người dùng rằng mọi dữ liệu cục bộ (`chrome.storage.local`) đã được trình duyệt tự động xóa sạch, không để lại bất kỳ cookies hay mã theo dõi nào.
4. **Kênh tương tác cộng đồng:**
   - Điều hướng người dùng đóng góp ý kiến qua GitHub Issues hoặc ủng hộ qua Buy Me A Coffee.

---

## 3. 🗺️ Kế Hoạch Triển Khai Chi Tiết (Action Plan)

### 🔹 Giai đoạn 1: Cập nhật Extension Core (`background.js`) — ✅ ĐÃ HOÀN THÀNH

#### Nhiệm vụ đã triển khai:
- Ghi nhận mốc thời gian cài đặt ban đầu `installedAt` vào `chrome.storage.local` khi `chrome.runtime.onInstalled` được kích hoạt (tương thích cả cài đặt mới lẫn nâng cấp từ v1.3).
- Xây dựng hàm `setupUninstallURL()` được kích hoạt ngay khi Service Worker thức dậy.
- Tạo URL động chứa các tham số ngữ cảnh chuẩn mã hóa `URLSearchParams`:
  - `v`: Phiên bản tiện ích (lấy động từ `manifest.version`).
  - `lang`: Ngôn ngữ hiển thị (ưu tiên thiết lập `lang` trong popup, fallback theo ngôn ngữ trình duyệt).
  - `days`: Số ngày đã cài đặt (tính từ `installedAt`).
  - `ref`: Nguồn điều hướng (`ext_uninstall`).
- Lắng nghe sự kiện `chrome.storage.onChanged`: Tự động làm mới Uninstall URL khi người dùng thay đổi ngôn ngữ trong Popup.
- Xử lý an toàn: Kiểm tra giới hạn 1023 ký tự và cô lập `try...catch` độc lập.

#### Mã nguồn đã tích hợp vào `background.js`:
```javascript
const UNINSTALL_BASE_URL = 'https://khanhnkq.github.io/DocCleaner/uninstall.html';

async function setupUninstallURL() {
    try {
        const data = await chrome.storage.local.get(['installedAt', 'lang']);
        const manifest = chrome.runtime.getManifest();
        const currentVersion = manifest.version || '1.4';

        let userLang = data.lang;
        if (!userLang) {
            userLang = (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('vi')) ? 'vi' : 'en';
        }

        let daysUsed = 0;
        if (data.installedAt && typeof data.installedAt === 'number') {
            const diffMs = Date.now() - data.installedAt;
            daysUsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        }

        const params = new URLSearchParams({
            v: currentVersion,
            lang: userLang,
            days: daysUsed.toString(),
            ref: 'ext_uninstall'
        });

        const fullUninstallUrl = `${UNINSTALL_BASE_URL}?${params.toString()}`;

        if (fullUninstallUrl.length <= 1023) {
            await chrome.runtime.setUninstallURL(fullUninstallUrl);
        } else {
            console.warn('[DocCleaner] Uninstall URL exceeds 1023 limit, fallback to base URL.');
            await chrome.runtime.setUninstallURL(UNINSTALL_BASE_URL);
        }
    } catch (err) {
        console.error('[DocCleaner] Error in setupUninstallURL:', err);
    }
}

chrome.runtime.onInstalled.addListener(async (details) => {
    try {
        const { installedAt } = await chrome.storage.local.get('installedAt');
        if (!installedAt) {
            await chrome.storage.local.set({ installedAt: Date.now() });
        }
        await setupUninstallURL();
    } catch (e) {
        console.error('[DocCleaner] onInstalled setup error:', e);
    }
});

chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.lang) {
        setupUninstallURL();
    }
});

setupUninstallURL();
```

---

### 🔹 Giai đoạn 2: Xây dựng Trang Offboarding (`uninstall.html`)

Xây dựng trang đích chuyên biệt lưu trữ trực tiếp trên GitHub Pages tại đường dẫn:  
`https://khanhnkq.github.io/DocCleaner/uninstall.html`

#### 1. Quy chuẩn Thiết kế Nghiêm ngặt (Strict Pure Flat Rules):
- 🚫 **KHÔNG SHADOW:** `box-shadow: none !important;` (triệt tiêu toàn bộ bóng đổ).
- 🚫 **KHÔNG BORDER:** `border: none !important;` (triệt tiêu toàn bộ viền nét).
- 🚫 **KHÔNG GRADIENT:** `background-image: none !important;` (chỉ sử dụng mảng màu đơn sắc Solid Flat).
- 🚫 **KHÔNG EMOJI:** Tuyệt đối không dùng bất kỳ biểu tượng cảm xúc (emoji) nào trong toàn bộ văn bản và giao diện. Sử dụng typography rõ ràng và nhãn văn bản thuần túy.
- 🚫 **KHÔNG THÊM MÀU SẮC:** Chỉ dùng duy nhất 5 mã màu chuẩn từ `color_palette_fix_plan.md`:
  - Canvas toàn trang: Kem sáng `#f6f7ef`
  - Bề mặt Card/Box: Trắng `#ffffff`
  - Nút chính & Điểm nhấn: Xanh Acid Lime `#c6eb34` (Hover: `#d4f73e`)
  - Chữ tiêu đề & Icon nét: Xanh Navy đậm `#091b42`
  - Chữ nội dung & Phụ đề: Xanh Navy xám `#5e6d8a`
  - Nền phụ / CTA phụ: Xanh Navy `#193582` (chữ trắng `#ffffff`)
- 🚫 **KHÔNG HIỆU ỨNG:** `filter: none !important; backdrop-filter: none !important;` (không blur, không hiệu ứng phát sáng neon glow, không animation rung lắc/bounce).

#### 2. Cấu trúc nội dung trang (Thuần Typography & Khối Phẳng):
1. **Header & Thông điệp chia tay:**
   - Logo DocCleaner + Nhãn phiên bản dạng text thuần (ví dụ: `DocCleaner v1.4`).
   - Nút chuyển ngôn ngữ tối giản dạng văn bản: `[Tiếng Việt]` / `[English]`.
   - Thông điệp chính:
     - VI: *"Cảm ơn bạn đã sử dụng DocCleaner. Chúng tôi rất tiếc khi bạn gỡ tiện ích."*
     - EN: *"Thank you for using DocCleaner. We are sorry to see you go."*
   - Dòng cam kết quyền riêng tư (text thuần): *"Dữ liệu cục bộ của bạn đã được trình duyệt xóa sạch hoàn toàn."*

2. **Khảo sát 1-Chạm (Dạng thẻ phẳng, không emoji):**
   - [ ] *Lỗi hiển thị hoặc không định dạng được trang in trên Studocu / Scribd*
   - [ ] *Trang web tài liệu vừa cập nhật giao diện mới*
   - [ ] *Giao diện khó hiểu hoặc không rõ cách kích hoạt tính năng*
   - [ ] *Chỉ cần sử dụng một lần duy nhất cho tài liệu này*
   - [ ] *Đã tìm thấy công cụ hoặc phương pháp khác thay thế*
   - [ ] *Lý do khác (kèm ô nhập văn bản tự do)*

3. **Cơ chế gửi dữ liệu ẩn danh (Zero-Server Backend):**
   - Headless POST gửi dữ liệu thẳng về Google Form / Google Sheets hoàn toàn ẩn danh và miễn phí.
   - Trạng thái phản hồi chuyển đổi text phẳng: *"Cảm ơn bạn đã gửi ý kiến đóng góp."*

4. **Khu vực Hỗ trợ & Cài đặt lại (Win-back Hub):**
   - Nút chính: **Cài đặt lại DocCleaner** (Nền `#c6eb34`, chữ `#091b42`, không viền, không bóng, dẫn tới Chrome Web Store).
   - Nút phụ: **Báo lỗi tài liệu trên GitHub** (Nền `#193582`, chữ `#ffffff`, không viền, không bóng).
   - Link text thuần: **Ủng hộ qua Buy Me A Coffee**.

---

### 🔹 Giai đoạn 3: Tối ưu Build, SEO & Privacy Policy

1. **Cập nhật `package-extension.sh`:**
   - Bổ sung quy tắc loại trừ `uninstall.html` (và file CSS/JS tương ứng) trong lệnh đóng gói ZIP:
     ```bash
     -x "uninstall.html" \
     -x "uninstall.css" \
     -x "uninstall.js" \
     ```
   - Tránh làm tăng dung lượng file `.zip` nộp lên Chrome Web Store.
2. **Cập nhật `robots.txt` & Thẻ Meta:**
   - Đặt thẻ `<meta name="robots" content="noindex, nofollow">` trong `uninstall.html`.
   - Thêm quy tắc vào `robots.txt`:
     ```txt
     Disallow: /uninstall.html
     ```
   - Ngăn các công cụ tìm kiếm index trang khảo sát gỡ tiện ích.
3. **Cập nhật `PRIVACY_POLICY.md`:**
   - Ghi chú minh bạch: Khi gỡ cài đặt, trang web chỉ tiếp nhận phản hồi đóng góp hoàn toàn tự nguyện, không lưu trữ địa chỉ IP hay thông tin danh tính.

---

### 🔹 Giai đoạn 4: Kế hoạch Kiểm Thử (Verification Steps)

| STT | Bước kiểm thử | Kết quả kỳ vọng |
|---|---|---|
| **TC-01** | Cài đặt mới từ thư mục unpacked (`chrome://extensions`) | `chrome.storage.local` lưu đúng `installedAt`. Service worker đăng ký `setUninstallURL` không phát sinh lỗi console. |
| **TC-02** | Xóa tiện ích bằng nút **Remove from Chrome** | Trình duyệt lập tức mở một tab mới dẫn tới `uninstall.html` với đầy đủ params `v`, `lang`, `days`. |
| **TC-03** | Kiểm tra hiển thị ngôn ngữ tự động | Nếu trình duyệt tiếng Việt hoặc param `lang=vi`, nội dung hiển thị tiếng Việt; nếu `lang=en`, hiển thị tiếng Anh. |
| **TC-04** | Gửi form khảo sát | Phản hồi được gửi thành công, hiển thị thông báo cảm ơn và trạng thái thành công. |
| **TC-05** | Bấm nút Re-install | Mở đúng trang Chrome Web Store của DocCleaner. |
| **TC-06** | Chạy lệnh `./package-extension.sh` | File ZIP đầu ra sạch sẽ, không chứa file `uninstall.html`. |

---

## 4. 📊 Bảng Theo Dõi Tiến Độ Thực Hiện

- [x] **Task 1:** Viết hàm `setupUninstallURL` và ghi nhận `installedAt` trong `background.js` (✅ Đã hoàn thành).
- [x] **Task 2:** Tạo giao diện trang `uninstall.html` chuẩn Pure Flat, mặc định tiếng Anh, đồng bộ nút EN/VN với trang chủ (✅ Đã hoàn thành).
- [x] **Task 3:** Cấu hình endpoint tiếp nhận khảo sát qua Google Apps Script Webhook 2 bước tự động (✅ Đã hoàn thành).
- [x] **Task 4:** Cập nhật `package-extension.sh`, `robots.txt` và `PRIVACY_POLICY.md` (✅ Đã hoàn thành).
- [x] **Task 5:** Kiểm thử thực tế 2 bước (init & update) và đóng gói bản phát hành v1.5 (✅ Đã hoàn thành).
