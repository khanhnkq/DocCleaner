/**
 * DocCleaner - i18n.js
 * Centralized Internationalization Dictionaries & Localization Utilities
 * Supports: English (en), Vietnamese (vi), Spanish (es), French (fr)
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    // CommonJS / Node.js
    module.exports = factory();
  } else {
    // Browser global / Web Worker
    const exports = factory();
    if (typeof window !== 'undefined') {
      window.I18N_DICTIONARY = exports.I18N_DICTIONARY;
      window.normalizeLang = exports.normalizeLang;
      window.t = exports.t;
      window.formatRelativeTime = exports.formatRelativeTime;
      window.sanitizeTitle = exports.sanitizeTitle;
    }
    if (typeof globalThis !== 'undefined') {
      globalThis.I18N_DICTIONARY = exports.I18N_DICTIONARY;
      globalThis.normalizeLang = exports.normalizeLang;
      globalThis.t = exports.t;
      globalThis.formatRelativeTime = exports.formatRelativeTime;
      globalThis.sanitizeTitle = exports.sanitizeTitle;
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  /**
   * Complete 4-language localization dictionary.
   */
  const I18N_DICTIONARY = {
    en: {
      // Phase 2 Core Keys (Spec Section 5.4)
      brandSubtitle: "Better Studocu & Scribd · Free",
      headerSub: "Better Studocu & Scribd · Free",
      tabActions: "Quick Actions",
      tabRecents: "Study Shelf",
      filterAll: "All Docs",
      filterStarred: "Starred",
      emptyRecentsTitle: "Your Study Shelf is empty",
      emptyRecentsDesc: "Documents you format or clean will automatically be saved here.",
      emptyStarredTitle: "No starred documents",
      emptyStarredDesc: "Click the star icon on any document to keep it permanently pinned.",
      btnFormatPrint: "Format for Print (A4)",
      btnCleanView: "Clean Reading Mode",
      btnCleanAndBurn: "Clean & Burn Session",
      burnConfirm: "This will permanently wipe all local history, cached documents, and session cookies. Proceed?",
      burnSuccessToast: "All session traces permanently wiped!",
      toastDocSaved: "Document saved to your Study Shelf!",
      labModeToggle: "Lab / Campus PC Mode",
      labModeActiveBadge: "LAB MODE ACTIVE",
      pages: "pgs",
      justNow: "just now",
      minutesAgo: "m ago",
      hoursAgo: "h ago",
      daysAgo: "d ago",
      exitReader: "Exit Clean View",
      printPdf: "Print / Save PDF (A4)",
      launchCleanReader: "Open in Clean Reader",
      starDocument: "Star document",
      unstarDocument: "Unstar document",
      deleteDoc: "Remove from Shelf",
      clearShelfLabel: "Clear Shelf",
      clearShelfConfirm: "Are you sure you want to clear all documents from your Study Shelf?",
      clearShelfConfirmPrompt: "Clear all documents?",
      clearShelfYes: "Clear",
      clearShelfNo: "Cancel",

      // Action & Status Keys
      currentWebsite: "Current Website",
      detecting: "Detecting...",
      notSupported: "Not supported",
      downloadPdfTitle: "Format for Print (1-Click)",
      downloadPdfDesc: "Clean layout & open print dialog",
      scribdPdfDesc: "Better Scribd — Clean & format for print",
      studocuPdfDesc: "Better Studocu — Clean & format for print",
      unblurTitle: "Clean View & Remove Clutter",
      unblurDesc: "Strip banners & refresh page layout",
      coffeeTitle: "Buy the Author a Coffee",
      coffeeDesc: "Support ongoing development",
      statusReady: "Ready — 100% Free",
      statusStandby: "Standby mode...",
      statusScribdReady: "Better Scribd — Ready to clean & format document",
      statusStudocuReady: "Better Studocu — Ready to clean & format document",
      statusNotSupported: "Please open Studocu or Scribd",
      statusScanning: "Cleaning up the interface...",
      statusCleared: "Cleaned {count} cookies & refreshed layout!",
      statusProcessingScribd: "Processing Scribd document...",
      statusProcessingStudocu: "Processing Studocu document...",
      alertScribdInit: "Initializing Scribd reader, please try again in 1 second!",
      alertStudocuInit: "Initializing Studocu reader, please try again in 1 second!",
      alertOpenDoc: "Please open a document page on Studocu or Scribd to proceed!",
      authorLabel: "Author:"
    },

    vi: {
      // Phase 2 Core Keys (Spec Section 5.4)
      brandSubtitle: "Đọc Studocu & Scribd mượt mà · Miễn phí",
      headerSub: "Better Studocu & Scribd · Miễn Phí",
      tabActions: "Công Cụ",
      tabRecents: "Góc Học Tập",
      filterAll: "Tất cả",
      filterStarred: "Đã lưu",
      emptyRecentsTitle: "Góc học tập đang trống",
      emptyRecentsDesc: "Tài liệu bạn định dạng hoặc đọc sạch sẽ tự động lưu tại đây.",
      emptyStarredTitle: "Chưa có tài liệu được gắn sao",
      emptyStarredDesc: "Bấm vào biểu tượng ngôi sao trên tài liệu để lưu trữ vĩnh viễn.",
      btnFormatPrint: "Định dạng trang in (A4)",
      btnCleanView: "Chế độ đọc tập trung",
      btnCleanAndBurn: "Xóa sạch dấu vết (Lab PC)",
      burnConfirm: "Toàn bộ lịch sử tài liệu, bộ nhớ tạm và cookies phiên sẽ bị xóa vĩnh viễn. Tiếp tục?",
      burnSuccessToast: "Đã xóa sạch toàn bộ dữ liệu phiên học!",
      toastDocSaved: "Đã lưu vào Góc Học Tập của bạn!",
      labModeToggle: "Chế độ máy công cộng",
      labModeActiveBadge: "CHẾ ĐỘ MÁY LAB",
      pages: "trang",
      justNow: "vừa xong",
      minutesAgo: "phút trước",
      hoursAgo: "giờ trước",
      daysAgo: "ngày trước",
      exitReader: "Thoát chế độ đọc",
      printPdf: "In / Lưu PDF (A4)",
      launchCleanReader: "Mở trong chế độ đọc tập trung",
      starDocument: "Gắn sao tài liệu",
      unstarDocument: "Bỏ gắn sao",
      deleteDoc: "Xóa khỏi kệ",
      clearShelfLabel: "Dọn sạch kệ sách",
      clearShelfConfirm: "Bạn có chắc muốn xóa tất cả tài liệu trong kệ học tập?",
      clearShelfConfirmPrompt: "Xóa tất cả tài liệu?",
      clearShelfYes: "Xóa",
      clearShelfNo: "Hủy",

      // Action & Status Keys
      currentWebsite: "Trang Web Hiện Tại",
      detecting: "Đang nhận diện...",
      notSupported: "Không hỗ trợ",
      downloadPdfTitle: "Định Dạng In (1-Click)",
      downloadPdfDesc: "Dọn bố cục & mở hộp thoại in",
      scribdPdfDesc: "Better Scribd — Dọn sạch & in PDF",
      studocuPdfDesc: "Better Studocu — Dọn sạch & in PDF",
      unblurTitle: "Chế Độ Đọc Sạch",
      unblurDesc: "Dọn banner & làm mới bố cục trang",
      coffeeTitle: "Mời Tác Giả Ly Cà Phê",
      coffeeDesc: "Ủng hộ để phát triển thêm tính năng",
      statusReady: "Sẵn sàng — Miễn phí 100%",
      statusStandby: "Chế độ chờ...",
      statusScribdReady: "Better Scribd — Sẵn sàng dọn sạch & in tài liệu",
      statusStudocuReady: "Better Studocu — Sẵn sàng dọn sạch & in tài liệu",
      statusNotSupported: "Vui lòng mở Studocu hoặc Scribd",
      statusScanning: "Đang dọn dẹp giao diện...",
      statusCleared: "Đã dọn sạch {count} cookies & làm mới bố cục!",
      statusProcessingScribd: "Đang xử lý tài liệu Scribd...",
      statusProcessingStudocu: "Đang xử lý tài liệu Studocu...",
      alertScribdInit: "Đang khởi tạo bộ đọc Scribd, vui lòng thử lại sau 1 giây!",
      alertStudocuInit: "Đang khởi tạo bộ đọc Studocu, vui lòng thử lại sau 1 giây!",
      alertOpenDoc: "Vui lòng mở một trang tài liệu trên Studocu hoặc Scribd để sử dụng!",
      authorLabel: "Tác giả:"
    },

    es: {
      // Phase 2 Core Keys (Spec Section 5.4)
      brandSubtitle: "Mejor Studocu y Scribd · Gratis",
      headerSub: "Mejor Studocu y Scribd · Gratis",
      tabActions: "Acciones",
      tabRecents: "Mi Biblioteca",
      filterAll: "Todos",
      filterStarred: "Favoritos",
      emptyRecentsTitle: "Tu biblioteca está vacía",
      emptyRecentsDesc: "Los documentos procesados se guardarán automáticamente aquí.",
      emptyStarredTitle: "Sin documentos favoritos",
      emptyStarredDesc: "Haz clic en la estrella en cualquier documento para fijarlo aquí.",
      btnFormatPrint: "Formato para Imprimir (A4)",
      btnCleanView: "Modo Lectura Limpia",
      btnCleanAndBurn: "Limpiar y Quemar Sesión",
      burnConfirm: "¿Deseas borrar permanentemente el historial de documentos y cookies de sesión?",
      burnSuccessToast: "¡Todos los rastros han sido eliminados!",
      toastDocSaved: "¡Guardado en tu biblioteca de estudio!",
      labModeToggle: "Modo PC público / Biblioteca",
      labModeActiveBadge: "MODO PC PÚBLICO",
      pages: "págs",
      justNow: "ahora mismo",
      minutesAgo: "min antes",
      hoursAgo: "h antes",
      daysAgo: "d antes",
      exitReader: "Salir del modo lectura",
      printPdf: "Imprimir / Guardar PDF",
      launchCleanReader: "Abrir en modo lectura limpia",
      starDocument: "Marcar como favorito",
      unstarDocument: "Quitar de favoritos",
      deleteDoc: "Eliminar de la estantería",
      clearShelfLabel: "Vaciar estantería",
      clearShelfConfirm: "¿Deseas vaciar todos los documentos de tu estantería?",
      clearShelfConfirmPrompt: "¿Vaciar todos los documentos?",
      clearShelfYes: "Vaciar",
      clearShelfNo: "Cancelar",

      // Action & Status Keys
      currentWebsite: "Sitio Web Actual",
      detecting: "Detectando...",
      notSupported: "No compatible",
      downloadPdfTitle: "Formato de Impresión (1-Clic)",
      downloadPdfDesc: "Limpia el diseño y abre la impresión",
      scribdPdfDesc: "Better Scribd — Limpiar y formatear para imprimir",
      studocuPdfDesc: "Better Studocu — Limpiar y formatear para imprimir",
      unblurTitle: "Modo Lectura Limpia",
      unblurDesc: "Elimina anuncios y restaura el diseño",
      coffeeTitle: "Invitar un Café al Autor",
      coffeeDesc: "Apoya el desarrollo continuo",
      statusReady: "Listo — 100% Gratis",
      statusStandby: "Modo de espera...",
      statusScribdReady: "Better Scribd — Listo para limpiar e imprimir",
      statusStudocuReady: "Better Studocu — Listo para limpiar e imprimir",
      statusNotSupported: "Por favor abre Studocu o Scribd",
      statusScanning: "Limpiando la interfaz...",
      statusCleared: "¡Se limpiaron {count} cookies y el diseño se actualizó!",
      statusProcessingScribd: "Procesando documento de Scribd...",
      statusProcessingStudocu: "Procesando documento de Studocu...",
      alertScribdInit: "¡Inicializando lector de Scribd, reintenta en 1 segundo!",
      alertStudocuInit: "¡Inicializando lector de Studocu, reintenta en 1 segundo!",
      alertOpenDoc: "¡Por favor abre una página de documento en Studocu o Scribd para continuar!",
      authorLabel: "Autor:"
    },

    fr: {
      // Phase 2 Core Keys (Spec Section 5.4)
      brandSubtitle: "Meilleur Studocu & Scribd · Gratuit",
      headerSub: "Meilleur Studocu & Scribd · Gratuit",
      tabActions: "Actions",
      tabRecents: "Mes Documents",
      filterAll: "Tous",
      filterStarred: "Favoris",
      emptyRecentsTitle: "Aucun document enregistré",
      emptyRecentsDesc: "Les documents nettoyés apparaîtront automatiquement ici.",
      emptyStarredTitle: "Aucun document favori",
      emptyStarredDesc: "Cliquez sur l'étoile d'un document pour l'épingler ici.",
      btnFormatPrint: "Formater pour Imprimer (A4)",
      btnCleanView: "Mode Lecture Épurée",
      btnCleanAndBurn: "Effacer la Session (PC Public)",
      burnConfirm: "Voulez-vous supprimer définitivement tout l'historique et les cookies de session ?",
      burnSuccessToast: "Toutes les traces ont été effacées !",
      toastDocSaved: "Document enregistré dans vos cours !",
      labModeToggle: "Mode PC public / Bibliothèque",
      labModeActiveBadge: "MODE PC PUBLIC",
      pages: "pages",
      justNow: "à l'instant",
      minutesAgo: "min plus tôt",
      hoursAgo: "h plus tôt",
      daysAgo: "j plus tôt",
      exitReader: "Quitter la lecture",
      printPdf: "Imprimer / Enregistrer PDF",
      launchCleanReader: "Ouvrir en mode lecture épurée",
      starDocument: "Ajouter aux favoris",
      unstarDocument: "Retirer des favoris",
      deleteDoc: "Retirer de la bibliothèque",
      clearShelfLabel: "Vider la bibliothèque",
      clearShelfConfirm: "Voulez-vous supprimer tous les documents de votre bibliothèque ?",
      clearShelfConfirmPrompt: "Tout supprimer ?",
      clearShelfYes: "Supprimer",
      clearShelfNo: "Annuler",

      // Action & Status Keys
      currentWebsite: "Site Web Actuel",
      detecting: "Détection en cours...",
      notSupported: "Non pris en charge",
      downloadPdfTitle: "Format d'Impression (1-Clic)",
      downloadPdfDesc: "Épure la mise en page et ouvre l'impression",
      scribdPdfDesc: "Better Scribd — Nettoyer et formater pour impression",
      studocuPdfDesc: "Better Studocu — Nettoyer et formater pour impression",
      unblurTitle: "Mode Lecture Épurée",
      unblurDesc: "Supprime les bannières et réinitialise la page",
      coffeeTitle: "Offrir un Café à l'Auteur",
      coffeeDesc: "Soutenir le développement",
      statusReady: "Prêt — 100% Gratuit",
      statusStandby: "En attente...",
      statusScribdReady: "Better Scribd — Prêt à nettoyer et imprimer",
      statusStudocuReady: "Better Studocu — Prêt à nettoyer et imprimer",
      statusNotSupported: "Veuillez ouvrir Studocu ou Scribd",
      statusScanning: "Nettoyage de l'interface en cours...",
      statusCleared: "{count} cookies supprimés et mise en page actualisée !",
      statusProcessingScribd: "Traitement du document Scribd...",
      statusProcessingStudocu: "Traitement du document Studocu...",
      alertScribdInit: "Initialisation du lecteur Scribd, réessayez dans 1 seconde !",
      alertStudocuInit: "Initialisation du lecteur Studocu, réessayez dans 1 seconde !",
      alertOpenDoc: "Veuillez ouvrir un document sur Studocu ou Scribd pour continuer !",
      authorLabel: "Auteur :"
    }
  };

  /**
   * Normalizes a given locale or language tag into a supported 2-letter key ('en', 'vi', 'es', 'fr').
   * - Lowercases and trims input
   * - Resolves country/regional aliases (e.g. 'vn' -> 'vi')
   * - Extracts primary language tag (e.g. 'en-US' -> 'en', 'fr-FR' -> 'fr')
   * - Defaults to 'en' if invalid or unsupported
   *
   * @param {string} [lang] - Input language tag or alias
   * @returns {string} - Normalized language code ('en', 'vi', 'es', 'fr')
   */
  function normalizeLang(lang) {
    if (!lang || typeof lang !== 'string') return 'en';
    const clean = lang.toLowerCase().trim().replace(/_/g, '-');
    if (!clean) return 'en';

    if (clean === 'vn' || clean.startsWith('vn-')) {
      return 'vi';
    }

    if (I18N_DICTIONARY && Object.prototype.hasOwnProperty.call(I18N_DICTIONARY, clean)) {
      return clean;
    }

    const primary = clean.split('-')[0];
    if (I18N_DICTIONARY && Object.prototype.hasOwnProperty.call(I18N_DICTIONARY, primary)) {
      return primary;
    }

    return 'en';
  }

  /**
   * Translates a given key with optional token interpolation.
   *
   * @param {string} lang - Language code ('en', 'vi', 'es', 'fr', or aliases like 'vn', 'en-US')
   * @param {string} key - Dictionary key to look up
   * @param {Record<string, any>} [params] - Tokens to interpolate ({count}, {current}, etc.)
   * @returns {string} - Localized translated string
   */
  function t(lang, key, params) {
    if (!key) return '';
    const effectiveLang = normalizeLang(lang);
    const dict = (I18N_DICTIONARY && Object.prototype.hasOwnProperty.call(I18N_DICTIONARY, effectiveLang))
      ? I18N_DICTIONARY[effectiveLang]
      : (I18N_DICTIONARY && I18N_DICTIONARY.en) || {};

    let text;
    if (dict && Object.prototype.hasOwnProperty.call(dict, key) && typeof dict[key] === 'string') {
      text = dict[key];
    } else {
      // Fallback to English dictionary if key not found or not string
      const fallbackDict = (I18N_DICTIONARY && I18N_DICTIONARY.en) || {};
      if (fallbackDict && Object.prototype.hasOwnProperty.call(fallbackDict, key) && typeof fallbackDict[key] === 'string') {
        text = fallbackDict[key];
      } else {
        // Return key itself if not found in any dictionary
        text = String(key || '');
      }
    }

    if (params && typeof params === 'object') {
      text = text.replace(/\{(\w+)\}/g, (match, paramKey) => {
        if (params && Object.prototype.hasOwnProperty.call(params, paramKey)) {
          return String(params[paramKey]);
        }
        return match;
      });
    }

    return text;
  }

  /**
   * Formats a relative timestamp into localized human-readable text.
   * Examples:
   * - en: "just now", "15m ago", "2 h ago", "3 d ago"
   * - vi: "vừa xong", "15 phút trước", "2 giờ trước", "3 ngày trước"
   * - es: "ahora mismo", "15 min antes", "2 h antes", "3 d antes"
   * - fr: "à l'instant", "15 min plus tôt", "2 h plus tôt", "3 j plus tôt"
   *
   * @param {number|Date} timestamp - Epoch milliseconds or Date object
   * @param {string} [lang='en'] - Target language code
   * @returns {string} - Localized relative time string
   */
  function formatRelativeTime(timestamp, lang = 'en') {
    if (!timestamp) return '';
    const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
    if (isNaN(time)) return '';

    const effectiveLang = normalizeLang(lang);
    const dict = (I18N_DICTIONARY && Object.prototype.hasOwnProperty.call(I18N_DICTIONARY, effectiveLang))
      ? I18N_DICTIONARY[effectiveLang]
      : (I18N_DICTIONARY && I18N_DICTIONARY.en) || {};
    const now = Date.now();
    const diff = Math.max(0, now - time);

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
      return dict.justNow || 'just now';
    }
    if (hours < 1) {
      if (effectiveLang === 'vi') return `${minutes} phút trước`;
      if (effectiveLang === 'es') return `${minutes} min antes`;
      if (effectiveLang === 'fr') return `${minutes} min plus tôt`;
      return `${minutes}m ago`;
    }
    if (days < 1) {
      const hoursLabel = dict.hoursAgo || 'h ago';
      return `${hours} ${hoursLabel}`;
    }
    if (days < 30) {
      const daysLabel = dict.daysAgo || 'd ago';
      return `${days} ${daysLabel}`;
    }
    const months = Math.floor(days / 30);
    if (months < 12) {
      if (effectiveLang === 'vi') return `${months} tháng trước`;
      if (effectiveLang === 'es') return `${months} m antes`;
      if (effectiveLang === 'fr') return `${months} mois plus tôt`;
      return `${months} mo ago`;
    }
    const years = Math.floor(days / 365);
    if (effectiveLang === 'vi') return `${years} năm trước`;
    if (effectiveLang === 'es') return `${years} año(s) antes`;
    if (effectiveLang === 'fr') return `${years} an(s) plus tôt`;
    return `${years} y ago`;
  }

  /**
   * Helper to decode HTML entities (numeric, hex, and named entities).
   * Runs up to 2 passes to safely decode nested entity encodings before tag stripping.
   *
   * @param {string} input - Encoded HTML string
   * @returns {string} - Decoded string
   */
  function decodeHtmlEntities(input) {
    if (!input || typeof input !== 'string') return '';
    let str = input;
    for (let i = 0; i < 2; i++) {
      const prev = str;
      str = str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;|&apos;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/&ndash;/g, '–')
        .replace(/&mdash;/g, '—')
        .replace(/&hellip;/g, '…')
        .replace(/&#(\d+);/g, (_, dec) => {
          const code = parseInt(dec, 10);
          return code > 0 && code < 65536 ? String.fromCharCode(code) : '';
        })
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
          const code = parseInt(hex, 16);
          return code > 0 && code < 65536 ? String.fromCharCode(code) : '';
        });
      if (str === prev) break;
    }
    return str;
  }

  /**
   * Sanitizes raw document titles:
   * - Decodes HTML entities first (recursively) to expose encoded HTML tags
   * - Strips HTML tags and embedded scripts/styles (including unclosed tags)
   * - Strips trailing platform branding (- Studocu, | Scribd, etc.)
   * - Normalizes multiple whitespaces
   * - Trims to maximum 120 characters
   *
   * @param {string} rawTitle - Raw extracted title
   * @returns {string} - Clean, sanitized document title
   */
  function sanitizeTitle(rawTitle) {
    if (rawTitle === null || rawTitle === undefined) return '';
    let str = String(rawTitle).trim();
    if (!str) return '';

    // 1. Decode HTML entities FIRST so that entity-encoded tags (e.g. &lt;script&gt;) are exposed
    str = decodeHtmlEntities(str);

    // 2. Remove script and style tags with content
    str = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    str = str.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    str = str.replace(/<script\b[^>]*>[\s\S]*?(?:<\/script>|$)/gi, '');
    str = str.replace(/<style\b[^>]*>[\s\S]*?(?:<\/style>|$)/gi, '');

    // 3. Remove all remaining HTML tags
    while (/<[^>]+>/.test(str)) {
      str = str.replace(/<[^>]+>/g, '');
    }

    // 4. Strip trailing platform branding suffixes (e.g. " - Studocu", " | Scribd", " - Studocu VN")
    str = str.replace(/(?:\s*[-–—|•]\s*(?:Studocu(?:\s+VN)?|Scribd)[^]*)+$/i, '');

    // 5. Normalize multiple whitespace to single space
    str = str.replace(/\s+/g, ' ').trim();

    // 6. Cap length to 120 characters
    if (str.length > 120) {
      str = str.slice(0, 120).trim();
    }

    return str;
  }

  return {
    I18N_DICTIONARY,
    normalizeLang,
    t,
    formatRelativeTime,
    sanitizeTitle
  };
});
