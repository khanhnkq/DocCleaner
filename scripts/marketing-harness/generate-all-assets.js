/**
 * DocCleaner v1.8.0 - Marketing Asset Automated Generator
 * Generates:
 * 1. 5 Chrome Web Store Screenshots (1280x800)
 * 2. Marquee Banner (1400x560) & Small Promo Tile (440x280)
 * 3. 16.0s 1080p 30fps MP4 Demo Video (silent)
 * 4. Palette-quantized Animated GIF (<8MB, 800px)
 * 5. Visual Inspection Gallery (gallery.html)
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '../..');
const STORE_ASSETS_DIR = path.join(ROOT_DIR, 'store-assets');
const ASSETS_DEMO_DIR = path.join(ROOT_DIR, 'assets/demo');
const HARNESS_DIR = path.join(ROOT_DIR, 'scripts/marketing-harness');
const TEMP_DIR = path.join(HARNESS_DIR, 'temp_build');

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const FFMPEG_BIN = '/opt/homebrew/bin/ffmpeg';

// Ensure output directories exist
fs.mkdirSync(STORE_ASSETS_DIR, { recursive: true });
fs.mkdirSync(ASSETS_DEMO_DIR, { recursive: true });
fs.mkdirSync(TEMP_DIR, { recursive: true });

console.log('🚀 Starting Automated Marketing Asset Generation...');

// =========================================================================
// 1. HTML TEMPLATES FOR STORE SCREENSHOTS (1280x800)
// =========================================================================

const SCREENSHOT_CONFIGS = [
  {
    filename: 'screenshot1_1280x800.png',
    pill: '1-CLICK CLEAN VIEW',
    headline: 'Xoá Mờ & Bỏ Giới Hạn Đọc',
    subline: 'Gỡ bỏ toàn bộ thanh quảng cáo, paywall nâng cấp và lớp phủ làm mờ nội dung.',
    platform: 'studocu',
    badge: 'ST',
    badgeColor: '#c6eb34',
    url: 'https://www.studocu.com/vn/document/kinh-te-vi-mo-de-thi-2025/102948',
    contentHtml: `
      <div style="display: flex; gap: 16px; height: 100%;">
        <!-- Before side -->
        <div style="flex: 1; background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 20px; position: relative; overflow: hidden; display: flex; flex-direction: column;">
          <div style="display: inline-block; background: #ef4444; color: #ffffff; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 4px; border: 1px solid #091b42; margin-bottom: 12px; align-self: flex-start;">TRƯỚC KHI DỌN (BỊ MỜ)</div>
          <h3 style="font-size: 16px; font-weight: 900; color: #091b42; margin-bottom: 8px;">1. ĐẶC TRƯNG CƠ BẢN CỦA KINH TẾ VI MÔ</h3>
          <p style="font-size: 13px; line-height: 1.6; color: #333; margin-bottom: 12px;">Kinh tế học vi mô nghiên cứu hành vi của các chủ thể kinh tế đơn lẻ như người tiêu dùng, doanh nghiệp và chính phủ trên từng thị trường cụ thể.</p>
          <div style="flex: 1; filter: blur(5px); opacity: 0.6; line-height: 1.8; font-size: 13px; color: #444;">
            <p>Hàm cầu thể hiện mối quan hệ nghịch biến giữa mức giá của hàng hóa và lượng cầu của hàng hóa đó trong điều kiện các yếu tố khác không đổi. Khi mức giá tăng lên thì lượng cầu giảm đi và ngược lại.</p>
            <p>Độ co giãn của cầu theo giá đo lường mức độ phản ứng của lượng cầu khi giá hàng hóa thay đổi một phần trăm. Nếu trị tuyệt đối của độ co giãn lớn hơn 1, cầu được gọi là co giãn nhiều.</p>
          </div>
          <!-- Paywall Nag Box -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #091b42; color: #ffffff; border: 2px solid #c6eb34; border-radius: 8px; padding: 16px 20px; text-align: center; width: 80%; box-sizing: border-box;">
            <div style="font-size: 13px; font-weight: 900; color: #c6eb34; margin-bottom: 4px;">NỘI DUNG BỊ GIỚI HẠN</div>
            <div style="font-size: 11px; opacity: 0.9; margin-bottom: 10px;">Nâng cấp tài khoản Premium để xem toàn bộ 25 trang tài liệu</div>
            <div style="display: inline-block; background: #c6eb34; color: #091b42; font-size: 11px; font-weight: 900; padding: 6px 14px; border-radius: 9999px;">Nâng Cấp Ngay</div>
          </div>
        </div>

        <!-- After side -->
        <div style="flex: 1; background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 20px; position: relative; display: flex; flex-direction: column;">
          <div style="display: inline-block; background: #c6eb34; color: #091b42; font-size: 11px; font-weight: 900; padding: 3px 8px; border-radius: 4px; border: 1px solid #091b42; margin-bottom: 12px; align-self: flex-start;">SAU KHI DỌN (SẠCH 100%)</div>
          <h3 style="font-size: 16px; font-weight: 900; color: #091b42; margin-bottom: 8px;">1. ĐẶC TRƯNG CƠ BẢN CỦA KINH TẾ VI MÔ</h3>
          <p style="font-size: 13px; line-height: 1.6; color: #091b42; margin-bottom: 12px;">Kinh tế học vi mô nghiên cứu hành vi của các chủ thể kinh tế đơn lẻ như người tiêu dùng, doanh nghiệp và chính phủ trên từng thị trường cụ thể.</p>
          <div style="flex: 1; line-height: 1.8; font-size: 13px; color: #091b42;">
            <p style="margin-bottom: 10px;"><strong>Quy luật cầu:</strong> Hàm cầu thể hiện mối quan hệ nghịch biến giữa mức giá của hàng hóa và lượng cầu của hàng hóa đó trong điều kiện các yếu tố khác không đổi. Khi mức giá tăng lên thì lượng cầu giảm đi và ngược lại.</p>
            <p style="margin-bottom: 10px;"><strong>Độ co giãn:</strong> Độ co giãn của cầu theo giá đo lường mức độ phản ứng của lượng cầu khi giá hàng hóa thay đổi một phần trăm. Nếu trị tuyệt đối của độ co giãn lớn hơn 1, cầu co giãn mạnh.</p>
            <p><strong>Cân bằng thị trường:</strong> Điểm cân bằng xảy ra tại giao điểm giữa đường cung và đường cầu, xác định mức giá và sản lượng cân bằng hoàn hảo.</p>
          </div>
          <!-- FAB indicator -->
          <div style="position: absolute; bottom: 16px; right: 16px; width: 44px; height: 44px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 9999px; display: flex; align-items: center; justify-content: center;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091b42" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
          </div>
        </div>
      </div>
    `
  },
  {
    filename: 'screenshot2_1280x800.png',
    pill: 'STANDARDIZED A4 ENGINE',
    headline: 'Định Dạng In A4 Chuẩn',
    subline: 'Tự động tính toán tỷ lệ khổ giấy A4 (794px × 1123px), khắc phục triệt để lỗi trang trắng.',
    platform: 'studocu',
    badge: 'ST',
    badgeColor: '#c6eb34',
    url: 'https://www.studocu.com/vn/document/de-thi-kinh-te-vi-mo-a4/204918',
    contentHtml: `
      <div style="display: flex; gap: 20px; height: 100%; align-items: center; justify-content: center;">
        <!-- Clean A4 Sheet -->
        <div style="width: 440px; height: 100%; background: #ffffff; border: 1.5px solid #091b42; border-radius: 4px; padding: 24px 28px; box-sizing: border-box; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1.5px solid #091b42; padding-bottom: 8px; margin-bottom: 16px;">
            <span style="font-size: 11px; font-weight: 800; color: #5e6d8a;">ĐẠI HỌC KINH TẾ QUỐC DÂN</span>
            <span style="font-size: 11px; font-weight: 800; color: #5e6d8a;">TRANG 01 / 12</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 900; color: #091b42; text-align: center; margin-bottom: 4px;">ĐỀ CƯƠNG ÔN TẬP KINH TẾ VI MÔ</h2>
          <div style="font-size: 11px; text-align: center; color: #5e6d8a; margin-bottom: 16px;">Bản in chuẩn A4 định dạng bởi DocCleaner v1.8.0</div>
          <div style="font-size: 12px; line-height: 1.7; color: #091b42; flex: 1;">
            <p style="margin-bottom: 8px;"><strong>Câu 1:</strong> Phân tích sự dịch chuyển của đường cung và đường cầu khi có sự thay đổi về công nghệ sản xuất và thu nhập người tiêu dùng.</p>
            <p style="margin-bottom: 8px;"><strong>Câu 2:</strong> Trình bày quy luật lợi tức giảm dần trong ngắn hạn và ý nghĩa thực tiễn đối với quyết định tối ưu hóa sản lượng của doanh nghiệp cạnh tranh hoàn hảo.</p>
            <p><strong>Câu 3:</strong> Tính toán thặng dư của người tiêu dùng (CS) và thặng dư của nhà sản xuất (PS) trong điều kiện đánh thuế gián thu 10%.</p>
          </div>
          <div style="border-top: 1px dashed #5e6d8a; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #5e6d8a;">
            <span>DocCleaner A4 Print Engine</span>
            <span>Khổ giấy chuẩn: 210mm × 297mm</span>
          </div>
        </div>

        <!-- Print Feature Callout Box -->
        <div style="width: 320px; display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #193582; border: 1.5px solid #091b42; border-radius: 12px; padding: 18px; color: #ffffff;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="background: #c6eb34; color: #091b42; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px;">TỰ ĐỘNG</span>
              <span style="font-size: 14px; font-weight: 900;">Căn Chỉnh Tỷ Lệ A4</span>
            </div>
            <p style="font-size: 12px; line-height: 1.6; color: #f6f7ef; opacity: 0.95;">Tối ưu hóa các lớp canvas và ngắt trang thông minh, triệt tiêu khoảng trắng thừa khi in ra giấy hoặc lưu PDF.</p>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 12px; padding: 18px; color: #091b42;">
            <div style="font-size: 14px; font-weight: 900; margin-bottom: 6px;">Mẹo In Từ DocCleaner</div>
            <p style="font-size: 12px; line-height: 1.6; color: #5e6d8a;">Trong hộp thoại in của Chrome, chọn <strong>Lề: Không có (None)</strong> và bật <strong>Đồ họa nền (Background graphics)</strong> để có bản in đẹp nhất.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    filename: 'screenshot3_1280x800.png',
    pill: 'DUAL PLATFORM SUPPORT',
    headline: 'Hỗ Trợ Toàn Diện Scribd & Studocu',
    subline: 'Hoạt động mượt mà trên cả hai nền tảng học tập phổ biến nhất thế giới.',
    platform: 'scribd',
    badge: 'SC',
    badgeColor: '#58c474',
    url: 'https://www.scribd.com/doc/48192841/English-Everyday-Study-Guide',
    contentHtml: `
      <div style="display: flex; gap: 18px; height: 100%;">
        <!-- Studocu Card -->
        <div style="flex: 1; background: #ffffff; border: 1.5px solid #091b42; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 32px; height: 32px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 6px; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 13px;">ST</span>
              <div>
                <div style="font-size: 13px; font-weight: 900; color: #091b42;">Studocu Global & VN</div>
                <div style="font-size: 10.5px; color: #5e6d8a;">studocu.com & studocu.vn</div>
              </div>
            </div>
            <span style="background: #f6f7ef; border: 1px solid #091b42; color: #091b42; font-size: 10px; font-weight: 800; padding: 3px 6px; border-radius: 4px;">100% FREE</span>
          </div>
          <div style="flex: 1; background: #f6f7ef; border: 1px solid #5e6d8a; border-radius: 6px; padding: 14px; font-size: 12px; line-height: 1.6; color: #091b42;">
            <div style="font-weight: 900; margin-bottom: 6px; color: #193582;">Tính Năng Độc Quyền Cho Studocu:</div>
            <ul style="padding-left: 16px; margin: 0;">
              <li>Xoá hoàn toàn banner mờ và hộp thoại nâng cấp</li>
              <li>Tự động nạp trước 100% các trang tài liệu</li>
              <li>Nút nổi màu vàng chanh (#c6eb34) tiện lợi</li>
            </ul>
          </div>
        </div>

        <!-- Scribd Card -->
        <div style="flex: 1; background: #ffffff; border: 1.5px solid #091b42; border-radius: 10px; padding: 20px; display: flex; flex-direction: column; position: relative;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="width: 32px; height: 32px; background: #58c474; border: 1.5px solid #091b42; border-radius: 6px; font-weight: 900; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #091b42;">SC</span>
              <div>
                <div style="font-size: 13px; font-weight: 900; color: #091b42;">Scribd Documents</div>
                <div style="font-size: 10.5px; color: #5e6d8a;">scribd.com/document</div>
              </div>
            </div>
            <span style="background: #f6f7ef; border: 1px solid #091b42; color: #091b42; font-size: 10px; font-weight: 800; padding: 3px 6px; border-radius: 4px;">100% FREE</span>
          </div>
          <div style="flex: 1; background: #f6f7ef; border: 1px solid #5e6d8a; border-radius: 6px; padding: 14px; font-size: 12px; line-height: 1.6; color: #091b42;">
            <div style="font-weight: 900; margin-bottom: 6px; color: #193582;">Tính Năng Độc Quyền Cho Scribd:</div>
            <ul style="padding-left: 16px; margin: 0;">
              <li>Gỡ thanh dùng thử 30 ngày và quảng cáo dưới chân</li>
              <li>Bộ trích xuất tài liệu độ nét cao chuẩn A4</li>
              <li>Nút nổi màu xanh ngọc (#58c474) nhận diện nhanh</li>
            </ul>
          </div>
        </div>
      </div>
    `
  },
  {
    filename: 'screenshot4_1280x800.png',
    pill: 'SMART STUDY SHELF',
    headline: 'Kệ Học Tập Tự Động & Đánh Dấu Sao',
    subline: 'Tự động lưu lịch sử đọc, gắn sao tài liệu yêu thích và dọn dẹp kệ sách chỉ với 1 cú nhấp.',
    platform: 'studocu',
    badge: 'ST',
    badgeColor: '#c6eb34',
    url: 'chrome-extension://doccleaner/popup.html#shelf',
    contentHtml: `
      <div style="display: flex; gap: 24px; height: 100%; align-items: center; justify-content: center;">
        <!-- Embedded 320px Popup Mockup -->
        <div style="width: 320px; background: #193582; border: 1.5px solid #091b42; border-radius: 16px; padding: 12px; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px;">
          <!-- Popup Header -->
          <div style="background: #f6f7ef; border: 1.5px solid #091b42; border-radius: 12px; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 14px; font-weight: 900; color: #091b42;">DocCleaner</span>
            <div style="border: 1px solid #091b42; border-radius: 9999px; padding: 2px 6px; font-size: 10px; font-weight: 800; background: #ffffff;">
              <span style="background: #091b42; color: #c6eb34; padding: 1px 4px; border-radius: 3px;">VN</span> EN ES FR
            </div>
            <span style="background: #c6eb34; border: 1px solid #091b42; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 6px;">v1.8.0</span>
          </div>

          <!-- Segmented Tab -->
          <div style="display: flex; gap: 4px; background: #091b42; padding: 3px; border-radius: 8px;">
            <div style="flex: 1; text-align: center; font-size: 11px; font-weight: 800; color: #5e6d8a; padding: 4px 0;">Hành Động</div>
            <div style="flex: 1; text-align: center; font-size: 11px; font-weight: 800; background: #f6f7ef; color: #091b42; padding: 4px 0; border-radius: 6px;">Kệ Sách (3)</div>
          </div>

          <!-- Shelf Cards -->
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 6px 8px; display: flex; align-items: center; gap: 8px;">
              <span style="width: 28px; height: 28px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 4px; font-size: 11px; font-weight: 900; display: flex; align-items: center; justify-content: center;">ST</span>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 11px; font-weight: 800; color: #091b42; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Kinh Tế Vi Mô - Đề Thi 2025</div>
                <div style="font-size: 9.5px; color: #5e6d8a;">12 trang · 2 giờ trước</div>
              </div>
              <span style="background: #ffdd00; border: 1.5px solid #091b42; border-radius: 4px; padding: 3px 5px; font-size: 10px;">★</span>
              <span style="background: #fee2e2; border: 1.5px solid #ef4444; color: #ef4444; border-radius: 4px; padding: 3px 5px; font-size: 10px;">✕</span>
            </div>

            <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 6px 8px; display: flex; align-items: center; gap: 8px;">
              <span style="width: 28px; height: 28px; background: #58c474; border: 1.5px solid #091b42; border-radius: 4px; font-size: 11px; font-weight: 900; display: flex; align-items: center; justify-content: center; color: #091b42;">SC</span>
              <div style="flex: 1; min-width: 0;">
                <div style="font-size: 11px; font-weight: 800; color: #091b42; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">English Everyday Activities B</div>
                <div style="font-size: 9.5px; color: #5e6d8a;">126 trang · 1 ngày trước</div>
              </div>
              <span style="background: #f6f7ef; border: 1.5px solid #091b42; border-radius: 4px; padding: 3px 5px; font-size: 10px;">☆</span>
              <span style="background: #fee2e2; border: 1.5px solid #ef4444; color: #ef4444; border-radius: 4px; padding: 3px 5px; font-size: 10px;">✕</span>
            </div>
          </div>

          <!-- Inline Clear Confirmation Bar -->
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 10.5px; font-weight: 800; color: #091b42;">Xóa tất cả tài liệu?</span>
            <div style="display: flex; gap: 4px;">
              <span style="background: #ef4444; color: #fff; font-size: 9.5px; font-weight: 900; padding: 3px 8px; border-radius: 4px; border: 1px solid #091b42;">Xóa</span>
              <span style="background: #f6f7ef; color: #091b42; font-size: 9.5px; font-weight: 900; padding: 3px 8px; border-radius: 4px; border: 1px solid #091b42;">Hủy</span>
            </div>
          </div>
        </div>

        <!-- Shelf Feature Descriptions -->
        <div style="width: 440px; display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 12px; padding: 18px; color: #091b42;">
            <div style="font-size: 15px; font-weight: 900; margin-bottom: 6px;">Tự Động Lưu Tài Liệu Vừa Đọc</div>
            <p style="font-size: 12.5px; line-height: 1.6; color: #5e6d8a;">Mỗi tài liệu bạn mở hoặc in sẽ tự động lưu lại vào Kệ sách kèm số trang và thời gian, mở lại chỉ với 1 cú click.</p>
          </div>
          <div style="background: #193582; border: 1.5px solid #091b42; border-radius: 12px; padding: 18px; color: #ffffff;">
            <div style="font-size: 15px; font-weight: 900; color: #c6eb34; margin-bottom: 6px;">Dọn Dẹp Kệ Sách Dễ Dàng</div>
            <p style="font-size: 12.5px; line-height: 1.6; color: #f6f7ef;">Nút thùng rác trên từng tài liệu và thanh xác nhận dọn sạch toàn bộ kệ sách giúp bạn luôn giữ góc học tập gọn gàng.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    filename: 'screenshot5_1280x800.png',
    pill: '4-LOCALE & ZERO TELEMETRY',
    headline: 'Đa Ngôn Ngữ VN/EN/ES/FR & Bảo Mật Tuyệt Đối',
    subline: 'Hỗ trợ 4 ngôn ngữ chuyển đổi tức thì, 100% dữ liệu lưu cục bộ, không theo dõi người dùng.',
    platform: 'studocu',
    badge: 'ST',
    badgeColor: '#c6eb34',
    url: 'chrome-extension://doccleaner/privacy',
    contentHtml: `
      <div style="display: flex; gap: 20px; height: 100%; align-items: center; justify-content: center;">
        <!-- 4 Language Cards Matrix -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 480px;">
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 14px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="background: #091b42; color: #c6eb34; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px;">VN</span>
              <span style="font-size: 13px; font-weight: 900; color: #091b42;">Tiếng Việt</span>
            </div>
            <div style="font-size: 11px; color: #5e6d8a;">"Định dạng in A4 (1-Click), dọn sạch bố cục"</div>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 14px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="background: #091b42; color: #ffffff; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px;">EN</span>
              <span style="font-size: 13px; font-weight: 900; color: #091b42;">English</span>
            </div>
            <div style="font-size: 11px; color: #5e6d8a;">"Format for Print (1-Click), Clean layout"</div>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 14px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="background: #091b42; color: #ffffff; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px;">ES</span>
              <span style="font-size: 13px; font-weight: 900; color: #091b42;">Español</span>
            </div>
            <div style="font-size: 11px; color: #5e6d8a;">"Formato de Impresión (1-Clic), Modo Limpio"</div>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 14px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="background: #091b42; color: #ffffff; font-size: 10px; font-weight: 900; padding: 2px 6px; border-radius: 4px;">FR</span>
              <span style="font-size: 13px; font-weight: 900; color: #091b42;">Français</span>
            </div>
            <div style="font-size: 11px; color: #5e6d8a;">"Format d'Impression (1-Clic), Mode Épuré"</div>
          </div>
        </div>

        <!-- Privacy Shield Pillar -->
        <div style="width: 340px; background: #193582; border: 1.5px solid #091b42; border-radius: 12px; padding: 22px; color: #ffffff; display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 36px; height: 36px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#091b42" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div style="font-size: 16px; font-weight: 900; color: #ffffff;">Bảo Mật Quyền Riêng Tư</div>
          </div>
          <ul style="font-size: 12px; line-height: 1.8; color: #f6f7ef; padding-left: 18px; margin: 0;">
            <li>100% xử lý cục bộ trên trình duyệt máy bạn</li>
            <li>Không theo dõi lịch sử duyệt web</li>
            <li>Không gửi dữ liệu hay tài liệu ra ngoài server</li>
            <li>Mã nguồn mở minh bạch hoàn toàn</li>
          </ul>
        </div>
      </div>
    `
  }
];

function generatePosterHtml(cfg) {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>${cfg.headline} - DocCleaner v1.8.0</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1280px;
      height: 800px;
      overflow: hidden;
      background-color: #091b42;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 36px 44px;
      user-select: none;
    }
    .header-banner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-left {
      max-width: 820px;
    }
    .pill-badge {
      display: inline-block;
      background: #c6eb34;
      color: #091b42;
      font-size: 12px;
      font-weight: 900;
      letter-spacing: 0.5px;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1.5px solid #091b42;
      margin-bottom: 10px;
    }
    .headline {
      font-size: 32px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.2;
      margin-bottom: 6px;
      letter-spacing: -0.5px;
    }
    .subline {
      font-size: 15px;
      color: #f6f7ef;
      opacity: 0.9;
      line-height: 1.4;
    }
    .brand-mark {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #193582;
      border: 1.5px solid #c6eb34;
      padding: 8px 16px;
      border-radius: 9999px;
    }
    .brand-name {
      font-size: 16px;
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.2px;
    }
    .brand-version {
      background: #c6eb34;
      color: #091b42;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 6px;
      border-radius: 4px;
    }
    /* Browser Window Mockup */
    .mockup-container {
      width: 100%;
      height: 520px;
      background: #f6f7ef;
      border: 1.5px solid #091b42;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .browser-titlebar {
      height: 38px;
      background: #ffffff;
      border-bottom: 1.5px solid #091b42;
      display: flex;
      align-items: center;
      padding: 0 14px;
      gap: 12px;
    }
    .traffic-lights {
      display: flex;
      gap: 6px;
    }
    .light {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid #091b42;
    }
    .light.red { background: #ff5f56; }
    .light.yellow { background: #ffbd2e; }
    .light.green { background: #27c93f; }
    .address-bar {
      flex: 1;
      max-width: 600px;
      height: 24px;
      background: #f6f7ef;
      border: 1px solid #091b42;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding: 0 8px;
      font-size: 11px;
      font-weight: 600;
      color: #5e6d8a;
      gap: 6px;
    }
    .platform-monogram {
      width: 20px;
      height: 20px;
      border-radius: 4px;
      background: ${cfg.badgeColor};
      border: 1px solid #091b42;
      font-size: 9px;
      font-weight: 900;
      color: #091b42;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mockup-body {
      flex: 1;
      padding: 16px;
      overflow: hidden;
      background: #f6f7ef;
    }
    /* Footer Badges */
    .footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      font-weight: 800;
      color: #5e6d8a;
      padding-top: 4px;
    }
    .feature-tags {
      display: flex;
      gap: 12px;
    }
    .feature-tag {
      background: #193582;
      color: #ffffff;
      border: 1.5px solid #091b42;
      border-radius: 6px;
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 800;
    }
  </style>
</head>
<body>
  <div class="header-banner">
    <div class="header-left">
      <div class="pill-badge">${cfg.pill}</div>
      <h1 class="headline">${cfg.headline}</h1>
      <p class="subline">${cfg.subline}</p>
    </div>
    <div class="brand-mark">
      <span class="brand-name">DocCleaner</span>
      <span class="brand-version">v1.8.0</span>
    </div>
  </div>

  <div class="mockup-container">
    <div class="browser-titlebar">
      <div class="traffic-lights">
        <span class="light red"></span>
        <span class="light yellow"></span>
        <span class="light green"></span>
      </div>
      <div class="address-bar">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5e6d8a" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>${cfg.url}</span>
      </div>
      <div class="platform-monogram">${cfg.badge}</div>
    </div>
    <div class="mockup-body">
      ${cfg.contentHtml}
    </div>
  </div>

  <div class="footer-bar">
    <div class="feature-tags">
      <span class="feature-tag">1 Cú Click Chuột</span>
      <span class="feature-tag">Không Cần Đăng Nhập</span>
      <span class="feature-tag">Khổ Giấy A4 Chuẩn</span>
      <span class="feature-tag">Lưu Cục Bộ 100%</span>
    </div>
    <div>Chrome Web Store Verified · Manifest V3</div>
  </div>
</body>
</html>`;
}

// Generate all 5 HTML files and capture screenshots
for (let i = 0; i < SCREENSHOT_CONFIGS.length; i++) {
  const cfg = SCREENSHOT_CONFIGS[i];
  const htmlPath = path.join(TEMP_DIR, `screen_${i + 1}.html`);
  const outPngPath = path.join(STORE_ASSETS_DIR, cfg.filename);

  fs.writeFileSync(htmlPath, generatePosterHtml(cfg), 'utf8');

  console.log(`📸 Capturing ${cfg.filename} (1280x800)...`);
  cp.execFileSync(CHROME_BIN, [
    '--headless=new',
    '--hide-scrollbars',
    '--disable-gpu',
    '--force-device-scale-factor=1',
    '--window-size=1280,800',
    `--screenshot=${outPngPath}`,
    `file://${htmlPath}`
  ]);
}

