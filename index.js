/**
 * DocCleaner Landing Page Script
 * Lightweight i18n Engine, Smooth Scroll & Interactions
 */

const translations = {
  en: {
    pageTitle: "DocCleaner — Better Studocu & Scribd Reader | Free Clean Document Formatter",
    pageDesc: "Free clean reader for Studocu & Scribd. Remove visual clutter, strip ad banners, distraction-free focus mode, and format print-friendly A4 PDFs with 1 click.",
    
    // Nav
    navFeatures: "Features",
    navPreview: "Before & After",
    navHowItWorks: "How It Works",
    navFaq: "FAQ",
    navAddChrome: "Add to Chrome",

    // Hero
    heroBadge: "Better Studocu & Scribd Reader · 100% Free Forever",
    heroTitlePart1: "Distraction-Free Reading for",
    heroTitleHighlight: "Studocu & Scribd",
    heroSubtitle: "Eliminate visual clutter, dismiss intrusive banners, and format crisp print-ready A4 PDFs with a single click. Enjoy reading mode designed specifically for university lecture notes.",
    heroPrimaryCta: "Add to Chrome — It's Free",
    heroSecondaryCta: "See Before & After",
    badgeRating: "Chrome Store",
    badgePrivacy: "100% Client-Side Privacy",
    badgeCompatible: "Chrome, Edge & Brave",

    // Preview
    previewPill: "Visual Comparison",
    previewTitle: "The Difference Is Crystal Clear",
    previewSub: "Experience pure focus. Read lectures without distracting popups and cluttered screen elements.",
    compChallengeTitle: "Without DocCleaner",
    compChallenge1: "Intrusive floating banners block your reading view.",
    compChallenge2: "Frequent upgrade popups disrupt exam preparation.",
    compChallenge3: "Printing leaves blank pages due to virtual scrolling.",
    compChallenge4: "Text blurred by excessive promotional backdrops.",
    compSolutionTitle: "With DocCleaner (Free)",
    compSolution1: "100% Clean Layout: Clean background instantly at page load.",
    compSolution2: "Distraction-Free Mode: Focus purely on document formulas and text.",
    compSolution3: "1-Click A4 Print: Pre-renders all pages cleanly into sharp PDF.",
    compSolution4: "Safe & Private: Zero data tracking, 100% local client execution.",

    // Features Bento
    featPill: "Core Capabilities",
    featTitle: "Designed for Serious Studying",
    featSub: "Every feature is crafted to help university students study faster and format cleaner notes.",
    bento1Label: "FOCUS MODE",
    bento1Title: "Distraction-Free Reading Canvas",
    bento1Desc: "Automatically strips away banner wrappers, modal backdrops, and cookie consent overlays at document start before the webpage even finishes rendering.",
    bento2Label: "A4 PRINT READY",
    bento2Title: "Zero-Blank-Page Preloader",
    bento2Desc: "Bypasses virtual scrolling limitations by preloading 100% of document pages into memory before triggering the native print dialog.",
    bento3Label: "100% PRIVACY",
    bento3Title: "No Cloud, Zero Tracking",
    bento3Desc: "Runs entirely offline within your browser sandbox. Never connects to external analytics servers or collects user data.",
    bento4Label: "MULTI-PLATFORM",
    bento4Title: "Studocu & Scribd Ready",
    bento4Desc: "Tailored DOM cleaning rules automatically applied for studocu.com, studocu.vn, and scribd.com.",

    // How It Works
    howPill: "Simple Workflow",
    howTitle: "3 Steps to Clean Study Notes",
    howSub: "No account required, no configurations needed. It works automatically.",
    step1Title: "Install Extension",
    step1Desc: "Click 'Add to Chrome' on the Web Store. Takes less than 5 seconds to install with no signup.",
    step2Title: "Open Study Document",
    step2Desc: "Navigate to any lecture or study document on Studocu or Scribd. DocCleaner cleans the view instantly.",
    step3Title: "Click 'Format for Print'",
    step3Desc: "Click the floating button at bottom-right. Wait moments for preloading, then choose 'Save as PDF'.",

    // FAQ
    faqPill: "Frequently Asked Questions",
    faqTitle: "Everything You Need to Know",
    faqSub: "Common questions answered about DocCleaner and print formatting.",
    faq1Q: "Is DocCleaner really 100% free to use?",
    faq1A: "Yes, absolutely! DocCleaner is 100% free and open-source. There are no paid tiers, no subscription plans, and no hidden features locked behind paywalls.",
    faq2Q: "Which web browsers are supported?",
    faq2A: "DocCleaner works on all Chromium-based desktop browsers, including Google Chrome, Microsoft Edge, Brave, Opera, and Cốc Cốc on Windows, macOS, and Linux.",
    faq3Q: "Does DocCleaner collect my personal browsing data?",
    faq3A: "Never. DocCleaner operates strictly client-side within your browser. It does not contain any analytics tracking code, does not monitor your history, and communicates with zero external remote servers.",
    faq4Q: "How do I avoid blank pages when printing to PDF?",
    faq4A: "Use DocCleaner's floating action button rather than pressing Ctrl+P directly. DocCleaner auto-scrolls and preloads every single page asset into memory first, ensuring all images and text spans are 100% rendered before opening the Chrome print dialog.",
    faq5Q: "How can I support ongoing development?",
    faq5A: "You can support the author by leaving a 5-star review on the Chrome Web Store, starring our GitHub repository, or buying a coffee via our Buy Me A Coffee page or VietQR.",

    // Support
    supportPill: "Student Community",
    supportTitle: "Made with Love for Students",
    supportDesc: "DocCleaner is built independently. If this tool saved your semester exams or thesis research, consider buying the developer a coffee!",
    btnBuyCoffee: "Buy Me A Coffee",

    // Final CTA
    finalTitle: "Start Reading Better Today",
    finalSub: "Join thousands of students studying distraction-free on Studocu and Scribd.",
    finalCta: "Add to Chrome — Free Extension",

    // Footer
    footerTagline: "Better Studocu & Scribd Reader · Clean print-ready formatting.",
    footerColProject: "Project",
    footerColLegal: "Legal & Safety"
  },

  vi: {
    pageTitle: "DocCleaner — Đọc Studocu & Scribd Tốt Hơn | Định Dạng In PDF Miễn Phí",
    pageDesc: "Tiện ích đọc sạch cho Studocu & Scribd. Dọn sạch banner vướng mắt, chế độ đọc tập trung không quảng cáo và định dạng trang in PDF A4 sắc nét chỉ với 1 click.",
    
    // Nav
    navFeatures: "Tính Năng",
    navPreview: "Trước & Sau",
    navHowItWorks: "Cách Dùng",
    navFaq: "Hỏi Đáp",
    navAddChrome: "Thêm vào Chrome",

    // Hero
    heroBadge: "Đọc Studocu & Scribd Tốt Hơn · Miễn Phí 100%",
    heroTitlePart1: "Chế Độ Đọc Tập Trung Cho",
    heroTitleHighlight: "Studocu & Scribd",
    heroSubtitle: "Dọn sạch banner vướng mắt, loại bỏ overlay che chữ và định dạng trang in PDF A4 sắc nét chỉ với 1 click. Trải nghiệm đọc tài liệu chuyên nghiệp dành riêng cho sinh viên.",
    heroPrimaryCta: "Thêm vào Chrome — Miễn Phí",
    heroSecondaryCta: "Xem Trước & Sau",
    badgeRating: "Cửa hàng Chrome",
    badgePrivacy: "Riêng tư 100% Cục bộ",
    badgeCompatible: "Chrome, Edge & Brave",

    // Preview
    previewPill: "So Sánh Trực Quan",
    previewTitle: "Khác Biệt Rõ Ràng Ngay Tức Thì",
    previewSub: "Trải nghiệm học tập tập trung tối đa. Đọc bài giảng không bị làm phiền bởi các cửa sổ mời chào nâng cấp VIP.",
    compChallengeTitle: "Khi Chưa Dùng DocCleaner",
    compChallenge1: "Banner quảng cáo và thanh nổi che lấp nội dung bài học.",
    compChallenge2: "Popup nâng cấp VIP nhảy liên tục làm đứt mạch ôn thi.",
    compChallenge3: "Khi in ra PDF bị lỗi trang trắng do cơ chế tải chậm (lazy load).",
    compChallenge4: "Chữ bị mờ và che khuất bởi các lớp phủ quảng cáo nền.",
    compSolutionTitle: "Khi Dùng DocCleaner (Miễn Phí)",
    compSolution1: "100% Bố Cục Sạch: Nền trang được dọn gọn gàng ngay khi mở web.",
    compSolution2: "Tập Trung Học Tập: Đọc rõ công thức, sơ đồ và từng dòng chữ.",
    compSolution3: "1-Click In A4 Chuẩn: Nạp toàn bộ các trang trước khi in sắc nét.",
    compSolution4: "An Toàn & Riêng Tư: Chạy 100% trên máy của bạn, không thu thập dữ liệu.",

    // Features Bento
    featPill: "Tính Năng Cốt Lõi",
    featTitle: "Được Thiết Kế Cho Mùa Thi Cử",
    featSub: "Mọi tính năng đều hướng tới việc giúp bạn đọc tài liệu nhanh hơn và lưu trữ bản in đẹp mắt hơn.",
    bento1Label: "CHẾ ĐỘ TẬP TRUNG",
    bento1Title: "Bố Cục Đọc Sạch Hoàn Toàn",
    bento1Desc: "Tự động dọn dẹp các lớp banner, khung mờ và bảng hỏi cookie ngay từ khi bắt đầu tải trang (document_start).",
    bento2Label: "IN A4 CHUẨN ĐẸP",
    bento2Title: "Bộ Nạp Trang Khắc Phục Trang Trắng",
    bento2Desc: "Khắc phục triệt để lỗi trang trắng khi cuộn ảo bằng cách nạp toàn bộ 100% trang tài liệu vào bộ nhớ trước khi mở hộp thoại in.",
    bento3Label: "100% RIÊNG TƯ",
    bento3Title: "Không Cloud, Không Theo Dõi",
    bento3Desc: "Hoạt động hoàn toàn offline bên trong trình duyệt. Không bao giờ gửi dữ liệu lướt web về máy chủ ngoài.",
    bento4Label: "ĐA NỀN TẢNG",
    bento4Title: "Hỗ Trợ Studocu & Scribd",
    bento4Desc: "Quy tắc làm sạch DOM được tối ưu chuyên biệt cho studocu.com, studocu.vn và scribd.com.",

    // How It Works
    howPill: "Quy Trình Sử Dụng",
    howTitle: "3 Bước Đơn Giản Có Ngay Bản In Đẹp",
    howSub: "Không cần tạo tài khoản, không cần cấu hình phức tạp. Mọi thứ tự động 100%.",
    step1Title: "Cài Đặt Tiện Ích",
    step1Desc: "Bấm 'Thêm vào Chrome' trên Cửa hàng trực tuyến. Cài xong trong 5 giây, hoàn toàn miễn phí.",
    step2Title: "Mở Trang Tài Liệu",
    step2Desc: "Mở bất kỳ tài liệu học tập nào trên Studocu hoặc Scribd. Tiện ích sẽ tự động dọn sạch giao diện.",
    step3Title: "Bấm 'Định Dạng In'",
    step3Desc: "Bấm nút nổi góc dưới bên phải. Chờ vài giây để hệ thống nạp đủ trang rồi chọn 'Lưu dưới dạng PDF'.",

    // FAQ
    faqPill: "Câu Hỏi Thường Gặp",
    faqTitle: "Giải Đáp Thắc Mắc",
    faqSub: "Những câu hỏi phổ biến nhất về cách hoạt động và độ an toàn của DocCleaner.",
    faq1Q: "DocCleaner có thực sự miễn phí 100% không?",
    faq1A: "Hoàn toàn miễn phí! DocCleaner là dự án mã nguồn mở và miễn phí vĩnh viễn. Không có gói nâng cấp trả phí, không thu phí duy trì định kỳ.",
    faq2Q: "Tiện ích này chạy được trên trình duyệt nào?",
    faq2A: "Hoạt động mượt mà trên tất cả trình duyệt nhân Chromium như Google Chrome, Microsoft Edge, Brave, Opera, và Cốc Cốc trên Windows, macOS lẫn Linux.",
    faq3Q: "DocCleaner có lưu thông tin cá nhân của tôi không?",
    faq3A: "Tuyệt đối không. DocCleaner chạy hoàn toàn offline trên máy tính của bạn. Tiện ích không có mã theo dõi và không kết nối đến bất kỳ máy chủ bên ngoài nào.",
    faq4Q: "Làm sao để in PDF không bị mất trang hay dính trang trắng?",
    faq4A: "Hãy dùng nút nổi 'Định dạng in' của DocCleaner thay vì bấm Ctrl+P thông thường. Hệ thống sẽ tự động cuộn nạp trước 100% ảnh và chữ vào bộ nhớ rồi mới gọi hộp thoại in.",
    faq5Q: "Tôi có thể ủng hộ tác giả bằng cách nào?",
    faq5A: "Bạn có thể đánh giá 5 sao trên Cửa hàng Chrome, tặng sao trên GitHub hoặc mời tác giả một ly cà phê qua MoMo/VietQR hoặc Buy Me A Coffee.",

    // Support
    supportPill: "Cộng Đồng Sinh Viên",
    supportTitle: "Xây Dựng Bằng Cả Tâm Huyết",
    supportDesc: "DocCleaner được phát triển độc lập. Nếu tiện ích này giúp bạn qua môn thi hoặc hoàn thành đồ án tốt nghiệp, hãy mời tác giả một ly cà phê nhé!",
    btnBuyCoffee: "Mời Tác Giả Ly Cà Phê",

    // Final CTA
    finalTitle: "Bắt Đầu Đọc Tài Liệu Tốt Hơn Ngay Hôm Nay",
    finalSub: "Tham gia cùng hàng nghìn sinh viên đang học tập tập trung trên Studocu và Scribd.",
    finalCta: "Thêm vào Chrome — Tiện Ích Miễn Phí",

    // Footer
    footerTagline: "Đọc Studocu & Scribd Tốt Hơn · Định dạng in PDF A4 sắc nét.",
    footerColProject: "Dự Án",
    footerColLegal: "Pháp Lý & An Toàn"
  }
};

