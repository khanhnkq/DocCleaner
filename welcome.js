// ==========================================================================
// DocCleaner Welcome & Day-0 Onboarding Script (Auto-Carousel & SVG Motion)
// ==========================================================================

(function initWelcome() {
  'use strict';

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
      btnFinish: "Got It! Start Using",
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
      btnFinish: "Đã hiểu! Bắt đầu dùng",
      footerTag: "100% Miễn phí & Riêng tư",
      footerHome: "Trang chủ chính thức"
    },
    es: {
      step1Nav: "Abrir Documento",
      step2Nav: "Hacer Clic",
      step3Nav: "Imprimir PDF A4",
      step1Tag: "Paso 1 de 3",
      step1Title: "Abre cualquier documento de Studocu o Scribd",
      step1Desc: "Navega a cualquier página de documento en Studocu o Scribd. DocCleaner se activa automáticamente en segundo plano sin necesidad de iniciar sesión.",
      step1Tip: "Busca el botón flotante \"Formato para Imprimir\" en la esquina inferior derecha de la página.",
      step2Tag: "Paso 2 de 3",
      step2Title: "Haz clic para iniciar el Modo Lectura Limpia",
      step2Desc: "Al hacer clic se eliminan anuncios y superposiciones, organizando el documento en hojas A4 centradas y sin distracciones.",
      step2Tip: "La barra superior permanece fija durante la lectura. Presiona Esc o haz clic en \"Salir\" para cerrarla.",
      step3Tag: "Paso 3 de 3",
      step3Title: "Guarda o imprime un PDF A4 limpio",
      step3Desc: "Haz clic en \"Imprimir / Guardar PDF (A4)\" en la barra superior. El diálogo de impresión se abrirá con páginas centradas y escaladas.",
      step3Tip: "En el diálogo de Chrome, establece los Márgenes en \"Ninguno\" y marca \"Gráficos de fondo\" para la mejor calidad.",
      tipLabel: "Consejo",
      btnSkip: "Omitir Tour",
      btnPrev: "← Atrás",
      btnNext: "Siguiente →",
      btnFinish: "¡Entendido! Empezar a Usar",
      footerTag: "100% Gratis y Privado",
      footerHome: "Sitio Web Oficial"
    },
    fr: {
      step1Nav: "Ouvrir Document",
      step2Nav: "Cliquer le Bouton",
      step3Nav: "Imprimer PDF A4",
      step1Tag: "Étape 1 sur 3",
      step1Title: "Ouvrez un document Studocu ou Scribd",
      step1Desc: "Naviguez vers n'importe quelle page sur Studocu ou Scribd. DocCleaner s'active automatiquement en arrière-plan sans connexion requise.",
      step1Tip: "Repérez le bouton flottant \"Formater pour Imprimer\" en bas à droite de la page.",
      step2Tag: "Étape 2 sur 3",
      step2Title: "Cliquez pour lancer la Lecture Épurée",
      step2Desc: "En cliquant sur le bouton, supprimez les bannières et visualisez le document sous forme de pages A4 centrées et nettes.",
      step2Tip: "La barre supérieure reste affichée pendant la lecture. Appuyez sur Échap ou cliquez sur \"Quitter\" à tout moment.",
      step3Tag: "Étape 3 sur 3",
      step3Title: "Enregistrez ou imprimez un PDF A4 propre",
      step3Desc: "Cliquez sur \"Imprimer / Enregistrer PDF (A4)\" dans la barre supérieure. La boîte de dialogue s'ouvre avec les pages centrées.",
      step3Tip: "Dans Chrome, réglez Marges sur \"Aucune\" et cochez \"Graphiques d'arrière-plan\" pour une qualité optimale.",
      tipLabel: "Astuce",
      btnSkip: "Passer le Tour",
      btnPrev: "← Retour",
      btnNext: "Suivant →",
      btnFinish: "Compris ! Commencer",
      footerTag: "100% Gratuit & Privé",
      footerHome: "Site Officiel"
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

  function normalizeLang(lang) {
    if (!lang) return 'en';
    const clean = String(lang).toLowerCase().trim().replace(/_/g, '-');
    if (clean === 'vn' || clean.startsWith('vn-')) return 'vi';
    if (['en', 'vi', 'es', 'fr'].includes(clean)) return clean;
    const primary = clean.split('-')[0];
    if (['en', 'vi', 'es', 'fr'].includes(primary)) return primary;
    return 'en';
  }

  function applyLanguage(lang) {
    currentLang = normalizeLang(lang);
    const dict = translations[currentLang] || translations.en;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerText = dict[key];
      }
    });

    // Update language pills in header
    document.querySelectorAll('#langToggle .lang-opt').forEach((opt) => {
      const optLang = opt.getAttribute('data-lang');
      if (normalizeLang(optLang) === currentLang) {
        opt.classList.add('active');
        opt.style.color = '#091b42';
        opt.style.fontWeight = '900';
      } else {
        opt.classList.remove('active');
        opt.style.color = '#5e6d8a';
        opt.style.fontWeight = '700';
      }
    });

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
        } else if (navigator.language) {
          preferredLang = navigator.language;
        }
      } catch (e) {
        if (navigator.language) {
          preferredLang = navigator.language;
        }
      }
    } else if (typeof navigator !== 'undefined' && navigator.language) {
      preferredLang = navigator.language;
    }

    applyLanguage(preferredLang);
  }

  function finishOnboarding() {
    stopAutoplay();
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

  // Language switcher options listener
  document.querySelectorAll('#langToggle .lang-opt').forEach((opt) => {
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetLang = opt.getAttribute('data-lang');
      if (targetLang) {
        applyLanguage(targetLang);
      }
    });
  });

  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const order = ['vi', 'en', 'es', 'fr'];
      const nextIdx = (order.indexOf(currentLang) + 1) % order.length;
      applyLanguage(order[nextIdx]);
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
  if (typeof window !== 'undefined') {
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
  }

  // Initialize
  detectInitialLanguage();
  startAutoplay();
})();
