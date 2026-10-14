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
});
