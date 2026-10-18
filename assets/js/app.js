document.addEventListener('DOMContentLoaded', () => {
  let currentLang = localStorage.getItem('rmt_lang') || 'bn';

  const skipLink = document.querySelector('.skip-link');
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      const target = document.querySelector('#main-content');
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus();
      }
    });
  }

  const observerOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

  const translations = {
    bn: {
      navHome: "হোম", navAbout: "আমাদের সম্পর্কে", navServices: "সার্ভিসসমূহ",
      navProducts: "প্রোডাক্টস", navContact: "যোগাযোগ"
    },
    en: {
      navHome: "Home", navAbout: "About Us", navServices: "Services",
      navProducts: "Products", navContact: "Contact"
    }
  };

  const setLanguage = (lang) => {
    currentLang = lang;
    localStorage.setItem('rmt_lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (translations[lang] && translations[lang][key]) {
        el.textContent = translations[lang][key];
      }
    });
    const langBtn = document.getElementById('langToggle');
    if (langBtn) langBtn.textContent = lang === 'bn' ? 'English' : 'বাংলা';
  };

  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      setLanguage(currentLang === 'bn' ? 'en' : 'bn');
    });
  }
  setLanguage(currentLang);

  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
  }

  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('আপনার কোটেশন রিকোয়েস্ট সফলভাবে জমা নেওয়া হয়েছে!');
      contactForm.reset();
    });
  }
});