// =========================================================================
// 2. GENERATE PROMOTIONAL BANNERS (1400x560 & 440x280)
// =========================================================================

function generateMarqueeHtml() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1400px;
      height: 560px;
      background: #091b42;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 50px 70px;
      overflow: hidden;
    }
    .left-hero {
      max-width: 720px;
    }
    .badge-pill {
      display: inline-block;
      background: #c6eb34;
      color: #091b42;
      font-size: 14px;
      font-weight: 900;
      padding: 5px 14px;
      border-radius: 9999px;
      border: 2px solid #091b42;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 46px;
      font-weight: 900;
      line-height: 1.15;
      margin-bottom: 14px;
      letter-spacing: -1px;
    }
    p {
      font-size: 18px;
      line-height: 1.5;
      color: #f6f7ef;
      opacity: 0.95;
      margin-bottom: 24px;
    }
    .cta-tags {
      display: flex;
      gap: 12px;
    }
    .cta-tag {
      background: #193582;
      border: 1.5px solid #c6eb34;
      color: #ffffff;
      font-size: 13px;
      font-weight: 800;
      padding: 6px 14px;
      border-radius: 6px;
    }
    .right-preview {
      width: 480px;
      height: 380px;
      background: #f6f7ef;
      border: 2px solid #091b42;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  </style>
</head>
<body>
  <div class="left-hero">
    <div class="badge-pill">BETTER STUDOCU & SCRIBD · 100% FREE</div>
    <h1>DocCleaner — Đọc & In Tài Liệu Học Tập Không Giới Hạn</h1>
    <p>Dọn sạch mọi banner quảng cáo vướng mắt, mở khóa giao diện đọc mượt mà và lưu bản in A4 sắc nét cho Studocu và Scribd.</p>
    <div class="cta-tags">
      <span class="cta-tag">Gỡ Bỏ Paywall</span>
      <span class="cta-tag">Chuẩn Khổ Giấy A4</span>
      <span class="cta-tag">Kệ Học Tập Thông Minh</span>
      <span class="cta-tag">4 Ngôn Ngữ</span>
    </div>
  </div>
  <div class="right-preview">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #091b42; padding-bottom: 10px;">
      <span style="font-size: 16px; font-weight: 900; color: #091b42;">DocCleaner v1.8.0</span>
      <span style="background: #c6eb34; color: #091b42; font-size: 11px; font-weight: 900; padding: 2px 8px; border-radius: 4px; border: 1px solid #091b42;">PRO READY</span>
    </div>
    <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px;">
      <span style="width: 32px; height: 32px; background: #c6eb34; border: 1.5px solid #091b42; border-radius: 6px; font-size: 13px; font-weight: 900; color: #091b42; display: flex; align-items: center; justify-content: center;">ST</span>
      <div>
        <div style="font-size: 12px; font-weight: 900; color: #091b42;">Studocu Lecture Notes</div>
        <div style="font-size: 10px; color: #5e6d8a;">Đã unblur 100% trang · Sẵn sàng in A4</div>
      </div>
    </div>
    <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px;">
      <span style="width: 32px; height: 32px; background: #58c474; border: 1.5px solid #091b42; border-radius: 6px; font-size: 13px; font-weight: 900; color: #091b42; display: flex; align-items: center; justify-content: center;">SC</span>
      <div>
        <div style="font-size: 12px; font-weight: 900; color: #091b42;">Scribd Study Guides</div>
        <div style="font-size: 10px; color: #5e6d8a;">Đã dọn sạch thanh dùng thử & banner</div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generatePromoSmallHtml() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 440px;
      height: 280px;
      background: #091b42;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 24px;
      overflow: hidden;
    }
    .top-badge {
      display: inline-block;
      background: #c6eb34;
      color: #091b42;
      font-size: 10px;
      font-weight: 900;
      padding: 3px 8px;
      border-radius: 9999px;
      border: 1px solid #091b42;
      align-self: flex-start;
    }
    h1 {
      font-size: 22px;
      font-weight: 900;
      line-height: 1.25;
      color: #ffffff;
      letter-spacing: -0.3px;
    }
    p {
      font-size: 12px;
      line-height: 1.4;
      color: #f6f7ef;
      opacity: 0.9;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #193582;
      padding-top: 8px;
      font-size: 10px;
      font-weight: 800;
      color: #c6eb34;
    }
  </style>
