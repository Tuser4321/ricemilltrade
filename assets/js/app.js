/**
 * Rice Mill Trade - Official Frontend Application
 * Multi-Language Support: বাংলা (BN), English (EN), 中文 (ZH), Türkçe (TR)
 * Dynamic Theme, Hero Carousel with Video, Product Price Hiding & WhatsApp Integration.
 */

const RMT_APP = (() => {
  const state = {
    lang: localStorage.getItem('rmt_lang') || 'bn',
    site: null,
    products: [],
    team: [],
    services: [],
    brochures: [],
    activeCategory: 'all',
    searchQuery: '',
    currentSlideIdx: 0,
    slideInterval: null
  };

  // Multilingual Dictionary (BN, EN, ZH, TR)
  const i18n = {
    bn: {
      home: "হোম",
      about: "আমাদের সম্পর্কে",
      services: "সার্ভিসসমূহ",
      products: "পণ্য ক্যাটালগ",
      brochures: "ডাউনলোড",
      contact: "যোগাযোগ",
      getQuote: "কোটেশন নিন",
      waInquire: "হোয়াটসঅ্যাপে অর্ডার",
      viewDetails: "বিস্তারিত",
      specs: "স্পেসিফিকেশন",
      searchPlaceholder: "প্রোডাক্টের নাম বা মডেল খুঁজুন...",
      allCats: "সকল পণ্য",
      boiler: "বয়লার ও স্টিম",
      compressor: "এয়ার কম্প্রেসর",
      milling: "মিলিং ও পলিশার",
      electrical: "ইলেকট্রিক্যাল",
      magnets: "ম্যাগনেট ও ফিল্টার",
      pumps: "পাম্প ও ভাল্ব",
      ventilation: "ভেন্টিলেশন",
      spares: "ইঞ্জিন পার্টস",
      noProducts: "কোনো পণ্য খুঁজে পাওয়া যায়নি।",
      downloadBrochure: "ডাউনলোড",
      callUs: "সরাসরি কল",
      sendWaQuote: "হোয়াটসঅ্যাপে পাঠান",
      formSentSuccess: "আপনার কোটেশন প্রস্তুত! হোয়াটসঅ্যাপে যুক্ত হচ্ছে...",
      modalClose: "বন্ধ",
      officeDhaka: "ঢাকা প্রধান কার্যালয়",
      officeManikganj: "মানিকগঞ্জ শাখা",
      callForPrice: "কোটেশনের জন্য যোগাযোগ",
      priceLabel: "মূল্য:"
    },
    en: {
      home: "Home",
      about: "About Us",
      services: "Services",
      products: "Products",
      brochures: "Downloads",
      contact: "Contact",
      getQuote: "Get Quote",
      waInquire: "WhatsApp Inquiry",
      viewDetails: "Details",
      specs: "Specifications",
      searchPlaceholder: "Search parts by name or model...",
      allCats: "All Spares",
      boiler: "Boiler & Steam",
      compressor: "Air Compressor",
      milling: "Milling & Polishing",
      electrical: "Electrical & Panels",
      magnets: "Magnets & Grids",
      pumps: "Pumps & Valves",
      ventilation: "Ventilation Fans",
      spares: "Engine Parts",
      noProducts: "No products found.",
      downloadBrochure: "Download",
      callUs: "Call Direct",
      sendWaQuote: "Send via WhatsApp",
      formSentSuccess: "Quote prepared! Opening WhatsApp...",
      modalClose: "Close",
      officeDhaka: "Dhaka Head Office",
      officeManikganj: "Manikganj Office",
      callForPrice: "Contact for Quote",
      priceLabel: "Price:"
    },
    zh: {
      home: "首页",
      about: "关于我们",
      services: "工程服务",
      products: "产品目录",
      brochures: "资料下载",
      contact: "联系我们",
      getQuote: "获取报价",
      waInquire: "WhatsApp 咨询",
      viewDetails: "产品详情",
      specs: "技术参数",
      searchPlaceholder: "搜索大米加工机械零配件...",
      allCats: "所有配件",
      boiler: "锅炉与蒸汽系统",
      compressor: "螺杆空压机",
      milling: "碾米与抛光机",
      electrical: "电气与自动化",
      magnets: "强磁除铁与筛网",
      pumps: "水泵与机械密封",
      ventilation: "工业排风扇",
      spares: "发电机配件",
      noProducts: "未找到相关产品。",
      downloadBrochure: "下载样本",
      callUs: "直接致电",
      sendWaQuote: "通过 WhatsApp 发送",
      formSentSuccess: "询价单已生成，正在跳转到 WhatsApp...",
      modalClose: "关闭",
      officeDhaka: "达卡总办事处",
      officeManikganj: "马尼克甘杰分部",
      callForPrice: "联系获取优惠报价",
      priceLabel: "价格:"
    },
    tr: {
      home: "Ana Sayfa",
      about: "Hakkımızda",
      services: "Hizmetlerimiz",
      products: "Ürünler",
      brochures: "Kataloglar",
      contact: "İletişim",
      getQuote: "Teklif Al",
      waInquire: "WhatsApp Sipariş",
      viewDetails: "Detaylar",
      specs: "Teknik Özellikler",
      searchPlaceholder: "Pirinç fabrikası yedek parçası ara...",
      allCats: "Tüm Parçalar",
      boiler: "Kazan ve Buhar",
      compressor: "Vidalı Kompresör",
      milling: "Öğütme ve Parlatma",
      electrical: "Elektrik ve Otomasyon",
      magnets: "Mıknatıs ve Filtre",
      pumps: "Pompalar ve Vanalar",
      ventilation: "Havalandırma Fanı",
      spares: "Motor Parçaları",
      noProducts: "Ürün bulunamadı.",
      downloadBrochure: "İndir",
      callUs: "Hemen Ara",
      sendWaQuote: "WhatsApp ile Gönder",
      formSentSuccess: "Teklif hazırlandı! WhatsApp açılıyor...",
      modalClose: "Kapat",
      officeDhaka: "Dakka Merkez Ofisi",
      officeManikganj: "Manikganj Şubesi",
      callForPrice: "Fiyat İçin İletişime Geçin",
      priceLabel: "Fiyat:"
    }
  };

  async function loadData(key, url) {
    const custom = localStorage.getItem(`rmt_custom_${key}`);
    if (custom) {
      try { return JSON.parse(custom); } catch (e) {}
    }
    try {
      const res = await fetch(url);
      return await res.json();
    } catch (err) {
      console.error(`Failed to load ${url}:`, err);
      return [];
    }
  }

  function applyTheme() {
    const customTheme = localStorage.getItem('rmt_custom_theme');
    let theme = (state.site && state.site.theme) || {};
    if (customTheme) {
      try { theme = { ...theme, ...JSON.parse(customTheme) }; } catch (e) {}
    }
    const primary = theme.primaryColor || '#0f3460';
    const secondary = theme.secondaryColor || '#e67e22';
    const accent = theme.accentColor || '#25d366';

    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--secondary', secondary);
    document.documentElement.style.setProperty('--whatsapp', accent);
  }

  async function init() {
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

    applyTheme();
    setupLanguage();
    setupNav();
    renderDynamicContent();
    setupHeroSlider();
    renderSocialLinks();
    setupEventListeners();
    setupScrollAnimations();
  }

  function setupLanguage() {
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
      const btnLang = btn.getAttribute('data-lang');
      btn.classList.toggle('active', btnLang === state.lang);
      btn.addEventListener('click', () => setLanguage(btnLang));
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
    renderHeroSlide(state.currentSlideIdx);
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

  function setupNav() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (hamburger && navMenu) {
      hamburger.addEventListener('click', () => navMenu.classList.toggle('active'));
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => navMenu.classList.remove('active'));
      });
    }
  }

  function setupHeroSlider() {
    const container = document.getElementById('heroSlider');
    if (!container) return;

    const slides = (state.site && state.site.heroSlides) || [];
    if (slides.length === 0) return;

    const dotsContainer = document.getElementById('sliderDots');
    if (dotsContainer) {
      dotsContainer.innerHTML = slides.map((_, i) => `<span class="slider-dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></span>`).join('');
      dotsContainer.querySelectorAll('.slider-dot').forEach(d => {
        d.addEventListener('click', () => goToSlide(parseInt(d.getAttribute('data-idx'))));
      });
    }

    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(state.currentSlideIdx - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(state.currentSlideIdx + 1));

    renderHeroSlide(0);
    startSliderTimer();
    container.addEventListener('mouseenter', stopSliderTimer);
    container.addEventListener('mouseleave', startSliderTimer);
  }

  function startSliderTimer() {
    stopSliderTimer();
    state.slideInterval = setInterval(() => {
      const slides = (state.site && state.site.heroSlides) || [];
      if (slides.length > 1) goToSlide(state.currentSlideIdx + 1);
    }, 6000);
  }

  function stopSliderTimer() {
    if (state.slideInterval) clearInterval(state.slideInterval);
  }

  function goToSlide(idx) {
    const slides = (state.site && state.site.heroSlides) || [];
    if (slides.length === 0) return;
    if (idx < 0) idx = slides.length - 1;
    if (idx >= slides.length) idx = 0;
    state.currentSlideIdx = idx;
    renderHeroSlide(idx);
  }

  function renderHeroSlide(idx) {
    const slides = (state.site && state.site.heroSlides) || [];
    if (!slides[idx]) return;
    const s = slides[idx];
    const isBn = state.lang === 'bn';

    document.querySelectorAll('.hero-slide').forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });

    document.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });

    const badgeEl = document.getElementById('heroSlideBadge');
    const titleEl = document.getElementById('heroSlideTitle');
    const descEl = document.getElementById('heroSlideDesc');

    if (badgeEl) badgeEl.textContent = isBn ? s.badge : (s.badgeEn || s.badge);
    if (titleEl) titleEl.textContent = isBn ? s.title : (s.titleEn || s.title);
    if (descEl) descEl.textContent = isBn ? s.subtitle : (s.subtitleEn || s.subtitle);
  }

  function renderSocialLinks() {
    const soc = (state.site && state.site.social) || {};
    const containers = document.querySelectorAll('.social-links-bar');

    containers.forEach(container => {
      container.innerHTML = `
        ${soc.facebook ? `<a href="${soc.facebook}" target="_blank" rel="noopener" class="social-icon-btn" title="Facebook"><svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>` : ''}
        ${soc.youtube ? `<a href="${soc.youtube}" target="_blank" rel="noopener" class="social-icon-btn" title="YouTube"><svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>` : ''}
        ${soc.linkedin ? `<a href="${soc.linkedin}" target="_blank" rel="noopener" class="social-icon-btn" title="LinkedIn"><svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>` : ''}
        ${soc.whatsapp ? `<a href="https://wa.me/${soc.whatsapp}" target="_blank" rel="noopener" class="social-icon-btn" title="WhatsApp"><svg viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.534 1.769.815 2.796.815 3.182 0 5.768-2.587 5.769-5.768 0-3.181-2.587-5.769-5.769-5.769zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.694.072-1.995-.466-1.579-.652-2.583-2.261-2.662-2.366-.079-.105-.643-.855-.643-1.63 0-.776.405-1.158.549-1.315.144-.157.314-.196.419-.196.105 0 .209.001.301.006.097.005.227-.037.355.27.131.314.446 1.085.485 1.164.039.079.065.17.013.275-.052.105-.078.17-.157.262-.079.092-.165.205-.236.275-.078.079-.16.164-.069.321.092.157.408.673.875 1.089.601.535 1.109.701 1.266.78.157.079.249.066.341-.039.092-.105.393-.459.498-.616.105-.157.209-.131.353-.079.144.052.916.432 1.073.511.157.079.262.118.301.183.039.066.039.38-.105.785z"/></svg></a>` : ''}
      `;
    });
  }

  function renderDynamicContent() {
    renderFeaturedProducts();
    renderProductsCatalog();
    renderTeam();
    renderServices();
    renderBrochures();
  }

  function getWhatsAppUrl(msg) {
    const phone = (state.site && state.site.company && state.site.company.whatsapp) || '8801348249343';
    return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
  }

  function isPriceHidden(p) {
    const globalHide = state.site && state.site.settings && state.site.settings.hideAllPrices;
    if (globalHide !== false) return true; // Default: hidden
    return p.hidePrice !== false;
  }

  function renderFeaturedProducts() {
    const container = document.getElementById('featured-products-grid');
    if (!container) return;

    const featured = state.products.filter(p => p.featured).slice(0, 8);
    const list = featured.length ? featured : state.products.slice(0, 8);

    container.innerHTML = list.map(p => createProductCardHtml(p)).join('');
    bindProductCardActions(container);
  }

  function renderProductsCatalog() {
    const container = document.getElementById('products-catalog-grid');
    if (!container) return;

    let filtered = state.products;

    if (state.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.category === state.activeCategory);
    }

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
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: #fff; border-radius: 10px; border: 1px dashed #cbd5e1;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🔍</div>
          <h3 style="font-size: 1.15rem; color: var(--primary); margin-bottom: 6px;">${t('noProducts')}</h3>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(p => createProductCardHtml(p)).join('');
    bindProductCardActions(container);
  }

  function createProductCardHtml(p) {
    const isBn = state.lang === 'bn';
    const title = isBn ? p.nameBn || p.name : p.name;
    const catName = isBn ? (p.categoryBn || p.category) : p.category;
    const waUrl = getWhatsAppUrl(p.whatsappMsg || `Inquiry about ${p.name} (ID: ${p.id}).`);

    const priceHidden = isPriceHidden(p);
    let priceHtml = priceHidden
      ? `<span class="price-badge price-hidden">🔒 ${t('callForPrice')}</span>`
      : `<span class="price-badge price-visible">🏷️ ${p.price || 'Call'}</span>`;

    return `
      <article class="product-card fade-in">
        <div class="product-img-box">
          <span class="product-badge">${catName}</span>
          <img src="${p.image}" alt="${title}" class="product-img" loading="lazy" onerror="this.src='assets/images/brand/logo.png'">
        </div>
        <div class="product-body">
          <h3 class="product-title">${title}</h3>
          <div class="product-price-box">${priceHtml}</div>
          <div class="product-footer">
            <a href="${waUrl}" target="_blank" rel="noopener" class="btn-product-wa">
              <span>💬 ${t('waInquire')}</span>
            </a>
            <button class="btn-product-detail" data-product-id="${p.id}">
              <span>👁️ ${t('viewDetails')}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function bindProductCardActions(container) {
    container.querySelectorAll('.btn-product-detail').forEach(btn => {
      btn.addEventListener('click', () => {
        const pid = btn.getAttribute('data-product-id');
        openProductModal(pid);
      });
    });
  }

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
    if (waBtn) waBtn.href = waUrl;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeProductModal() {
    const modalOverlay = document.getElementById('productDetailModal');
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  function renderTeam() {
    const container = document.getElementById('team-grid');
    if (!container) return;

    const isBn = state.lang === 'bn';

    container.innerHTML = state.team.map(m => {
      const name = isBn ? m.nameBn || m.name : m.name;
      const role = isBn ? m.roleBn || m.role : m.role;
      const waLink = getWhatsAppUrl(`Hello Rice Mill Trade, I would like to contact ${m.name} (${m.role}).`);

      return `
        <article class="team-card fade-in">
          <div class="team-img-box">
            <img src="${m.image}" alt="${name}" class="team-img" loading="lazy" onerror="this.src='assets/images/brand/logo.png'">
          </div>
          <div class="team-body">
            <h3 class="team-name">${name}</h3>
            <span class="team-role">${role}</span>
            <div class="team-contact-links">
              <a href="tel:${m.phone}" class="team-btn-link">📞 ${m.phone}</a>
              <a href="${waLink}" target="_blank" rel="noopener" class="team-btn-link" style="color:#25d366;">💬 WhatsApp</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderServices() {
    const container = document.getElementById('services-grid');
    if (!container) return;

    const isBn = state.lang === 'bn';

    container.innerHTML = state.services.map(s => {
      const title = isBn ? s.titleBn || s.title : s.title;
      const summary = isBn ? s.summaryBn || s.summary : s.summary;
      const waUrl = getWhatsAppUrl(s.whatsappMsg || `Inquiry for ${s.title}`);

      return `
        <article class="service-card fade-in">
          <div class="service-icon">${s.icon || '⚙️'}</div>
          <h3>${title}</h3>
          <p>${summary}</p>
          <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm" style="margin-top:auto;">
            <span>💬 ${t('waInquire')}</span>
          </a>
        </article>
      `;
    }).join('');
  }

  function renderBrochures() {
    const container = document.getElementById('brochures-list');
    if (!container) return;

    const isBn = state.lang === 'bn';

    container.innerHTML = state.brochures.map(b => {
      const title = isBn ? b.titleBn || b.title : b.title;
      return `
        <div class="brochure-card fade-in">
          <div class="brochure-icon">📄</div>
          <div class="brochure-info" style="flex-grow: 1;">
            <h4>${title}</h4>
            <div class="brochure-meta">
              <span>💾 ${b.fileSize}</span>
            </div>
          </div>
          <a href="${b.path}" download="${b.filename}" class="btn-download-pdf">
            <span>📥 ${t('downloadBrochure')}</span>
          </a>
        </div>
      `;
    }).join('');
  }

  function setupEventListeners() {
    const searchInput = document.getElementById('catalogSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        renderProductsCatalog();
      });
    }

    const filterPills = document.querySelectorAll('.filter-btn');
    filterPills.forEach(btn => {
      btn.addEventListener('click', () => {
        filterPills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.activeCategory = btn.getAttribute('data-category');
        renderProductsCatalog();
      });
    });

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

    const quoteForm = document.getElementById('b2bQuoteForm');
    if (quoteForm) {
      quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(quoteForm);
        const compiledMessage = 
`*Rice Mill Trade - B2B Quotation Request*
Name: ${fd.get('clientName') || ''}
Phone: ${fd.get('clientPhone') || ''}
Mill: ${fd.get('millName') || 'N/A'}
Details: ${fd.get('notes') || ''}`;

        window.open(getWhatsAppUrl(compiledMessage), '_blank');
        alert(t('formSentSuccess'));
        quoteForm.reset();
      });
    }
  }

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

  return { init, state, setLanguage, goToSlide };
})();

document.addEventListener('DOMContentLoaded', () => {
  RMT_APP.init();
});