let currentLang = 'en';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Language from localStorage or browser language
  const savedLang = localStorage.getItem('doccleaner_landing_lang');
  if (savedLang && (savedLang === 'en' || savedLang === 'vi')) {
    currentLang = savedLang;
  } else {
    const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    currentLang = browserLang.startsWith('vi') ? 'vi' : 'en';
  }

  applyLanguage(currentLang);

  // 2. Setup Language Toggle Event Listener
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const targetLang = currentLang === 'en' ? 'vi' : 'en';
      applyLanguage(targetLang);
      localStorage.setItem('doccleaner_landing_lang', targetLang);
    });
  }

  // 3. Navbar scroll elevation
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.background = 'rgba(7, 18, 43, 0.95)';
      navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
    } else {
      navbar.style.background = 'rgba(7, 18, 43, 0.82)';
      navbar.style.boxShadow = 'none';
    }
  }, { passive: true });
});

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  const dict = translations[lang] || translations.en;

  // Update Page Title & Description for SEO
  if (dict.pageTitle) document.title = dict.pageTitle;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc && dict.pageDesc) metaDesc.setAttribute('content', dict.pageDesc);

  // Update all [data-i18n] elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Update Language Toggle Badge Display
  const activeLabel = document.getElementById('langActive');
  const inactiveLabel = document.getElementById('langInactive');
  if (activeLabel && inactiveLabel) {
    if (lang === 'en') {
      activeLabel.textContent = 'EN';
      inactiveLabel.textContent = 'VN';
    } else {
      activeLabel.textContent = 'VN';
      inactiveLabel.textContent = 'EN';
    }
  }
}