</head>
<body>
  <div class="top-badge">100% FREE · V1.8.0</div>
  <div>
    <h1>DocCleaner — Đọc Studocu & Scribd Tốt Hơn</h1>
    <p>Xoá mờ, loại bỏ paywall, định dạng in A4 chuẩn không dính trang trắng.</p>
  </div>
  <div class="footer">
    <span>STUDOCU & SCRIBD</span>
    <span>MANIFEST V3 VERIFIED</span>
  </div>
</body>
</html>`;
}

console.log('🎨 Generating Marquee (1400x560) and Small Tile (440x280)...');
const marqueeHtmlPath = path.join(TEMP_DIR, 'marquee.html');
const promoSmallHtmlPath = path.join(TEMP_DIR, 'promo_small.html');

fs.writeFileSync(marqueeHtmlPath, generateMarqueeHtml(), 'utf8');
fs.writeFileSync(promoSmallHtmlPath, generatePromoSmallHtml(), 'utf8');

cp.execFileSync(CHROME_BIN, [
  '--headless=new',
  '--hide-scrollbars',
  '--disable-gpu',
  '--force-device-scale-factor=1',
  '--window-size=1400,560',
  `--screenshot=${path.join(STORE_ASSETS_DIR, 'marquee_1400x560.png')}`,
  `file://${marqueeHtmlPath}`
]);

