/**
 * Rice Mill Trade - Official Frontend Application
 * Handles data synchronization, multilingual support, product filtering,
 * modal views, WhatsApp order integration, and B2B quotation.
 */

const RMT_APP = (() => {
  // Application State
  const state = {
    lang: localStorage.getItem('rmt_lang') || 'bn',
    site: null,
    products: [],
    team: [],
    services: [],
    brochures: [],
    activeCategory: 'all',
    searchQuery: ''
  };

  // Translations Dictionary (Bengali, English, Vietnamese)
  const i18n = {
    bn: {
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      services: "সার্ভিসসমূহ",
      products: "পণ্য ক্যাটালগ",
      brochures: "ডাউনলোড ও ব্রোশার",
      contact: "যোগাযোগ",
      getQuote: "কোটেশন নিন",
      waInquire: "হোয়াটসঅ্যাপে অর্ডার / অনুসন্ধান",
      viewDetails: "বিস্তারিত দেখুন",
      specs: "টেকনিক্যাল স্পেসিফিকেশন",
      searchPlaceholder: "প্রোডাক্টের নাম, ক্যাটাগরি বা মডেল লিখে সার্চ করুন...",
      allCats: "সকল পণ্য",
      boiler: "বয়লার ও স্টিম",
      compressor: "এয়ার কম্প্রেসর",
      milling: "মিলিং ও পলিশার",
      electrical: "ইলেকট্রিক্যাল ও অটোমেশন",
      magnets: "ম্যাগনেট ও ফিল্টার",
      pumps: "পাম্প ও মেকানিক্যাল",
      ventilation: "ভেন্টিলেশন ফ্যান",
      spares: "ইঞ্জিন ও অন্যান্য",
      noProducts: "কোনো পণ্য খুঁজে পাওয়া যায়নি। দয়া করে অন্য কিওয়ার্ড দিয়ে চেষ্টা করুন।",
      downloadBrochure: "পিডিএফ ডাউনলোড করুন",
      callUs: "সরাসরি কল করুন",
      sendWaQuote: "হোয়াটসঅ্যাপে কোটেশন পাঠান",
      formSentSuccess: "আপনার কোটেশন রিকোয়েস্ট প্রস্তুত! সরাসরি হোয়াটসঅ্যাপে যুক্ত হচ্ছে...",
      modalClose: "বন্ধ করুন",
      officeDhaka: "ঢাকা মেইন অফিস",
      officeManikganj: "মানিকগঞ্জ অফিস"
    },
    en: {
      home: "Home",
      about: "About Us",
      services: "Services",
      products: "Product Catalog",
      brochures: "Brochures & Downloads",
      contact: "Contact",
      getQuote: "Get a Quote",
      waInquire: "WhatsApp Inquiry / Order",
      viewDetails: "View Details",
      specs: "Technical Specifications",
      searchPlaceholder: "Search products by name, model, or keywords...",
      allCats: "All Products",
      boiler: "Boiler & Steam",
      compressor: "Air Compressors",
      milling: "Milling & Polishing",
      electrical: "Electrical & Automation",
      magnets: "Magnets & Cleaning",
      pumps: "Pumps & Mechanical",
      ventilation: "Ventilation Fans",
      spares: "Engine & Spares",
      noProducts: "No products found. Please try a different search keyword.",
      downloadBrochure: "Download PDF",
      callUs: "Call Hotline",
      sendWaQuote: "Send Quote via WhatsApp",
      formSentSuccess: "Quotation request ready! Redirecting to WhatsApp...",
      modalClose: "Close",
      officeDhaka: "Dhaka Main Office",
      officeManikganj: "Manikganj Office"
    },
    vi: {
      home: "Trang chủ",
      about: "Giới thiệu",
      services: "Dịch vụ",
      products: "Sản phẩm",
      brochures: "Tài liệu & Tải về",
      contact: "Liên hệ",
      getQuote: "Báo giá",
      waInquire: "Liên hệ WhatsApp / Đặt hàng",
      viewDetails: "Xem chi tiết",
      specs: "Thông số kỹ thuật",
      searchPlaceholder: "Tìm kiếm phụ tùng máy xay xát gạo...",
      allCats: "Tất cả sản phẩm",
      boiler: "Nồi hơi & Hơi nước",
      compressor: "Máy nén khí",
      milling: "Xay xát & Đánh bóng",
      electrical: "Điện & Tự động hóa",
      magnets: "Nam châm & Lọc",
      pumps: "Máy bơm & Cơ khí",
      ventilation: "Quạt thông gió",
      spares: "Động cơ & Khác",
      noProducts: "Không tìm thấy sản phẩm phù hợp.",
      downloadBrochure: "Tải xuống PDF",
      callUs: "Gọi ngay",
      sendWaQuote: "Gửi báo giá qua WhatsApp",
      formSentSuccess: "Đang chuyển tiếp tới WhatsApp...",
      modalClose: "Đóng",
      officeDhaka: "Văn phòng chính Dhaka",
      officeManikganj: "Văn phòng Manikganj"
    }
  };

  // Helper to fetch JSON with local storage override fallback
  async function loadData(key, url) {
    const custom = localStorage.getItem(`rmt_custom_${key}`);
    if (custom) {
      try {
        return JSON.parse(custom);
      } catch (e) {
        console.warn(`Error parsing custom ${key}, falling back to fetch`, e);
      }
    }
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error(`Failed to load ${url}:`, err);
      return [];
    }
  }

  // Initialize App
  async function init() {
    // 1. Load Data
    const [site, products, team, services, brochures] = await Promise.all([
      loadData('site', 'data/site.json'),
      loadData('products', 'data/products.json'),
      loadData('team', 'data/team.json'),
      loadData('services', 'data/services.json'),
      loadData('brochures', 'data/brochures.json')
    ]);

    state.site = site || {};
    state.products = products || [];
    state.team = team || [];
    state.services = services || [];
    state.brochures = brochures || [];

    // 2. Setup Language Switchers
    setupLanguage();

    // 3. Setup Navigation & Mobile Hamburger
    setupNav();

    // 4. Render Components based on current page
    renderDynamicContent();

    // 5. Setup Interactive Elements (Search, Filters, Modals, Forms)
    setupEventListeners();

    // 6. Setup Intersection Observer for Animations
    setupScrollAnimations();
  }

  // Language Setup
  function setupLanguage() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === state.lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
      btn.addEventListener('click', () => {
        setLanguage(btnLang);
      });
    });
    applyLanguageTexts();
  }

  function setLanguage(newLang) {
    state.lang = newLang;
    localStorage.setItem('rmt_lang', newLang);
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === newLang);
    });
    applyLanguageTexts();
    renderDynamicContent();
  }

  function t(key) {
    return (i18n[state.lang] && i18n[state.lang][key]) || (i18n.en[key]) || key;
  }

  function applyLanguageTexts() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.setAttribute('placeholder', t(key));
    });
  }

  // Nav Setup
  function setupNav() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
      });
      // Close on clicking link
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('active'));
      });
    }
  }

  // Render Dynamic Content
  function renderDynamicContent() {
    renderFeaturedProducts();
    renderProductsCatalog();
    renderTeam();
    renderServices();
    renderBrochures();
  }

  // Build WhatsApp inquiry link
  function getWhatsAppUrl(msg) {
    const phone = (state.site && state.site.company && state.site.company.whatsapp) || '8801348249343';
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  // Render Featured Products on Home
  function renderFeaturedProducts() {
    const container = document.getElementById('featured-products-grid');
    if (!container) return;

    const featured = state.products.filter(p => p.featured).slice(0, 8);
    const list = featured.length ? featured : state.products.slice(0, 8);

    container.innerHTML = list.map(p => createProductCardHtml(p)).join('');
    bindProductCardActions(container);
  }

  // Render Full Products Catalog on products.html
  function renderProductsCatalog() {
    const container = document.getElementById('products-catalog-grid');
    if (!container) return;

    let filtered = state.products;

    // Filter by Category
    if (state.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === state.activeCategory);
    }

    // Filter by Search Query
    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.nameBn && p.nameBn.includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.descriptionBn && p.descriptionBn.includes(q))
      );
    }

    const countElem = document.getElementById('product-count-display');
    if (countElem) {
      countElem.textContent = state.lang === 'bn' 
        ? `প্রদর্শিত হচ্ছে ${filtered.length} টি পণ্য`
        : `Showing ${filtered.length} products`;
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 10px; border: 1px dashed #cbd5e1;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">🔍</div>
          <h3 style="font-size: 1.25rem; color: var(--primary); margin-bottom: 8px;">${t('noProducts')}</h3>
          <p style="color: #64748b; font-size: 0.95rem;">অনুসন্ধান পুনরায় সেট করতে 'সকল পণ্য' ক্লিক করুন।</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => createProductCardHtml(p)).join('');
    bindProductCardActions(container);
  }

  // Create Product Card HTML
  function createProductCardHtml(p) {
    const isBn = state.lang === 'bn';
    const title = isBn ? p.nameBn || p.name : p.name;
    const subtitle = isBn ? p.name : p.nameBn;
    const catName = isBn ? (p.categoryBn || p.category) : p.category;
    const desc = isBn ? p.descriptionBn || p.description : p.description;
    const waUrl = getWhatsAppUrl(p.whatsappMsg || `Hello Rice Mill Trade, I want to inquire about ${p.name} (ID: ${p.id}).`);

    const specsHtml = (p.specs || []).slice(0, 2).map(s => `<span class="spec-pill">${s}</span>`).join('');

    return `
      <article class="product-card fade-in">
        <div class="product-img-box">
          <span class="product-badge">${catName}</span>
          <img src="${p.image}" alt="${title}" class="product-img" loading="lazy" onerror="this.src='assets/images/brand/logo.png'">
        </div>
        <div class="product-body">
          <h3 class="product-title">${title}</h3>
          <div class="product-title-bn">${subtitle || ''}</div>
          <div class="product-specs-summary">${specsHtml}</div>
          <p class="product-desc">${desc}</p>
          <div class="product-footer">
            <a href="${waUrl}" target="_blank" rel="noopener" class="btn-product-wa">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.534 1.769.815 2.796.815 3.182 0 5.768-2.587 5.769-5.768 0-3.181-2.587-5.769-5.769-5.769zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-1.995-.466-1.579-.652-2.583-2.261-2.662-2.366-.079-.105-.643-.855-.643-1.63 0-.776.405-1.158.549-1.315.144-.157.314-.196.419-.196.105 0 .209.001.301.006.097.005.227-.037.355.27.131.314.446 1.085.485 1.164.039.079.065.17.013.275-.052.105-.078.17-.157.262-.079.092-.165.205-.236.275-.078.079-.16.164-.069.321.092.157.408.673.875 1.089.601.535 1.109.701 1.266.78.157.079.249.066.341-.039.092-.105.393-.459.498-.616.105-.157.209-.131.353-.079.144.052.916.432 1.073.511.157.079.262.118.301.183.039.066.039.38-.105.785z"/></svg>
              <span>${t('waInquire')}</span>
            </a>
            <button class="btn-product-detail" data-product-id="${p.id}">
              <span>👁️</span> <span>${t('viewDetails')}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  // Bind Actions (Detail Modal)
  function bindProductCardActions(container) {
    container.querySelectorAll('.btn-product-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-product-id');
        openProductModal(pid);
      });
    });
  }

  // Open Product Modal
  function openProductModal(pid) {
    const p = state.products.find(item => item.id === pid);
    if (!p) return;

    const modalOverlay = document.getElementById('productDetailModal');
    if (!modalOverlay) return;

    const isBn = state.lang === 'bn';
    const title = isBn ? p.nameBn || p.name : p.name;
    const cat = isBn ? (p.categoryBn || p.category) : p.category;
    const desc = isBn ? p.descriptionBn || p.description : p.description;
    const waUrl = getWhatsAppUrl(p.whatsappMsg || `Inquiry about ${p.name}`);

    document.getElementById('modalProductTitle').textContent = title;
    document.getElementById('modalProductCategory').textContent = cat;
    document.getElementById('modalProductImg').src = p.image;
    document.getElementById('modalProductImg').alt = title;
    document.getElementById('modalProductDesc').textContent = desc;

    const specsContainer = document.getElementById('modalProductSpecs');
    if (specsContainer) {
      if (p.specs && p.specs.length > 0) {
        specsContainer.innerHTML = p.specs.map(s => `<li>${s}</li>`).join('');
      } else {
        specsContainer.innerHTML = `<li>অরিজিনাল ইন্ডাস্ট্রিয়াল স্পেসিফিকেশন ও ওয়ারেন্টিযুক্ত</li>`;
      }
    }

    const waBtn = document.getElementById('modalWhatsAppBtn');
    if (waBtn) {
      waBtn.href = waUrl;
    }

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Close Product Modal
  function closeProductModal() {
    const modalOverlay = document.getElementById('productDetailModal');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // Render Team
  function renderTeam() {
    const container = document.getElementById('team-grid');
    if (!container) return;

    const isBn = state.lang === 'bn';

    container.innerHTML = state.team.map(m => {
      const name = isBn ? m.nameBn || m.name : m.name;
      const role = isBn ? m.roleBn || m.role : m.role;
      const bio = isBn ? m.bioBn || m.bio : m.bio;
      const waMsg = `Hello Rice Mill Trade, I would like to contact ${m.name} (${m.role}).`;
      const waLink = getWhatsAppUrl(waMsg);

      return `
        <article class="team-card fade-in">
          <div class="team-img-box">
            <img src="${m.image}" alt="${name}" class="team-img" loading="lazy" onerror="this.src='assets/images/brand/logo.png'">
          </div>
          <div class="team-body">
            <h3 class="team-name">${name}</h3>
            <div class="team-name-bn">${isBn ? m.name : m.nameBn || ''}</div>
            <span class="team-role">${role}</span>
            <p class="team-bio">${bio}</p>
            <div class="team-contact-links">
              <a href="tel:${m.phone}" class="team-btn-link" title="Call">📞 ${m.phone}</a>
              <a href="${waLink}" target="_blank" rel="noopener" class="team-btn-link" title="WhatsApp" style="color:#25d366;">💬 হোয়াটসঅ্যাপ</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Render Services
  function renderServices() {
    const container = document.getElementById('services-grid');
    if (!container) return;

    const isBn = state.lang === 'bn';

    container.innerHTML = state.services.map(s => {
      const title = isBn ? s.titleBn || s.title : s.title;
      const summary = isBn ? s.summaryBn || s.summary : s.summary;
      const features = isBn ? (s.featuresBn || s.features) : s.features;
      const waUrl = getWhatsAppUrl(s.whatsappMsg || `Inquiry for ${s.title}`);

      return `
        <article class="service-card fade-in">
          <div class="service-icon">${s.icon || '⚙️'}</div>
          <h3>${title}</h3>
          <p>${summary}</p>
          <ul class="service-features-list">
            ${(features || []).map(f => `<li>${f}</li>`).join('')}
          </ul>
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm" style="margin-top:auto;">
            <span>💬</span> <span>${t('waInquire')}</span>
          </a>
        </article>
      `;
    }).join('');
  }

  // Render Brochures & Downloads
  function renderBrochures() {
    const container = document.getElementById('brochures-list');
    if (!container) return;

    const isBn = state.lang === 'bn';

    container.innerHTML = state.brochures.map(b => {
      const title = isBn ? b.titleBn || b.title : b.title;
      const cat = isBn ? (b.categoryBn || b.category) : b.category;

      return `
        <div class="brochure-card fade-in">
          <div class="brochure-icon">📄</div>
          <div class="brochure-info" style="flex-grow: 1;">
            <h4>${title}</h4>
            <div class="brochure-meta">
              <span>🏷️ ${cat}</span>
              <span>💾 ${b.fileSize}</span>
            </div>
          </div>
          <a href="${b.path}" download="${b.filename}" class="btn-download-pdf">
            <span>📥</span> <span>${t('downloadBrochure')}</span>
          </a>
        </div>
      `;
    }).join('');
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // 1. Search Bar
    const searchInput = document.getElementById('catalogSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderProductsCatalog();
      });
    }

    // 2. Category Filter Pills
    const filterPills = document.querySelectorAll('.filter-btn');
    filterPills.forEach(btn => {
      btn.addEventListener('click', () => {
        filterPills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCategory = btn.getAttribute('data-category');
        renderProductsCatalog();
      });
    });

    // 3. Modal Close handlers
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalOverlay = document.getElementById('productDetailModal');
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeProductModal);
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeProductModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeProductModal();
    });

    // 4. B2B Quotation Form
    const quoteForm = document.getElementById('b2bQuoteForm');
    if (quoteForm) {
      quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(quoteForm);
        const name = fd.get('clientName') || '';
        const phone = fd.get('clientPhone') || '';
        const mill = fd.get('millName') || 'N/A';
        const capacity = fd.get('millCapacity') || 'N/A';
        const interest = fd.get('interestCategory') || 'General Spares';
        const note = fd.get('notes') || '';

        const compiledMessage = 
`*Rice Mill Trade - B2B Quotation Request*
Name: ${name}
Phone: ${phone}
Mill/Organization: ${mill}
Mill Capacity: ${capacity} TPD
Interested In: ${interest}
Requirement Details: ${note}
Date: ${new Date().toLocaleDateString('en-GB')}`;

        const waUrl = getWhatsAppUrl(compiledMessage);
        window.open(waUrl, '_blank');
        alert(t('formSentSuccess'));
        quoteForm.reset();
      });
    }
  }

  // Scroll Animations
  function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
  }

  return { init, state, setLanguage };
})();

document.addEventListener('DOMContentLoaded', () => {
  RMT_APP.init();
});