// ==========================================================================
// DocCleaner Welcome & Day-0 Onboarding Script (Auto-Carousel & SVG Motion)
// ==========================================================================

(function initWelcome() {
  let currentStep = 0;
  const totalSteps = 3;
  let currentLang = 'en';

  // Autoplay Configuration
  const SLIDE_DURATION = 5500; // 5.5 seconds per slide
  let elapsedTime = 0;
  let isPaused = false;
  let autoPlayTimer = null;

  const translations = {
    en: {
      step1Nav: "Open Document",
      step2Nav: "Click Button",
      step3Nav: "Print A4 PDF",
      step1Tag: "Step 1 of 3",
      step1Title: "Open any Studocu or Scribd Document",
      step1Desc: "Navigate to any document page on Studocu or Scribd. DocCleaner activates automatically in the background without requiring any account login.",
      step1Tip: "Look for the navy & lime \"Format for Print\" button fixed at the bottom-right corner of the page.",
      step2Tag: "Step 2 of 3",
      step2Title: "Click the Button to Launch Clean Reader",
      step2Desc: "Clicking the floating button strips clutter, eliminates promotional overlays, and assembles the document into centered, distraction-free A4 sheets.",
      step2Tip: "The top Reader Bar stays on screen while reading. Press Esc or click \"Exit Clean View\" whenever you want to close it.",
      step3Tag: "Step 3 of 3",
      step3Title: "Save or Print Clean A4 PDF",
      step3Desc: "Click \"Print / Save PDF (A4)\" in the top bar. Chrome's print dialog will open with pages already centered and mathematically scaled to A4 standard dimensions.",
      step3Tip: "In the Chrome print dialog, set Margins to \"None\" and ensure \"Background graphics\" is enabled for the best output quality.",
      tipLabel: "Tip",
      btnSkip: "Skip Tour",
      btnPrev: "← Back",
      btnNext: "Next →",
      btnFinish: "✓ Got It! Start Using",
      footerTag: "100% Free & Private",
      footerHome: "Official Website"
    },
    vi: {
      step1Nav: "Mở tài liệu",
      step2Nav: "Bấm nút nổi",
      step3Nav: "In PDF A4",
      step1Tag: "Bước 1 / 3",
      step1Title: "Mở bất kỳ tài liệu Studocu hoặc Scribd",
      step1Desc: "Truy cập bất kỳ tài liệu nào trên Studocu hoặc Scribd. DocCleaner tự động kích hoạt ngay tức thì trong nền mà không yêu cầu đăng nhập tài khoản.",
      step1Tip: "Chú ý nút nổi \"Định dạng in\" màu xanh navy & viền lime ở góc phải dưới cùng của màn hình.",
      step2Tag: "Bước 2 / 3",
      step2Title: "Bấm nút nổi để bật Reader Mode",
      step2Desc: "Bấm nút nổi để tự động gỡ sạch quảng cáo, banner che khuất và tải trước toàn bộ tài liệu thành các trang A4 căn giữa không giật lag.",
      step2Tip: "Thanh Reader Bar luôn cố định ở đỉnh màn hình để đếm trang. Bạn có thể nhấn phím Esc hoặc bấm \"Thoát\" bất kỳ lúc nào.",
      step3Tag: "Bước 3 / 3",
      step3Title: "In hoặc Lưu file PDF A4 chuẩn đẹp",
      step3Desc: "Bấm \"In / Lưu PDF (A4)\" trên thanh Reader Bar. Hộp thoại in của Chrome sẽ mở ra với các trang đã được căn tỷ lệ toán học A4 chính xác tuyệt đối.",
      step3Tip: "Trong hộp thoại in của Chrome, chọn Margins: \"None\" (Không lề) và tick chọn \"Background graphics\" để bản in rõ nét và không có trang trắng.",
      tipLabel: "Mẹo",
      btnSkip: "Bỏ qua",
      btnPrev: "← Quay lại",
      btnNext: "Tiếp theo →",
      btnFinish: "✓ Đã hiểu! Bắt đầu dùng",
      footerTag: "100% Miễn phí & Riêng tư",
      footerHome: "Trang chủ chính thức"
    }
  };

  // DOM Elements
  const mainCard = document.getElementById('mainCard');
  const carouselTrack = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const skipBtn = document.getElementById('skipBtn');
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const langToggle = document.getElementById('langToggle');
  const langViOpt = document.getElementById('langViOpt');
  const langEnOpt = document.getElementById('langEnOpt');

  function updateStepUI() {
    elapsedTime = 0;

    // Translate track smoothly
    if (carouselTrack) {
      carouselTrack.style.transform = `translateX(-${currentStep * 100}%)`;
    }

    // Update Indicators and Progress bars
    stepIndicators.forEach((el, index) => {
      const progressBar = el.querySelector('.step-progress');
      el.classList.remove('active', 'completed');

      if (index === currentStep) {
        el.classList.add('active');
        if (progressBar) progressBar.style.width = '0%';
      } else if (index < currentStep) {
        el.classList.add('completed');
        if (progressBar) progressBar.style.width = '100%';
      } else {
        if (progressBar) progressBar.style.width = '0%';
      }
    });

    // Update Navigation Buttons
    const dict = translations[currentLang] || translations.en;
    if (prevBtn) {
      prevBtn.style.display = currentStep > 0 ? 'inline-flex' : 'none';
      prevBtn.innerText = dict.btnPrev;
    }

    if (nextBtn) {
      if (currentStep === totalSteps - 1) {
        nextBtn.innerText = dict.btnFinish;
      } else {
        nextBtn.innerText = dict.btnNext;
      }
    }
  }

  // Auto-advance loop with progress bar animation
  function startAutoplay() {
    stopAutoplay();
    const TICK_INTERVAL = 40; // 40ms updates for 25fps smooth bar filling

    autoPlayTimer = setInterval(() => {
      if (isPaused) return;

      elapsedTime += TICK_INTERVAL;
      const progressPercent = Math.min(100, (elapsedTime / SLIDE_DURATION) * 100);

      // Update current step's progress bar
      const activeIndicator = stepIndicators[currentStep];
      if (activeIndicator) {
        const progressBar = activeIndicator.querySelector('.step-progress');
        if (progressBar) {
          progressBar.style.width = `${progressPercent}%`;
        }
      }

      if (elapsedTime >= SLIDE_DURATION) {
        if (currentStep < totalSteps - 1) {
          currentStep++;
        } else {
          currentStep = 0; // Smooth infinite loop
        }
        updateStepUI();
      }
    }, TICK_INTERVAL);
  }

  function stopAutoplay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function applyLanguage(lang) {
    currentLang = lang === 'vi' ? 'vi' : 'en';
    const dict = translations[currentLang];

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerText = dict[key];
      }
    });

    if (langViOpt && langEnOpt) {
      if (currentLang === 'vi') {
        langViOpt.classList.add('active');
        langViOpt.style.color = '#091b42';
        langViOpt.style.fontWeight = '900';
        langEnOpt.classList.remove('active');
        langEnOpt.style.color = '#5e6d8a';
        langEnOpt.style.fontWeight = '700';
      } else {
        langEnOpt.classList.add('active');
        langEnOpt.style.color = '#091b42';
        langEnOpt.style.fontWeight = '900';
        langViOpt.classList.remove('active');
        langViOpt.style.color = '#5e6d8a';
        langViOpt.style.fontWeight = '700';
      }
    }

    // Save language preference to chrome.storage
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ lang: currentLang });
    }

    updateStepUI();
  }

  async function detectInitialLanguage() {
    let preferredLang = 'en';
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      try {
        const stored = await chrome.storage.local.get('lang');
        if (stored.lang) {
          preferredLang = stored.lang;
        } else if (navigator.language && navigator.language.toLowerCase().startsWith('vi')) {
          preferredLang = 'vi';
        }
      } catch (e) {
        if (navigator.language && navigator.language.toLowerCase().startsWith('vi')) {
          preferredLang = 'vi';
        }
      }
    } else if (navigator.language && navigator.language.toLowerCase().startsWith('vi')) {
      preferredLang = 'vi';
    }

    applyLanguage(preferredLang);
  }

  function finishOnboarding() {
    stopAutoplay();
    // If opened via extension, close the tab or redirect
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.getCurrent) {
      chrome.tabs.getCurrent((tab) => {
        if (tab && tab.id) {
          chrome.tabs.remove(tab.id);
        } else {
          window.close();
        }
      });
    } else {
      window.close();
    }
  }

  // Event Listeners: Navigation
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps - 1) {
        currentStep++;
        updateStepUI();
      } else {
        finishOnboarding();
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        updateStepUI();
      }
    });
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => {
      finishOnboarding();
    });
  }

  stepIndicators.forEach((el) => {
    el.addEventListener('click', () => {
      const stepIdx = parseInt(el.getAttribute('data-step'), 10);
      if (!isNaN(stepIdx) && stepIdx >= 0 && stepIdx < totalSteps) {
        currentStep = stepIdx;
        updateStepUI();
      }
    });
  });

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const nextLang = currentLang === 'en' ? 'vi' : 'en';
      applyLanguage(nextLang);
    });
  }

  // Hover Pause & Resume
  if (mainCard) {
    mainCard.addEventListener('mouseenter', () => {
      isPaused = true;
    });
    mainCard.addEventListener('mouseleave', () => {
      isPaused = false;
    });
  }

  // Keyboard accessibility
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && currentStep < totalSteps - 1) {
      currentStep++;
      updateStepUI();
    } else if (e.key === 'ArrowLeft' && currentStep > 0) {
      currentStep--;
      updateStepUI();
    } else if (e.key === 'Escape') {
      finishOnboarding();
    }
  });

  // Initialize
  detectInitialLanguage();
  startAutoplay();
})();
