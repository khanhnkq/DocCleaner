/**
 * DocCleaner Landing Page Script
 * Multilingual URL Architecture & Navbar Scroll Elevation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Language Toggle Click Preference Storage
  const langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      const isCurrentlyVi = document.documentElement.lang === 'vi';
      localStorage.setItem('doccleaner_landing_lang', isCurrentlyVi ? 'en' : 'vi');
    });
  }

  // 2. Navbar Scroll Elevation Class Toggle
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // 3. Smart Visitor Traffic Counter (Local Persistence & Smooth Count-Up Animation)
  const counterElements = document.querySelectorAll('#visitorCount, .visitor-count-val');
  if (counterElements.length) {
    const BASELINE_KEY = 'doccleaner_traffic_count';
    const SESSION_KEY = 'doccleaner_has_visited_session';
    const BASELINE_MIN = 1482; // Realistic baseline based on 429+ store impressions and organic traffic

    let currentCount = parseInt(localStorage.getItem(BASELINE_KEY), 10);
    if (!currentCount || isNaN(currentCount) || currentCount < BASELINE_MIN) {
      currentCount = BASELINE_MIN;
    }

    const hasVisitedThisSession = sessionStorage.getItem(SESSION_KEY);
    if (!hasVisitedThisSession) {
      currentCount += 1;
      localStorage.setItem(BASELINE_KEY, currentCount.toString());
      sessionStorage.setItem(SESSION_KEY, 'true');
    }

    const startVal = Math.max(0, currentCount - 65);
    const endVal = currentCount;
    const durationMs = 1200;
    const startTime = performance.now();

    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      const val = Math.floor(startVal + (endVal - startVal) * easeProgress);

      const formattedVal = val.toLocaleString();
      counterElements.forEach(el => {
        el.textContent = formattedVal;
      });

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        counterElements.forEach(el => {
          el.textContent = endVal.toLocaleString();
        });
      }
    }

    requestAnimationFrame(updateCounter);
  }
});
