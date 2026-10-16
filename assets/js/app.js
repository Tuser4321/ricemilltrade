// =========================================
// Rice Mill Trade - Frontend JavaScript
// =========================================

const WHATSAPP_NUMBER = '8801348249343';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;
let currentLang = 'en';
let products = [];
let filteredProducts = [];

const translations = {
  en: {
    'nav.home': 'Home', 'nav.about': 'About Us', 'nav.services': 'Services',
    'nav.products': 'Products', 'nav.contact': 'Contact', 'nav.admin': 'Admin',
    'hero.tagline': 'Your reliable partner in your business',
    'hero.subtitle': 'Leading supplier of rice mill spare parts, reconditioned machinery, and solar energy solutions in Bangladesh.',
    'btn.inquire': 'Inquire via WhatsApp', 'btn.whatsapp': 'WhatsApp Us', 'btn.quote': 'Request Quotation',
    'category.spare-parts': 'Auto Rice Mill Spare Parts', 'category.reconditioned': 'Reconditioned Machinery', 'category.solar': 'Solar & Renewable Energy',
    'filter.all': 'All Categories', 'search.placeholder': 'Search products...',
    'no-results': 'No products found matching your criteria.',
    'about.title': 'About Us',
    'about.intro': 'Rice Mill Trade is a leading B2B supplier of rice mill machinery, spare parts, and renewable energy solutions in Bangladesh.',
    'services.title': 'Our Services',
    'contact.title': 'Contact Us', 'contact.quote': 'B2B Quotation Form', 'contact.quick': 'Quick WhatsApp Contact',
    'footer.rights': 'All rights reserved.'
  },
  bn: {
    'nav.home': 'হোম', 'nav.about': 'আমাদের সম্পর্কে', 'nav.services': 'সেবা',
    'nav.products': 'পণ্য', 'nav.contact': 'যোগাযোগ', 'nav.admin': 'অ্যাডমিন',
    'hero.tagline': 'আপনার ব্যবসায় আপনার বিশ্বস্ত সহযোগী',
    'hero.subtitle': 'বাংলাদেশে রাইস মিল পার্টস, যন্ত্রপাতি এবং সৌর শক্তি সমাধানের নেতৃস্থানীয় সরবরাহকারী।',
    'btn.inquire': 'উইটসএপের মাধ্যমে জিজ্ঞাসা করুন', 'btn.whatsapp': 'উইটসএপ করুন', 'btn.quote': 'কোটেশন চান',
    'category.spare-parts': 'রাইস Milan spare parts', 'category.reconditioned': 'পুনর্নির্মিত যন্ত্রপাতি', 'category.solar': 'সৌর ও নবায়নযোগ্য শক্তি',
    'filter.all': 'সব বিভাগ', 'search.placeholder': 'পণ্য খুঁজুন...',
    'no-results': 'কোনো পণ্য পাওয়া যায়নি।',
    'about.title': 'আমাদের সম্পর্কে',
    'about.intro': 'রাইস মিল ট্রেড বাংলাদেশের নেতৃস্থানীয় বি২বি সরবরাহকারী।',
    'services.title': 'আমাদের সেবা',
    'contact.title': 'যোগাযোগ', 'contact.quote': 'বি২বি কোটেশন', 'contact.quick': 'দ্রুতウィатসঅপ',
    'footer.rights': 'সকল অধিকার সংরক্ষিত।'
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initHeader(); initLanguageToggle(); initMobileMenu();
  if (document.getElementById('products-grid')) { loadProducts(); initProductFilters(); initSearch(); }
  if (document.getElementById('contact-form')) { initContactForm(); }
});

function initHeader() {
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  });
}

function initLanguageToggle() {
  const btn = document.getElementById('lang-toggle-btn');
  const saved = localStorage.getItem('ricemill_lang');
  if (saved) { currentLang = saved; applyLanguage(currentLang); }
  btn.addEventListener('click', () => {
    currentLang = currentLang === 'en' ? 'bn' : 'en';
    localStorage.setItem('ricemill_lang', currentLang);
    applyLanguage(currentLang);
  });
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.body.className = `lang-${lang}`;
  const btn = document.getElementById('lang-toggle-btn');
  btn.textContent = lang === 'en' ? 'বাংলা' : 'English';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) el.textContent = translations[lang][key];
  });
  renderProducts();
}

function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const menu = document.querySelector('.nav-menu');
  if (toggle && menu) toggle.addEventListener('click', () => menu.classList.toggle('active'));
}
async function loadProducts() {
  try {
    const res = await fetch('data/products.json');
    const data = await res.json();
    products = data.products;
    filteredProducts = [...products];
    renderProducts();
  } catch (e) {
    console.error('Failed to load products:', e);
    document.getElementById('products-grid').innerHTML = '<div class="no-results">Unable to load products.</div>';
  }
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;
  const lang = currentLang;
  grid.innerHTML = '';
  if (filteredProducts.length === 0) {
    grid.innerHTML = `<div class="no-results">${translations[lang]['no-results']}</div>`;
    return;
  }
  filteredProducts.forEach(p => {
    const catBadge = `badge-${p.category}`;
    const catLabel = translations[lang][`category.${p.category}`] || p.category;
    const msg = `Inquiry for ${p.name} (Model: ${p.model}) - Rice Mill Trade`;
    const waLink = `${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`;
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" onerror="this.src='assets/images/brand/Company Name and Logo Colour.png'">
      <div class="product-card-info">
        <span class="badge ${catBadge}">${catLabel}</span>
        <h3>${p.name}</h3>
        <span class="model">Model: ${p.model}</span>
        <p>${p.description}</p>
        <div class="product-card-actions">
          <a href="${waLink}" class="btn btn-whatsapp" target="_blank">${translations[lang]['btn.inquire']}</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

function initProductFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');
      if (cat === 'all') filteredProducts = [...products];
      else filteredProducts = products.filter(p => p.category === cat);
      renderProducts();
    });
  });
}

function initSearch() {
  const input = document.querySelector('.search-box input');
  input.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    filteredProducts = products.filter(p =>
      p.name.toLowerCase().includes(term) || p.model.toLowerCase().includes(term) || p.description.toLowerCase().includes(term)
    );
    renderProducts();
  });
}

function initContactForm() {
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const data = Object.fromEntries(fd);
    const msg = `New B2B Quotation Request from Rice Mill Trade Website:\n\nName: ${data.name}\nCompany: ${data.company}\nEmail: ${data.email}\nPhone: ${data.phone}\nProduct: ${data.product}\nMessage: ${data.message}\n\nFrom: ricemilltrade.com`;
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(msg)}`, '_blank');
    form.reset();
    alert('Thank you! Your quotation request is ready on WhatsApp.');
  });
}