/**
 * Rice Mill Trade - Official Admin Control Logic
 * Complete CRUD operations for Products, Services, Catalogs/Brochures, Team,
 * Theme Customization, Price Hiding, Single Admin Security, and Backup.
 */

const RMT_ADMIN = (() => {
  const state = {
    session: null,
    site: {},
    products: [],
    services: [],
    team: [],
    brochures: [],
    admins: [],
    editingProductId: null,
    editingServiceId: null,
    editingBrochureId: null,
    editingTeamId: null
  };

  // Check Session
  function checkAuth() {
    const s = localStorage.getItem('rmt_admin_session');
    if (!s) {
      window.location.replace('login.html');
      return false;
    }
    try {
      state.session = JSON.parse(s);
      if (!state.session || !state.session.username) {
        window.location.replace('login.html');
        return false;
      }
      const nameElem = document.getElementById('displayName');
      const roleElem = document.getElementById('displayRole');
      if (nameElem) nameElem.textContent = state.session.name || state.session.username;
      if (roleElem) roleElem.textContent = state.session.role || 'Superadmin';
      return true;
    } catch (e) {
      window.location.replace('login.html');
      return false;
    }
  }

  // Load Data
  async function loadAllData() {
    // 1. Site info
    state.site = await getEntityData('site', '../data/site.json');
    if (!state.site) state.site = {};
    if (!state.site.settings) state.site.settings = { hideAllPrices: true };
    if (!state.site.company) state.site.company = {};
    if (!state.site.social) state.site.social = {};
    if (!state.site.theme) state.site.theme = { primaryColor: '#0f3460', secondaryColor: '#e67e22' };

    // 2. Products
    state.products = await getEntityData('products', '../data/products.json');
    if (!Array.isArray(state.products)) state.products = [];

    // 3. Services
    state.services = await getEntityData('services', '../data/services.json');
    if (!Array.isArray(state.services)) state.services = [];

    // 4. Team
    state.team = await getEntityData('team', '../data/team.json');
    if (!Array.isArray(state.team)) state.team = [];

    // 5. Brochures / Catalog
    state.brochures = await getEntityData('brochures', '../data/brochures.json');
    if (!Array.isArray(state.brochures)) state.brochures = [];

    // 6. Master Admin
    const customAdmins = localStorage.getItem('rmt_custom_admins');
    if (customAdmins) {
      try {
        const parsed = JSON.parse(customAdmins);
        if (Array.isArray(parsed) && parsed.length > 0) state.admins = parsed;
      } catch(e){}
    }
    if (!state.admins || state.admins.length === 0) {
      if (state.site && Array.isArray(state.site.admins) && state.site.admins.length > 0) {
        state.admins = state.site.admins;
      } else {
        state.admins = [
          { username: "admin", password: "Rezaul9270", name: "Rezaul Karim", role: "superadmin" }
        ];
      }
    }
  }

  async function getEntityData(key, fallbackUrl) {
    const custom = localStorage.getItem(`rmt_custom_${key}`);
    if (custom) {
      try { return JSON.parse(custom); } catch(e){}
    }
    try {
      const res = await fetch(fallbackUrl);
      return await res.json();
    } catch(err) {
      console.warn(`Could not load ${fallbackUrl}`, err);
      return [];
    }
  }

  function saveEntity(key, data) {
    localStorage.setItem(`rmt_custom_${key}`, JSON.stringify(data));
    showToast('সফলভাবে সংরক্ষিত হয়েছে!');
  }

  // Initialize
  async function init() {
    if (!checkAuth()) return;

    await loadAllData();

    // Set Current Date in Bengali
    const dElem = document.getElementById('currentDateDisplay');
    if (dElem) {
      dElem.textContent = new Date().toLocaleDateString('bn-BD', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    setupNavigation();
    setupForms();
    renderAll();
  }

  // Render All Sections
  function renderAll() {
    renderStats();
    populateSiteForm();
    populateThemeControls();
    populatePriceControls();
    renderHeroSlidesList();
    renderProductsTable();
    renderServicesTable();
    renderBrochuresTable();
    renderTeamTable();
    populateSecurityForm();
  }

  // Render Stats
  function renderStats() {
    const pCount = document.getElementById('statProducts');
    const sCount = document.getElementById('statServices');
    const bCount = document.getElementById('statBrochures');
    const tCount = document.getElementById('statTeam');

    if (pCount) pCount.textContent = state.products.length;
    if (sCount) sCount.textContent = state.services.length;
    if (bCount) bCount.textContent = state.brochures.length;
    if (tCount) tCount.textContent = state.team.length;
  }

  // ==========================================
  // Site Settings & Social Media
  // ==========================================
  function populateSiteForm() {
    const c = (state.site && state.site.company) || {};
    const soc = (state.site && state.site.social) || {};
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('cfg_companyName', c.name || 'Rice Mill Trade');
    setVal('cfg_companyNameBn', c.nameBn || 'রাইস মিল ট্রেড');
    setVal('cfg_tagline', c.tagline || 'Your reliable partner in your business');
    setVal('cfg_taglineBn', c.taglineBn || 'আপনার ব্যবসায় বিশ্বস্ত সহযোগী');
    setVal('cfg_phone', c.phone || '01348249343');
    setVal('cfg_whatsapp', c.whatsapp || '8801348249343');
    setVal('cfg_email', c.email || 'ricemilltrade@gmail.com');
    setVal('cfg_businessHours', c.businessHours || 'Sat - Thu: 9:00 AM - 8:00 PM');
    setVal('cfg_mainAddress', c.mainOfficeAddress || 'Protikkha (4th Floor), House #13, Road #10, Nikunja-2, Khelkhet, Dhaka-1229');
    setVal('cfg_manikganjAddress', c.manikganjOfficeAddress || '1: 47/1, Autpara, Betila, Manikganj Sadar, Manikganj');

    // Social Media Links
    setVal('cfg_facebook', soc.facebook || '');
    setVal('cfg_youtube', soc.youtube || '');
    setVal('cfg_linkedin', soc.linkedin || '');
    setVal('cfg_instagram', soc.instagram || '');
    setVal('cfg_twitter', soc.twitter || '');
  }

  function handleSaveSiteSettings() {
    const getVal = (id) => (document.getElementById(id) ? document.getElementById(id).value.trim() : '');

    state.site.company = {
      ...state.site.company,
      name: getVal('cfg_companyName'),
      nameBn: getVal('cfg_companyNameBn'),
      tagline: getVal('cfg_tagline'),
      taglineBn: getVal('cfg_taglineBn'),
      phone: getVal('cfg_phone'),
      whatsapp: getVal('cfg_whatsapp'),
      email: getVal('cfg_email'),
      businessHours: getVal('cfg_businessHours'),
      mainOfficeAddress: getVal('cfg_mainAddress'),
      manikganjOfficeAddress: getVal('cfg_manikganjAddress')
    };

    state.site.social = {
      ...state.site.social,
      facebook: getVal('cfg_facebook'),
      youtube: getVal('cfg_youtube'),
      linkedin: getVal('cfg_linkedin'),
      instagram: getVal('cfg_instagram'),
      twitter: getVal('cfg_twitter')
    };

    saveEntity('site', state.site);
  }

  // ==========================================
  // Price Controls
  // ==========================================
  function populatePriceControls() {
    const isHidden = state.site.settings ? (state.site.settings.hideAllPrices !== false) : true;
    const chk = document.getElementById('globalHidePricesCheckbox');
    if (chk) chk.checked = isHidden;
    updateGlobalPriceStatusUI(isHidden);
  }

  function updateGlobalPriceStatusUI(isHidden) {
    const txt = document.getElementById('globalPriceStatusText');
    if (txt) {
      if (isHidden) {
        txt.style.color = '#d97706';
        txt.textContent = 'সকল পণ্যের মূল্য গোপন (হাইড) রয়েছে — গ্রাহকরা সরাসরি হোয়াটসঅ্যাপে বা ফোনে কোটেশন জানতে পারবেন।';
      } else {
        txt.style.color = '#15803d';
        txt.textContent = 'সকল পণ্যের নির্ধারিত মূল্য ওয়েবসাইটে সরাসরি প্রদর্শিত হচ্ছে।';
      }
    }
  }

  function handleToggleGlobalPriceHide(e) {
    const isChecked = e.target.checked;
    if (!state.site.settings) state.site.settings = {};
    state.site.settings.hideAllPrices = isChecked;
    saveEntity('site', state.site);
    updateGlobalPriceStatusUI(isChecked);
    renderProductsTable();
    showToast(isChecked ? 'সকল পণ্যের মূল্য হাইড করা হয়েছে!' : 'সকল পণ্যের মূল্য উন্মুক্ত করা হয়েছে!');
  }

  // ==========================================
  // Theme Controls
  // ==========================================
  function populateThemeControls() {
    let customTheme = null;
    try {
      const stored = localStorage.getItem('rmt_custom_theme');
      if (stored) customTheme = JSON.parse(stored);
    } catch(e){}

    const theme = customTheme || (state.site && state.site.theme) || { primaryColor: '#0f3460', secondaryColor: '#e67e22' };
    const p = theme.primaryColor || '#0f3460';
    const s = theme.secondaryColor || '#e67e22';

    const pPicker = document.getElementById('theme_primaryColor');
    const pHex = document.getElementById('theme_primaryColorHex');
    const sPicker = document.getElementById('theme_secondaryColor');
    const sHex = document.getElementById('theme_secondaryColorHex');

    if (pPicker) pPicker.value = p;
    if (pHex) pHex.value = p;
    if (sPicker) sPicker.value = s;
    if (sHex) sHex.value = s;
  }

  function setThemePreset(primary, secondary) {
    const pPicker = document.getElementById('theme_primaryColor');
    const pHex = document.getElementById('theme_primaryColorHex');
    const sPicker = document.getElementById('theme_secondaryColor');
    const sHex = document.getElementById('theme_secondaryColorHex');

    if (pPicker) pPicker.value = primary;
    if (pHex) pHex.value = primary;
    if (sPicker) sPicker.value = secondary;
    if (sHex) sHex.value = secondary;

    handleSaveTheme();
  }

  function handleSaveTheme() {
    const p = document.getElementById('theme_primaryColorHex')?.value.trim() || '#0f3460';
    const s = document.getElementById('theme_secondaryColorHex')?.value.trim() || '#e67e22';

    const themeObj = {
      primaryColor: p,
      secondaryColor: s,
      accentColor: '#25d366'
    };

    localStorage.setItem('rmt_custom_theme', JSON.stringify(themeObj));
    if (!state.site.theme) state.site.theme = {};
    state.site.theme.primaryColor = p;
    state.site.theme.secondaryColor = s;
    saveEntity('site', state.site);

    showToast('থিম ও কালার সফলভাবে সংরক্ষিত হয়েছে!');
  }

  // Render Hero Slides in Admin
  function renderHeroSlidesList() {
    const container = document.getElementById('adminHeroSlidesList');
    if (!container) return;

    const slides = (state.site && state.site.heroSlides) || [];
    if (slides.length === 0) {
      container.innerHTML = '<p style="color:#64748b;">কোনো হিরো ব্যানার পাওয়া যায়নি।</p>';
      return;
    }

    container.innerHTML = slides.map((s, idx) => `
      <div style="display:flex; align-items:center; gap:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px;">
        <span style="font-weight:700; color:var(--admin-primary); font-size:1.1rem; width:30px;">#${idx + 1}</span>
        <img src="../${s.image}" style="width:100px; height:60px; object-fit:cover; border-radius:6px; border:1px solid #cbd5e1;" onerror="this.src='../assets/images/brand/logo.png'">
        <div style="flex:1;">
          <strong style="color:#1e293b; font-size:0.95rem;">${s.title}</strong>
          <div style="font-size:0.8rem; color:#64748b; margin-top:2px;">${s.badge} | ${s.subtitle}</div>
          <div style="margin-top:4px;">
            ${s.video ? `<span style="background:#dcfce7; color:#15803d; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:4px;">🎬 সক্রিয় ব্যাকগ্রাউন্ড অ্যানিমেটেড ভিডিও (${s.video})</span>` : `<span style="background:#f1f5f9; color:#64748b; font-size:0.75rem; padding:2px 8px; border-radius:4px;">🖼️ হাই-রেজুলেশন WebP ইমেজ</span>`}
          </div>
        </div>
        <span style="font-size:0.82rem; color:#64748b;">স্লাইড ${idx + 1} / ${slides.length}</span>
      </div>
    `).join('');
  }

  // ==========================================
  // Product Management (CRUD)
  // ==========================================
  function renderProductsTable() {
    const tbody = document.getElementById('adminProductsTableBody');
    if (!tbody) return;

    const q = (document.getElementById('adminProductSearch')?.value || '').toLowerCase().trim();
    const cat = document.getElementById('adminProductCategoryFilter')?.value || 'all';

    let list = state.products;
    if (cat !== 'all') list = list.filter(p => p.category === cat);
    if (q) {
      list = list.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.nameBn && p.nameBn.includes(q)) ||
        (p.id && p.id.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:#64748b;">কোনো প্রোডাক্ট পাওয়া যায়নি।</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(p => {
      const isPriceHidden = p.hidePrice !== false;
      return `
        <tr>
          <td><img src="../${p.image}" class="table-img" onerror="this.src='../assets/images/brand/logo.png'"></td>
          <td><code>${p.id}</code></td>
          <td><strong>${p.name}</strong><br><small style="color:#64748b;">${p.nameBn || ''}</small></td>
          <td><span style="background:#e2e8f0; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${p.category}</span></td>
          <td><strong>${p.price || 'আলোচনা সাপেক্ষ'}</strong></td>
          <td>
            <button class="btn btn-sm ${isPriceHidden ? 'btn-secondary' : 'btn-success'}" onclick="RMT_ADMIN.toggleProductPriceHide('${p.id}')" title="ক্লিক করে হাইড/আনহাইড পরিবর্তন করুন">
              ${isPriceHidden ? '🔒 গোপন' : '👁️ উন্মুক্ত'}
            </button>
          </td>
          <td>
            <button class="btn btn-sm ${p.featured ? 'btn-success' : 'btn-secondary'}" onclick="RMT_ADMIN.toggleFeatured('${p.id}')">
              ${p.featured ? '★ ফিচার্ড' : '☆ সাধারণ'}
            </button>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-primary btn-sm" onclick="RMT_ADMIN.openEditProductModal('${p.id}')">✏️ এডিট</button>
              <button class="btn btn-danger btn-sm" onclick="RMT_ADMIN.deleteProduct('${p.id}')">🗑️ মুছুন</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function toggleProductPriceHide(pid) {
    const p = state.products.find(item => item.id === pid);
    if (p) {
      p.hidePrice = (p.hidePrice === false) ? true : false;
      saveEntity('products', state.products);
      renderProductsTable();
      showToast(p.hidePrice ? `'${p.name}' এর মূল্য হাইড করা হয়েছে!` : `'${p.name}' এর মূল্য উন্মুক্ত করা হয়েছে!`);
    }
  }

  function toggleFeatured(pid) {
    const p = state.products.find(item => item.id === pid);
    if (p) {
      p.featured = !p.featured;
      saveEntity('products', state.products);
      renderProductsTable();
    }
  }

  function deleteProduct(pid) {
    if (!confirm(`আপনি কি সত্যিই '${pid}' প্রোডাক্টটি মুছে ফেলতে চান?`)) return;
    state.products = state.products.filter(p => p.id !== pid);
    saveEntity('products', state.products);
    renderProductsTable();
    renderStats();
  }

  function openAddProductModal() {
    state.editingProductId = null;
    document.getElementById('productModalTitle').textContent = 'নতুন প্রোডাক্ট যোগ করুন';
    document.getElementById('productForm').reset();
    document.getElementById('pm_id').value = 'prod-' + Date.now().toString().slice(-4);
    document.getElementById('pm_price').value = 'আলোচনা সাপেক্ষ';
    document.getElementById('pm_hidePrice').checked = true;
    document.getElementById('productModal').classList.add('active');
  }

  function openEditProductModal(pid) {
    const p = state.products.find(item => item.id === pid);
    if (!p) return;
    state.editingProductId = pid;
    document.getElementById('productModalTitle').textContent = 'প্রোডাক্ট এডিট: ' + p.name;
    document.getElementById('pm_id').value = p.id;
    document.getElementById('pm_name').value = p.name;
    document.getElementById('pm_nameBn').value = p.nameBn || '';
    document.getElementById('pm_category').value = p.category;
    document.getElementById('pm_price').value = p.price || 'আলোচনা সাপেক্ষ';
    document.getElementById('pm_hidePrice').checked = (p.hidePrice !== false);
    document.getElementById('pm_image').value = p.image;
    document.getElementById('pm_specs').value = (p.specs || []).join(', ');
    document.getElementById('pm_descriptionBn').value = p.descriptionBn || '';
    document.getElementById('pm_featured').checked = !!p.featured;
    document.getElementById('productModal').classList.add('active');
  }

  function handleSaveProductModal() {
    const pid = document.getElementById('pm_id').value.trim() || 'prod-' + Date.now();
    const name = document.getElementById('pm_name').value.trim();
    const nameBn = document.getElementById('pm_nameBn').value.trim();
    if (!name || !nameBn) {
      alert('পণ্যের ইংরেজি ও বাংলা নাম আবশ্যক!');
      return;
    }

    const cat = document.getElementById('pm_category').value;
    const price = document.getElementById('pm_price').value.trim() || 'আলোচনা সাপেক্ষ';
    const hidePrice = document.getElementById('pm_hidePrice').checked;
    const img = document.getElementById('pm_image').value.trim() || 'assets/images/brand/logo.png';
    const specsStr = document.getElementById('pm_specs').value.trim();
    const specs = specsStr ? specsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const descBn = document.getElementById('pm_descriptionBn').value.trim();
    const featured = document.getElementById('pm_featured').checked;

    const prodObj = {
      id: pid,
      name,
      nameBn,
      category: cat,
      price,
      hidePrice,
      image: img,
      specs,
      description: name,
      descriptionBn: descBn,
      whatsappMsg: `Inquiry for ${name}`,
      featured
    };

    if (state.editingProductId) {
      const idx = state.products.findIndex(p => p.id === state.editingProductId);
      if (idx !== -1) {
        state.products[idx] = { ...state.products[idx], ...prodObj };
      }
    } else {
      state.products.unshift(prodObj);
    }

    saveEntity('products', state.products);
    closeModals();
    renderProductsTable();
    renderStats();
  }

  // ==========================================
  // Service Management (CRUD)
  // ==========================================
  function renderServicesTable() {
    const tbody = document.getElementById('adminServicesTableBody');
    if (!tbody) return;

    if (state.services.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#64748b;">কোনো সার্ভিস অন্তর্ভুক্ত নেই। "নতুন সার্ভিস যোগ করুন" এ ক্লিক করুন।</td></tr>`;
      return;
    }

    tbody.innerHTML = state.services.map((s) => {
      const featCount = (s.featuresBn || s.features || []).length;
      return `
        <tr>
          <td style="font-size:1.6rem; text-align:center;">${s.icon || '⚙️'}</td>
          <td><strong>${s.title}</strong></td>
          <td>${s.titleBn || '-'}</td>
          <td>
            <span style="background:#e0f2fe; color:#0369a1; padding:3px 8px; border-radius:4px; font-size:0.8rem; font-weight:600;">
              ${featCount} টি ফিচার
            </span>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-primary btn-sm" onclick="RMT_ADMIN.openEditServiceModal('${s.id}')">✏️ এডিট</button>
              <button class="btn btn-danger btn-sm" onclick="RMT_ADMIN.deleteService('${s.id}')">🗑️ মুছুন</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function openAddServiceModal() {
    state.editingServiceId = null;
    document.getElementById('serviceModalTitle').textContent = 'নতুন সার্ভিস যোগ করুন';
    document.getElementById('serviceForm').reset();
    document.getElementById('sm_id').value = 'srv-' + Date.now().toString().slice(-4);
    document.getElementById('sm_icon').value = '⚙️';
    document.getElementById('serviceModal').classList.add('active');
  }

  function openEditServiceModal(sid) {
    const s = state.services.find(item => item.id === sid);
    if (!s) return;
    state.editingServiceId = sid;
    document.getElementById('serviceModalTitle').textContent = 'সার্ভিস এডিট: ' + (s.titleBn || s.title);
    document.getElementById('sm_id').value = s.id;
    document.getElementById('sm_icon').value = s.icon || '⚙️';
    document.getElementById('sm_title').value = s.title || '';
    document.getElementById('sm_titleBn').value = s.titleBn || '';
    document.getElementById('sm_summary').value = s.summary || '';
    document.getElementById('sm_summaryBn').value = s.summaryBn || '';
    document.getElementById('sm_whatsappMsg').value = s.whatsappMsg || '';

    const fb = Array.isArray(s.featuresBn) ? s.featuresBn.join('\n') : '';
    const fe = Array.isArray(s.features) ? s.features.join('\n') : '';
    document.getElementById('sm_featuresBn').value = fb;
    document.getElementById('sm_features').value = fe;

    document.getElementById('serviceModal').classList.add('active');
  }

  function handleSaveServiceModal() {
    const sid = document.getElementById('sm_id').value.trim() || 'srv-' + Date.now();
    const title = document.getElementById('sm_title').value.trim();
    const titleBn = document.getElementById('sm_titleBn').value.trim();

    if (!title || !titleBn) {
      alert('সার্ভিসের ইংরেজি ও বাংলা শিরোনাম উভয়ই আবশ্যক!');
      return;
    }

    const icon = document.getElementById('sm_icon').value.trim() || '⚙️';
    const summary = document.getElementById('sm_summary').value.trim();
    const summaryBn = document.getElementById('sm_summaryBn').value.trim();
    const wa = document.getElementById('sm_whatsappMsg').value.trim() || `Inquiry for ${title}`;

    const fbRaw = document.getElementById('sm_featuresBn').value;
    const feRaw = document.getElementById('sm_features').value;

    const featuresBn = fbRaw.split('\n').map(x => x.trim()).filter(Boolean);
    const features = feRaw.split('\n').map(x => x.trim()).filter(Boolean);

    const serviceObj = {
      id: sid,
      icon,
      title,
      titleBn,
      summary,
      summaryBn,
      features,
      featuresBn,
      whatsappMsg: wa
    };

    if (state.editingServiceId) {
      const idx = state.services.findIndex(s => s.id === state.editingServiceId);
      if (idx !== -1) {
        state.services[idx] = { ...state.services[idx], ...serviceObj };
      }
    } else {
      state.services.push(serviceObj);
    }

    saveEntity('services', state.services);
    closeModals();
    renderServicesTable();
    renderStats();
  }

  function deleteService(sid) {
    const s = state.services.find(item => item.id === sid);
    const name = s ? (s.titleBn || s.title) : sid;
    if (!confirm(`আপনি কি সত্যিই '${name}' সার্ভিসটি মুছে ফেলতে চান?`)) return;

    state.services = state.services.filter(item => item.id !== sid);
    saveEntity('services', state.services);
    renderServicesTable();
    renderStats();
  }

  // ==========================================
  // Brochures / Catalog Management (CRUD)
  // ==========================================
  function renderBrochuresTable() {
    const tbody = document.getElementById('adminBrochuresTableBody');
    if (!tbody) return;

    if (state.brochures.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:30px; color:#64748b;">কোনো ক্যাটালগ বা ব্রোশার অন্তর্ভুক্ত নেই। "নতুন ক্যাটালগ যোগ করুন" এ ক্লিক করুন।</td></tr>`;
      return;
    }

    tbody.innerHTML = state.brochures.map((b) => `
      <tr>
        <td>
          <strong>${b.title}</strong><br>
          <small style="color:#64748b;">${b.titleBn || ''}</small>
        </td>
        <td>
          <span style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">
            ${b.categoryBn || b.category || 'General'}
          </span>
        </td>
        <td><strong>${b.fileSize || 'N/A'}</strong></td>
        <td><code style="font-size:0.8rem;">${b.path}</code></td>
        <td>
          <div style="display:flex; gap:6px;">
            <a href="../${b.path}" download="${b.filename || 'catalog.pdf'}" class="btn btn-secondary btn-sm" target="_blank">📥 প্রিভিউ</a>
            <button class="btn btn-primary btn-sm" onclick="RMT_ADMIN.openEditBrochureModal('${b.id}')">✏️ এডিট</button>
            <button class="btn btn-danger btn-sm" onclick="RMT_ADMIN.deleteBrochure('${b.id}')">🗑️ মুছুন</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function openAddBrochureModal() {
    state.editingBrochureId = null;
    document.getElementById('brochureModalTitle').textContent = 'নতুন ক্যাটালগ যোগ করুন';
    document.getElementById('brochureForm').reset();
    document.getElementById('bm_id').value = 'doc-' + Date.now().toString().slice(-4);
    document.getElementById('brochureModal').classList.add('active');
  }

  function openEditBrochureModal(bid) {
    const b = state.brochures.find(item => item.id === bid);
    if (!b) return;
    state.editingBrochureId = bid;
    document.getElementById('brochureModalTitle').textContent = 'ক্যাটালগ এডিট: ' + (b.titleBn || b.title);
    document.getElementById('bm_id').value = b.id;
    document.getElementById('bm_title').value = b.title || '';
    document.getElementById('bm_titleBn').value = b.titleBn || '';
    document.getElementById('bm_category').value = b.category || '';
    document.getElementById('bm_categoryBn').value = b.categoryBn || '';
    document.getElementById('bm_path').value = b.path || '';
    document.getElementById('bm_filename').value = b.filename || '';
    document.getElementById('bm_fileSize').value = b.fileSize || '';

    document.getElementById('brochureModal').classList.add('active');
  }

  function handleSaveBrochureModal() {
    const bid = document.getElementById('bm_id').value.trim() || 'doc-' + Date.now();
    const title = document.getElementById('bm_title').value.trim();
    const titleBn = document.getElementById('bm_titleBn').value.trim();

    if (!title || !titleBn) {
      alert('ক্যাটালগের ইংরেজি ও বাংলা শিরোনাম উভয়ই আবশ্যক!');
      return;
    }

    const path = document.getElementById('bm_path').value.trim();
    if (!path) {
      alert('পিডিএফ ফাইলের পাথ আবশ্যক! (উদাঃ assets/documents/filename.pdf)');
      return;
    }

    const category = document.getElementById('bm_category').value.trim() || 'General';
    const categoryBn = document.getElementById('bm_categoryBn').value.trim() || category;
    let filename = document.getElementById('bm_filename').value.trim();
    if (!filename) {
      filename = path.split('/').pop() || 'catalog.pdf';
    }
    const fileSize = document.getElementById('bm_fileSize').value.trim() || '1.0 MB';

    const brochureObj = {
      id: bid,
      title,
      titleBn,
      filename,
      path,
      fileSize,
      category,
      categoryBn
    };

    if (state.editingBrochureId) {
      const idx = state.brochures.findIndex(b => b.id === state.editingBrochureId);
      if (idx !== -1) {
        state.brochures[idx] = { ...state.brochures[idx], ...brochureObj };
      }
    } else {
      state.brochures.push(brochureObj);
    }

    saveEntity('brochures', state.brochures);
    closeModals();
    renderBrochuresTable();
    renderStats();
  }

  function deleteBrochure(bid) {
    const b = state.brochures.find(item => item.id === bid);
    const name = b ? (b.titleBn || b.title) : bid;
    if (!confirm(`আপনি কি সত্যিই '${name}' ক্যাটালগটি মুছে ফেলতে চান?`)) return;

    state.brochures = state.brochures.filter(item => item.id !== bid);
    saveEntity('brochures', state.brochures);
    renderBrochuresTable();
    renderStats();
  }

  // ==========================================
  // Team Management (CRUD)
  // ==========================================
  function renderTeamTable() {
    const tbody = document.getElementById('adminTeamTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.team.map(m => `
      <tr>
        <td><img src="../${m.image}" class="table-img" style="border-radius:50%;" onerror="this.src='../assets/images/brand/logo.png'"></td>
        <td><strong>${m.name}</strong><br><small style="color:var(--admin-secondary);">${m.nameBn || ''}</small></td>
        <td>${m.roleBn || m.role}</td>
        <td>${m.phone}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="RMT_ADMIN.deleteTeamMember('${m.id}')">মুছুন</button>
        </td>
      </tr>
    `).join('');
  }

  function deleteTeamMember(tid) {
    if (!confirm('আপনি কি এই টিম মেম্বারকে মুছে ফেলতে চান?')) return;
    state.team = state.team.filter(t => t.id !== tid);
    saveEntity('team', state.team);
    renderTeamTable();
    renderStats();
  }

  function openAddTeamModal() {
    document.getElementById('teamForm').reset();
    document.getElementById('tm_id').value = 'team-' + Date.now().toString().slice(-4);
    document.getElementById('teamModal').classList.add('active');
  }

  function handleSaveTeamModal() {
    const id = document.getElementById('tm_id').value || 'team-' + Date.now();
    const name = document.getElementById('tm_name').value.trim();
    const nameBn = document.getElementById('tm_nameBn').value.trim();
    const role = document.getElementById('tm_role').value.trim();
    const phone = document.getElementById('tm_phone').value.trim() || '01348249343';
    const image = document.getElementById('tm_image').value.trim() || 'assets/images/brand/logo.png';

    if (!name || !nameBn) {
      alert('নাম পূরণ করা আবশ্যক!');
      return;
    }

    state.team.push({ id, name, nameBn, role, roleBn: role, phone, image });
    saveEntity('team', state.team);
    closeModals();
    renderTeamTable();
    renderStats();
  }

  // ==========================================
  // Single Admin Security Management
  // ==========================================
  function populateSecurityForm() {
    const admin = state.admins[0] || { name: "Rezaul Karim", username: "admin" };
    const nameDisp = document.getElementById('secAdminNameDisplay');
    const nameInput = document.getElementById('sec_adminName');

    if (nameDisp) nameDisp.textContent = admin.name || 'Rezaul Karim';
    if (nameInput) nameInput.value = admin.name || 'Rezaul Karim';
  }

  function handleSaveSecurityForm(e) {
    e.preventDefault();
    const currentPass = document.getElementById('sec_currentPassword').value;
    const newPass = document.getElementById('sec_newPassword').value;
    const confPass = document.getElementById('sec_confirmPassword').value;
    const name = document.getElementById('sec_adminName').value.trim();
    const msgBox = document.getElementById('secPasswordMessage');

    const admin = state.admins[0] || { username: "admin", password: "Rezaul9270" };

    if (currentPass !== admin.password) {
      msgBox.style.display = 'block';
      msgBox.style.background = '#fef2f2';
      msgBox.style.color = '#dc2626';
      msgBox.style.border = '1px solid #fecaca';
      msgBox.textContent = 'বর্তমান পাসওয়ার্ড সঠিক নয়! দয়া করে সঠিক পাসওয়ার্ড দিন।';
      return;
    }

    if (newPass.length < 4) {
      msgBox.style.display = 'block';
      msgBox.style.background = '#fef2f2';
      msgBox.style.color = '#dc2626';
      msgBox.style.border = '1px solid #fecaca';
      msgBox.textContent = 'নতুন পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে!';
      return;
    }

    if (newPass !== confPass) {
      msgBox.style.display = 'block';
      msgBox.style.background = '#fef2f2';
      msgBox.style.color = '#dc2626';
      msgBox.style.border = '1px solid #fecaca';
      msgBox.textContent = 'নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!';
      return;
    }

    // Update Master Admin
    admin.name = name || 'Rezaul Karim';
    admin.password = newPass;
    state.admins = [admin];

    localStorage.setItem('rmt_custom_admins', JSON.stringify(state.admins));

    // Update active session
    if (state.session) {
      state.session.name = admin.name;
      localStorage.setItem('rmt_admin_session', JSON.stringify(state.session));
      const nameElem = document.getElementById('displayName');
      if (nameElem) nameElem.textContent = admin.name;
    }

    msgBox.style.display = 'block';
    msgBox.style.background = '#ecfdf5';
    msgBox.style.color = '#059669';
    msgBox.style.border = '1px solid #a7f3d0';
    msgBox.textContent = 'পাসওয়ার্ড ও প্রোফাইল সফলভাবে আপডেট করা হয়েছে!';

    document.getElementById('sec_currentPassword').value = '';
    document.getElementById('sec_newPassword').value = '';
    document.getElementById('sec_confirmPassword').value = '';

    populateSecurityForm();
    showToast('পাসওয়ার্ড সফলভাবে সংরক্ষিত হয়েছে!');
  }

  // ==========================================
  // Cache Clear & System
  // ==========================================
  async function clearBrowserCache() {
    try {
      sessionStorage.clear();
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      alert('ব্রাউজার ক্যাশে সফলভাবে ক্লিয়ার হয়েছে! পেজটি নতুন করে রিলোড হচ্ছে...');
      window.location.reload(true);
    } catch(err) {
      window.location.reload(true);
    }
  }

  // Export Data Bundle
  function exportAllData() {
    const bundle = {
      site: state.site,
      products: state.products,
      services: state.services,
      team: state.team,
      brochures: state.brochures,
      admins: state.admins,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `site_data_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('সম্পূর্ণ ডাটা ব্যাকআপ ডাউনলোড সম্পন্ন!');
  }

  // Import Data Bundle
  function importDataBundle(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const bundle = JSON.parse(e.target.result);
        if (bundle.site) saveEntity('site', bundle.site);
        if (bundle.products) saveEntity('products', bundle.products);
        if (bundle.services) saveEntity('services', bundle.services);
        if (bundle.team) saveEntity('team', bundle.team);
        if (bundle.brochures) saveEntity('brochures', bundle.brochures);
        if (bundle.admins) localStorage.setItem('rmt_custom_admins', JSON.stringify(bundle.admins));

        alert('ডাটা সফলভাবে রিস্টোর হয়েছে! পেজ রিফ্রেশ হচ্ছে...');
        window.location.reload();
      } catch (err) {
        alert('অকার্যকর JSON ফাইল! দয়া করে সঠিক ব্যাকআপ ফাইল নির্বাচন করুন।');
      }
    };
    reader.readAsText(file);
  }

  // Reset to Defaults
  function resetToDefaults() {
    if (!confirm('সতর্কতা: এটি এডমিন প্যানেলে করা সমস্ত পরিবর্তন মুছে ফেলে মূল ডিফল্ট ডাটা রিস্টোর করবে। আপনি কি নিশ্চিত?')) return;
    localStorage.removeItem('rmt_custom_site');
    localStorage.removeItem('rmt_custom_products');
    localStorage.removeItem('rmt_custom_services');
    localStorage.removeItem('rmt_custom_team');
    localStorage.removeItem('rmt_custom_brochures');
    localStorage.removeItem('rmt_custom_admins');
    localStorage.removeItem('rmt_custom_theme');
    alert('ফ্যাক্টরি রিসেট সম্পন্ন হয়েছে! পেজ রিলোড হচ্ছে...');
    window.location.reload();
  }

  // ==========================================
  // Navigation & Modals Setup
  // ==========================================
  function setupNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetId = item.getAttribute('data-section');
        switchTab(targetId);
      });
    });

    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('rmt_admin_session');
        window.location.href = 'login.html';
      });
    }

    // Modal background close
    document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModals();
      });
    });

    // ESC key closes modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModals();
    });
  }

  function switchTab(sectionId) {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => {
      el.classList.toggle('active', el.getAttribute('data-section') === sectionId);
    });
    document.querySelectorAll('.content-section').forEach(sec => {
      sec.classList.toggle('active', sec.id === sectionId);
    });
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('active');
  }

  function closeModals() {
    document.querySelectorAll('.admin-modal-overlay').forEach(m => m.classList.remove('active'));
  }

  function showToast(msg) {
    const t = document.getElementById('toastNotice');
    if (t) {
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3000);
    }
  }

  function setupForms() {
    // Site settings save
    const saveSiteBtn = document.getElementById('saveSiteSettingsBtn');
    if (saveSiteBtn) saveSiteBtn.addEventListener('click', handleSaveSiteSettings);

    // Global Price Toggle
    const globalHidePricesChk = document.getElementById('globalHidePricesCheckbox');
    if (globalHidePricesChk) globalHidePricesChk.addEventListener('change', handleToggleGlobalPriceHide);

    // Theme pickers sync
    const pPicker = document.getElementById('theme_primaryColor');
    const pHex = document.getElementById('theme_primaryColorHex');
    if (pPicker && pHex) {
      pPicker.addEventListener('input', (e) => pHex.value = e.target.value);
      pHex.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) pPicker.value = e.target.value;
      });
    }

    const sPicker = document.getElementById('theme_secondaryColor');
    const sHex = document.getElementById('theme_secondaryColorHex');
    if (sPicker && sHex) {
      sPicker.addEventListener('input', (e) => sHex.value = e.target.value);
      sHex.addEventListener('input', (e) => {
        if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) sPicker.value = e.target.value;
      });
    }

    const saveThemeBtn = document.getElementById('saveThemeBtn');
    if (saveThemeBtn) saveThemeBtn.addEventListener('click', handleSaveTheme);

    // Cache Clear Buttons
    const clearCacheBtn = document.getElementById('clearCacheBtn');
    if (clearCacheBtn) clearCacheBtn.addEventListener('click', clearBrowserCache);

    const topbarClearCacheBtn = document.getElementById('topbarClearCacheBtn');
    if (topbarClearCacheBtn) topbarClearCacheBtn.addEventListener('click', clearBrowserCache);

    // Products
    const addProdBtn = document.getElementById('openAddProductBtn');
    if (addProdBtn) addProdBtn.addEventListener('click', openAddProductModal);

    const saveProdModalBtn = document.getElementById('saveProductModalBtn');
    if (saveProdModalBtn) saveProdModalBtn.addEventListener('click', handleSaveProductModal);

    const searchInput = document.getElementById('adminProductSearch');
    if (searchInput) searchInput.addEventListener('input', renderProductsTable);

    const catFilter = document.getElementById('adminProductCategoryFilter');
    if (catFilter) catFilter.addEventListener('change', renderProductsTable);

    // Services
    const addServiceBtn = document.getElementById('openAddServiceBtn');
    if (addServiceBtn) addServiceBtn.addEventListener('click', openAddServiceModal);

    const saveServiceModalBtn = document.getElementById('saveServiceModalBtn');
    if (saveServiceModalBtn) saveServiceModalBtn.addEventListener('click', handleSaveServiceModal);

    // Brochures / Catalogs
    const addBrochureBtn = document.getElementById('openAddBrochureBtn');
    if (addBrochureBtn) addBrochureBtn.addEventListener('click', openAddBrochureModal);

    const saveBrochureModalBtn = document.getElementById('saveBrochureModalBtn');
    if (saveBrochureModalBtn) saveBrochureModalBtn.addEventListener('click', handleSaveBrochureModal);

    // Team
    const addTeamBtn = document.getElementById('openAddTeamBtn');
    if (addTeamBtn) addTeamBtn.addEventListener('click', openAddTeamModal);

    const saveTeamBtn = document.getElementById('saveTeamModalBtn');
    if (saveTeamBtn) saveTeamBtn.addEventListener('click', handleSaveTeamModal);

    // Security Form
    const secForm = document.getElementById('adminSecurityForm');
    if (secForm) secForm.addEventListener('submit', handleSaveSecurityForm);

    // Backup & Export
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) exportBtn.addEventListener('click', exportAllData);

    const importBtn = document.getElementById('importDataBtn');
    const importInput = document.getElementById('importJsonFileInput');
    if (importBtn && importInput) {
      importBtn.addEventListener('click', () => {
        if (!importInput.files || importInput.files.length === 0) {
          alert('দয়া করে প্রথমে একটি ব্যাকআপ .json ফাইল নির্বাচন করুন!');
          return;
        }
        importDataBundle(importInput.files[0]);
      });
    }

    const resetBtn = document.getElementById('resetDefaultsBtn');
    if (resetBtn) resetBtn.addEventListener('click', resetToDefaults);
  }

  return {
    init,
    switchTab,
    setThemePreset,
    // Products
    openAddProductModal,
    openEditProductModal,
    deleteProduct,
    toggleFeatured,
    toggleProductPriceHide,
    // Services
    openAddServiceModal,
    openEditServiceModal,
    deleteService,
    // Brochures / Catalogs
    openAddBrochureModal,
    openEditBrochureModal,
    deleteBrochure,
    // Team
    openAddTeamModal,
    deleteTeamMember,
    // Utility
    exportAllData,
    closeModals
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  RMT_ADMIN.init();
});