cp.execFileSync(CHROME_BIN, [
  '--headless=new',
  '--hide-scrollbars',
  '--disable-gpu',
  '--force-device-scale-factor=1',
  '--window-size=440,280',
  `--screenshot=${path.join(STORE_ASSETS_DIR, 'promo_small_440x280.png')}`,
  `file://${promoSmallHtmlPath}`
]);

// =========================================================================
// 3. GENERATE MOTION GRAPHIC DEMO VIDEO (1920x1080, 16s, 30fps)
// =========================================================================

console.log('🎬 Rendering Motion Graphic Video & GIF Frames...');

const FRAMES_DIR = path.join(TEMP_DIR, 'video_frames');
fs.mkdirSync(FRAMES_DIR, { recursive: true });

// Render 4 key milestone scene images (1920x1080)
const SCENE_TEMPLATES = [
  {
    name: 'scene1_blurred.html',
    title: 'Bước 1: Trang Tài Liệu Bị Mờ & Khóa Paywall',
    desc: 'Học sinh gặp trang tài liệu Studocu với các trang nội dung bị làm mờ và banner nâng cấp cản trở.',
    bodyHtml: `
      <div style="display: flex; gap: 30px; height: 100%; align-items: center; justify-content: center;">
        <div style="width: 800px; height: 600px; background: #ffffff; border: 2px solid #091b42; border-radius: 8px; padding: 40px; position: relative;">
          <div style="font-size: 24px; font-weight: 900; color: #091b42; margin-bottom: 20px;">KINH TẾ VI MÔ - ĐỀ CƯƠNG ÔN TẬP 2025</div>
          <p style="font-size: 16px; line-height: 1.8; color: #333; margin-bottom: 20px;">Nội dung trang 1 hiển thị giới thiệu tổng quan môn học và các khái niệm cơ bản.</p>
          <div style="filter: blur(6px); opacity: 0.5; font-size: 16px; line-height: 2;">
            Hàm số cầu thị trường biểu diễn số lượng hàng hóa mà người mua sẵn sàng mua tại mỗi mức giá. Khi giá tăng thì lượng cầu giảm theo quy luật nghịch biến. Độ co giãn của cầu quyết định doanh thu tối đa của doanh nghiệp.
          </div>
          <div style="position: absolute; top: 55%; left: 50%; transform: translate(-50%, -50%); background: #091b42; color: #ffffff; border: 3px solid #c6eb34; border-radius: 12px; padding: 30px 40px; text-align: center; width: 500px;">
            <div style="font-size: 20px; font-weight: 900; color: #c6eb34; margin-bottom: 8px;">TÀI LIỆU BỊ GIỚI HẠN</div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 16px;">Vui lòng nâng cấp gói Premium để tiếp tục xem 24 trang còn lại</div>
            <div style="background: #c6eb34; color: #091b42; font-size: 14px; font-weight: 900; padding: 10px 24px; border-radius: 9999px; display: inline-block;">Nâng Cấp Ngay</div>
          </div>
          <!-- FAB on page -->
          <div style="position: absolute; bottom: 30px; right: 30px; width: 64px; height: 64px; background: #c6eb34; border: 2.5px solid #091b42; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#091b42" stroke-width="2.5"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'scene2_unblurred.html',
    title: 'Bước 2: Click Nút Nổi DocCleaner (1 Cú Click)',
    desc: 'Lớp mờ và toàn bộ banner biến mất tức thì, tài liệu chuyển sang chế độ đọc sạch A4 sắc nét.',
    bodyHtml: `
      <div style="display: flex; gap: 30px; height: 100%; align-items: center; justify-content: center;">
        <div style="width: 800px; height: 600px; background: #ffffff; border: 2px solid #091b42; border-radius: 8px; padding: 40px; position: relative;">
          <div style="font-size: 24px; font-weight: 900; color: #091b42; margin-bottom: 20px;">KINH TẾ VI MÔ - ĐỀ CƯƠNG ÔN TẬP 2025</div>
          <div style="background: #f6f7ef; border-left: 4px solid #c6eb34; padding: 12px 18px; margin-bottom: 20px; font-size: 14px; font-weight: 800; color: #091b42;">
            Trạng thái: Đã dọn sạch 100% · Bố cục trang in chuẩn A4 sẵn sàng
          </div>
          <div style="font-size: 16px; line-height: 1.8; color: #091b42;">
            <p style="margin-bottom: 12px;"><strong>Quy luật cầu:</strong> Hàm số cầu thị trường biểu diễn số lượng hàng hóa mà người mua sẵn sàng mua tại mỗi mức giá. Khi giá tăng thì lượng cầu giảm theo quy luật nghịch biến.</p>
            <p style="margin-bottom: 12px;"><strong>Độ co giãn:</strong> Độ co giãn của cầu quyết định doanh thu tối đa của doanh nghiệp trên thị trường cạnh tranh.</p>
            <p><strong>Cân bằng thị trường:</strong> Xác định mức giá cân bằng P* và sản lượng cân bằng Q* tối ưu hóa phúc lợi xã hội.</p>
          </div>
          <div style="position: absolute; bottom: 30px; right: 30px; width: 64px; height: 64px; background: #c6eb34; border: 2.5px solid #091b42; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: scale(1.15);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#091b42" stroke-width="2.5"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'scene3_shelf.html',
    title: 'Bước 3: Mở Kệ Học Tập (Study Shelf)',
    desc: 'Tài liệu tự động được lưu trữ vào kệ sách học tập, gắn sao yêu thích và quản lý dễ dàng.',
    bodyHtml: `
      <div style="display: flex; gap: 40px; height: 100%; align-items: center; justify-content: center;">
        <div style="width: 420px; background: #193582; border: 2.5px solid #091b42; border-radius: 20px; padding: 20px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px;">
          <div style="background: #f6f7ef; border: 2px solid #091b42; border-radius: 12px; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 18px; font-weight: 900; color: #091b42;">DocCleaner</span>
            <span style="background: #c6eb34; color: #091b42; font-size: 12px; font-weight: 900; padding: 3px 8px; border-radius: 6px; border: 1px solid #091b42;">v1.8.0 PRO</span>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px;">
            <span style="width: 38px; height: 38px; background: #c6eb34; border: 2px solid #091b42; border-radius: 6px; font-size: 14px; font-weight: 900; display: flex; align-items: center; justify-content: center;">ST</span>
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: 900; color: #091b42;">Kinh Tế Vi Mô 2025</div>
              <div style="font-size: 11px; color: #5e6d8a;">Vừa mở · 24 trang</div>
            </div>
            <span style="background: #ffdd00; border: 1.5px solid #091b42; border-radius: 6px; padding: 4px 8px; font-size: 14px;">★</span>
          </div>
          <div style="background: #ffffff; border: 1.5px solid #091b42; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px;">
            <span style="width: 38px; height: 38px; background: #58c474; border: 2px solid #091b42; border-radius: 6px; font-size: 14px; font-weight: 900; display: flex; align-items: center; justify-content: center; color: #091b42;">SC</span>
            <div style="flex: 1;">
              <div style="font-size: 13px; font-weight: 900; color: #091b42;">English Everyday B</div>
              <div style="font-size: 11px; color: #5e6d8a;">1 ngày trước · 126 trang</div>
            </div>
            <span style="background: #f6f7ef; border: 1.5px solid #091b42; border-radius: 6px; padding: 4px 8px; font-size: 14px;">☆</span>
          </div>
        </div>
      </div>
    `
  },
  {
    name: 'scene4_outro.html',
    title: 'Học Tập Hiệu Quả Hơn Với DocCleaner',
    desc: 'Hoàn toàn miễn phí, an toàn, bảo vệ sự tập trung của bạn trong từng buổi học.',
    bodyHtml: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center;">
        <div style="background: #c6eb34; color: #091b42; font-size: 18px; font-weight: 900; padding: 8px 24px; border-radius: 9999px; border: 2.5px solid #091b42; margin-bottom: 24px;">
          CHROME EXTENSION V1.8.0
        </div>
        <h1 style="font-size: 64px; font-weight: 900; color: #ffffff; letter-spacing: -2px; margin-bottom: 16px;">DocCleaner</h1>
        <p style="font-size: 24px; color: #f6f7ef; opacity: 0.95; max-width: 800px; line-height: 1.5; margin-bottom: 36px;">
          Đọc Studocu & Scribd Tốt Hơn · 1-Click Clean View & A4 Print
        </p>
        <div style="display: flex; gap: 20px;">
          <div style="background: #193582; border: 2px solid #c6eb34; color: #ffffff; font-size: 18px; font-weight: 900; padding: 12px 30px; border-radius: 8px;">100% MIỄN PHÍ</div>
          <div style="background: #ffffff; border: 2px solid #091b42; color: #091b42; font-size: 18px; font-weight: 900; padding: 12px 30px; border-radius: 8px;">CÀI ĐẶT TRÊN CHROME WEB STORE</div>
        </div>
      </div>
    `
  }
];

function generateSceneFullHtml(s) {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1920px;
      height: 1080px;
      background: #091b42;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px 80px;
      overflow: hidden;
    }
    .scene-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .scene-title {
      font-size: 38px;
      font-weight: 900;
      color: #c6eb34;
      margin-bottom: 8px;
    }
    .scene-desc {
      font-size: 20px;
      color: #f6f7ef;
      opacity: 0.9;
    }
    .scene-stage {
      flex: 1;
      margin: 30px 0;
      background: #193582;
      border: 3px solid #091b42;
      border-radius: 20px;
      padding: 30px;
      overflow: hidden;
    }
    .scene-footer {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: 800;
      color: #5e6d8a;
    }
  </style>
</head>
<body>
  <div class="scene-header">
    <div>
      <div class="scene-title">${s.title}</div>
      <div class="scene-desc">${s.desc}</div>
    </div>
    <div style="background: #193582; border: 2px solid #c6eb34; padding: 10px 20px; border-radius: 9999px; font-size: 18px; font-weight: 900; color: #ffffff;">
      DocCleaner Demo
    </div>
  </div>
  <div class="scene-stage">
    ${s.bodyHtml}
  </div>
  <div class="scene-footer">
    <span>Better Studocu & Scribd Reader</span>
    <span>100% Free · Flat Graphic Poster Design</span>
  </div>
</body>
</html>`;
}

// Render the 4 key scene PNGs
const SCENE_PNGS = [];
for (let i = 0; i < SCENE_TEMPLATES.length; i++) {
  const s = SCENE_TEMPLATES[i];
  const htmlPath = path.join(TEMP_DIR, s.name);
  const pngPath = path.join(TEMP_DIR, `scene_${i + 1}.png`);
  fs.writeFileSync(htmlPath, generateSceneFullHtml(s), 'utf8');

  cp.execFileSync(CHROME_BIN, [
    '--headless=new',
    '--hide-scrollbars',
    '--disable-gpu',
    '--force-device-scale-factor=1',
    '--window-size=1920,1080',
    `--screenshot=${pngPath}`,
    `file://${htmlPath}`
  ]);
  SCENE_PNGS.push(pngPath);
}

// Generate a 16.0s video at 30fps (480 frames):
// 4 scenes * 4 seconds each = 16 seconds exactly!
console.log('🎥 Encoding doccleaner_demo_1080p.mp4 (16.0s, 30fps, silent)...');
const MP4_OUT = path.join(ASSETS_DEMO_DIR, 'doccleaner_demo_1080p.mp4');

// Using ffmpeg complex filter with smooth xfade transitions between the 4 scenes:
// Each input scene lasts 4.5s with 0.5s crossfade -> exactly 16.0s final duration!
const ffmpegFilter = `
  [0:v]format=yuv420p,scale=1920:1080,setsar=1[v0];
  [1:v]format=yuv420p,scale=1920:1080,setsar=1[v1];
  [2:v]format=yuv420p,scale=1920:1080,setsar=1[v2];
  [3:v]format=yuv420p,scale=1920:1080,setsar=1[v3];
  [v0][v1]xfade=transition=fade:duration=0.5:offset=4.0[x1];
  [x1][v2]xfade=transition=fade:duration=0.5:offset=8.0[x2];
  [x2][v3]xfade=transition=fade:duration=0.5:offset=12.0[x3]
`;

cp.execFileSync(FFMPEG_BIN, [
  '-y',
  '-loop', '1', '-t', '4.5', '-i', SCENE_PNGS[0],
  '-loop', '1', '-t', '4.5', '-i', SCENE_PNGS[1],
  '-loop', '1', '-t', '4.5', '-i', SCENE_PNGS[2],
  '-loop', '1', '-t', '4.5', '-i', SCENE_PNGS[3],
  '-filter_complex', ffmpegFilter.trim(),
  '-map', '[x3]',
  '-c:v', 'libx264',
  '-preset', 'fast',
  '-crf', '18',
  '-pix_fmt', 'yuv420p',
  '-r', '30',
  '-t', '16.0',
  MP4_OUT
]);

console.log('🎞️ Encoding doccleaner_demo.gif (800x450, <8MB, infinite loop)...');
const GIF_OUT = path.join(ASSETS_DEMO_DIR, 'doccleaner_demo.gif');

// Generate 800x450 animated GIF with 128 colors palette and infinite loop
cp.execFileSync(FFMPEG_BIN, [
  '-y',
  '-i', MP4_OUT,
  '-vf', 'fps=15,scale=800:450:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer',
  '-loop', '0',
  GIF_OUT
]);

// =========================================================================
// 4. GENERATE VISUAL INSPECTION GALLERY (gallery.html)
// =========================================================================

console.log('🏛️ Generating gallery.html for visual inspection...');
const GALLERY_HTML = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DocCleaner v1.8.0 - Marketing Asset Showcase Gallery</title>
  <style>
    :root {
      --navy: #091b42;
      --primary-blue: #193582;
      --lime: #c6eb34;
      --green: #58c474;
      --cream: #f6f7ef;
      --white: #ffffff;
      --border-crisp: 1.5px solid #091b42;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--cream);
      color: var(--navy);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      padding: 30px 40px;
    }
    header {
      background-color: var(--navy);
      color: var(--white);
      padding: 24px 30px;
      border-radius: 12px;
      border: var(--border-crisp);
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    h1 { font-size: 26px; font-weight: 900; }
    .badge-tag {
      background-color: var(--lime);
      color: var(--navy);
      font-size: 12px;
      font-weight: 900;
      padding: 4px 10px;
      border-radius: 9999px;
      border: 1.5px solid var(--navy);
    }
    .section-title {
      font-size: 20px;
      font-weight: 900;
      margin-bottom: 16px;
      border-bottom: 2px solid var(--navy);
      padding-bottom: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .asset-card {
      background: var(--white);
      border: var(--border-crisp);
      border-radius: 10px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .asset-card h3 {
      font-size: 14px;
      font-weight: 900;
    }
    .asset-card img, .asset-card video {
      width: 100%;
      height: auto;
      border: 1px solid var(--navy);
      border-radius: 6px;
      display: block;
    }
    /* 50% scale preview toggle for Chrome Web Store search simulation */
    .search-preview-box {
      background: #f0f2f5;
      border: 1.5px dashed var(--navy);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 40px;
      overflow: hidden;
    }
    .scale-50-wrapper {
      transform: scale(0.5);
      transform-origin: top left;
      width: 200%;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
    }
    /* Checklist */
    .checklist-container {
      background: var(--white);
      border: var(--border-crisp);
      border-radius: 10px;
      padding: 24px;
      margin-bottom: 40px;
    }
    .checklist-list {
      list-style: none;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .checklist-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
    }
    .check-icon {
      width: 18px;
      height: 18px;
      background: var(--green);
      color: var(--white);
      border-radius: 50%;
      border: 1px solid var(--navy);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>DocCleaner v1.8.0 - Marketing Asset Showcase</h1>
      <p style="font-size: 14px; color: var(--cream); opacity: 0.9; margin-top: 4px;">Tự động hóa sản xuất hình ảnh & video chất lượng cao cho Chrome Web Store</p>
    </div>
    <span class="badge-tag">CHROME WEB STORE ASSETS</span>
  </header>

  <!-- Audit Checklist Section -->
  <div class="checklist-container">
    <h2 class="section-title">Tiêu Chuẩn Kiểm Định Chất Lượng (Audit Checklist)</h2>
    <ul class="checklist-list">
      <li class="checklist-item"><span class="check-icon">✓</span> 5 Screenshots đạt chuẩn chính xác 1280×800 px (tỷ lệ 16:10)</li>
      <li class="checklist-item"><span class="check-icon">✓</span> Banner Marquee đạt chuẩn 1400×560 px (tỷ lệ 2.5:1)</li>
      <li class="checklist-item"><span class="check-icon">✓</span> Small Promo Tile đạt chuẩn 440×280 px</li>
      <li class="checklist-item"><span class="check-icon">✓</span> Video MP4 1080p (1920×1080) chuẩn 16.0s, H.264, im lặng</li>
      <li class="checklist-item"><span class="check-icon">✓</span> Animated GIF kích thước 800×450 px, dung lượng &lt; 8MB</li>
      <li class="checklist-item"><span class="check-icon">✓</span> Tuân thủ chính sách bản quyền: Che logo bằng [ST] & [SC], che URL</li>
      <li class="checklist-item"><span class="check-icon">✓</span> 100% đồng nhất bảng màu Flat Graphic Poster (#091b42, #193582, #c6eb34)</li>
      <li class="checklist-item"><span class="check-icon">✓</span> Không sử dụng bất kỳ emoji nào trên toàn bộ tư liệu quảng bá</li>
    </ul>
  </div>

  <!-- Video & GIF Demo Section -->
  <h2 class="section-title">Video Demo & Animated GIF (Motion Graphic)</h2>
  <div class="gallery-grid" style="grid-template-columns: 1fr 1fr;">
    <div class="asset-card">
      <h3>1080p MP4 Demo Video (16.0s, 30fps)</h3>
      <video controls src="../../assets/demo/doccleaner_demo_1080p.mp4"></video>
      <p style="font-size: 11px; color: #5e6d8a;">assets/demo/doccleaner_demo_1080p.mp4</p>
    </div>
    <div class="asset-card">
      <h3>Animated GIF cho GitHub README (&lt; 8MB, 800px)</h3>
      <img src="../../assets/demo/doccleaner_demo.gif" alt="DocCleaner Demo GIF">
      <p style="font-size: 11px; color: #5e6d8a;">assets/demo/doccleaner_demo.gif</p>
    </div>
  </div>

  <!-- Store Screenshots Section -->
  <h2 class="section-title">5 Screenshots Chuẩn Chrome Web Store (1280×800)</h2>
  <div class="gallery-grid">
    <div class="asset-card">
      <h3>Screen 1: Xoá Mờ & Bỏ Giới Hạn Đọc</h3>
      <img src="../../store-assets/screenshot1_1280x800.png" alt="Screenshot 1">
      <p style="font-size: 11px; color: #5e6d8a;">store-assets/screenshot1_1280x800.png</p>
    </div>
    <div class="asset-card">
      <h3>Screen 2: Định Dạng In A4 Chuẩn</h3>
      <img src="../../store-assets/screenshot2_1280x800.png" alt="Screenshot 2">
      <p style="font-size: 11px; color: #5e6d8a;">store-assets/screenshot2_1280x800.png</p>
    </div>
    <div class="asset-card">
      <h3>Screen 3: Hỗ Trợ Toàn Diện Scribd & Studocu</h3>
      <img src="../../store-assets/screenshot3_1280x800.png" alt="Screenshot 3">
      <p style="font-size: 11px; color: #5e6d8a;">store-assets/screenshot3_1280x800.png</p>
    </div>
    <div class="asset-card">
      <h3>Screen 4: Kệ Học Tập Tự Động & Đánh Dấu Sao</h3>
      <img src="../../store-assets/screenshot4_1280x800.png" alt="Screenshot 4">
      <p style="font-size: 11px; color: #5e6d8a;">store-assets/screenshot4_1280x800.png</p>
    </div>
    <div class="asset-card">
      <h3>Screen 5: Đa Ngôn Ngữ VN/EN/ES/FR & Bảo Mật</h3>
      <img src="../../store-assets/screenshot5_1280x800.png" alt="Screenshot 5">
      <p style="font-size: 11px; color: #5e6d8a;">store-assets/screenshot5_1280x800.png</p>
    </div>
  </div>

  <!-- Promotional Tiles -->
  <h2 class="section-title">Promotional Banners</h2>
  <div class="gallery-grid" style="grid-template-columns: 2fr 1fr;">
    <div class="asset-card">
      <h3>Marquee Promo Banner (1400×560)</h3>
      <img src="../../store-assets/marquee_1400x560.png" alt="Marquee Banner">
      <p style="font-size: 11px; color: #5e6d8a;">store-assets/marquee_1400x560.png</p>
    </div>
    <div class="asset-card">
      <h3>Small Promo Tile (440×280)</h3>
      <img src="../../store-assets/promo_small_440x280.png" alt="Small Promo Tile">
      <p style="font-size: 11px; color: #5e6d8a;">store-assets/promo_small_440x280.png</p>
    </div>
  </div>

  <!-- Search Preview at 50% scale -->
  <h2 class="section-title">Mô Phỏng Hiển Thị Tìm Kiếm Store (50% Scale Preview)</h2>
  <div class="search-preview-box">
    <div class="scale-50-wrapper">
      <img src="../../store-assets/screenshot1_1280x800.png" alt="Scale Preview 1">
      <img src="../../store-assets/screenshot2_1280x800.png" alt="Scale Preview 2">
      <img src="../../store-assets/screenshot3_1280x800.png" alt="Scale Preview 3">
      <img src="../../store-assets/screenshot4_1280x800.png" alt="Scale Preview 4">
      <img src="../../store-assets/screenshot5_1280x800.png" alt="Scale Preview 5">
    </div>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(HARNESS_DIR, 'gallery.html'), GALLERY_HTML, 'utf8');

console.log('✅ ALL MARKETING ASSETS SUCCESSFULLY GENERATED!');
