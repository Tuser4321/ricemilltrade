/**
 * Rice Mill Trade - Official Admin Control Logic
 * Complete CRUD operations, real-time persistence, user management,
 * global & individual price hiding, theme customizer, social media links, and cache clearing.
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
      const nameElem = document.getElementById('displayName');
      const roleElem = document.getElementById('displayRole');
      if (nameElem) nameElem.textContent = state.session.name || state.session.username;
      if (roleElem) roleElem.textContent = state.session.role || 'Admin';
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
    // Ensure nested objects exist
    if (!state.site) state.site = {};
    if (!state.site.settings) state.site.settings = { hideAllPrices: true };
    if (!state.site.company) state.site.company = {};
    if (!state.site.social) state.site.social = {};
    if (!state.site.theme) state.site.theme = { primaryColor: '#0f3460', secondaryColor: '#e67e22' };

    // 2. Products
    state.products = await getEntityData('products', '../data/products.json');
    // 3. Services
    state.services = await getEntityData('services', '../data/services.json');
    // 4. Team
    state.team = await getEntityData('team', '../data/team.json');
    // 5. Brochures
    state.brochures = await getEntityData('brochures', '../data/brochures.json');
    // 6. Admins
    const customAdmins = localStorage.getItem('rmt_custom_admins');
    if (customAdmins) {
      try { state.admins = JSON.parse(customAdmins); } catch(e){}
    } else if (state.site && state.site.admins) {
      state.admins = state.site.admins;
    } else {
      state.admins = [
        { username: "admin", password: "Rezaul9270", name: "Rezaul Karim", role: "superadmin" },
        { username: "amirul", password: "Amirul2026", name: "MD. Amirul Islam", role: "admin" },
        { username: "helal", password: "Helal2026", name: "Md. Helal Miah", role: "manager" }
      ];
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

    // Set Current Date
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
    renderTeamTable();
    renderBrochuresTable();
    renderUsersTable();
  }

  // Render Stats
  function renderStats() {
    const pCount = document.getElementById('statProducts');
    const sCount = document.getElementById('statServices');
    const tCount = document.getElementById('statTeam');
    const bCount = document.getElementById('statBrochures');

    if (pCount) pCount.textContent = state.products.length;
    if (sCount) sCount.textContent = state.services.length;
    if (tCount) tCount.textContent = state.team.length;
    if (bCount) bCount.textContent = state.brochures.length;
  }

  // Populate Site Settings & Social Media Form
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

  // Save Site Settings & Social Media
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

  // Price Controls
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
        txt.textContent = 'সকল পণ্যের মূল্য গোপন (হাইড) রয়েছে — গ্রাহকরা সরাসরি হোয়াটসঅ্যাপে কোটেশন জানতে পারবেন।';
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

  // Theme Controls
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

  // Render Products Table (8 columns)
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

  // Toggle Single Product Price Hide
  function toggleProductPriceHide(pid) {
    const p = state.products.find(item => item.id === pid);
    if (p) {
      p.hidePrice = (p.hidePrice === false) ? true : false;
      saveEntity('products', state.products);
      renderProductsTable();
      showToast(p.hidePrice ? `'${p.name}' এর মূল্য হাইড করা হয়েছে!` : `'${p.name}' এর মূল্য উন্মুক্ত করা হয়েছে!`);
    }
  }

  // Toggle Featured
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
    document.getElementById('pm_hidePrice').checked = true; // Default hide price is true
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
    document.getElementById('pm_hidePrice').checked = (p.hidePrice !== false); // Default hide price
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

  // Render Services Table
  function renderServicesTable() {
    const tbody = document.getElementById('adminServicesTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.services.map((s, idx) => `
      <tr>
        <td style="font-size:1.5rem;">${s.icon || '⚙️'}</td>
        <td><strong>${s.title}</strong></td>
        <td>${s.titleBn}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="alert('সার্ভিস: ${s.titleBn}\\nফিচারসমূহ: ${(s.features || []).join(', ')}')">ফিচারসমূহ দেখুন</button>
        </td>
      </tr>
    `).join('');
  }

  // Render Team Table
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
    const roleBn = document.getElementById('tm_roleBn').value.trim();
    const phone = document.getElementById('tm_phone').value.trim() || '01348249343';
    const image = document.getElementById('tm_image').value.trim() || 'assets/images/brand/logo.png';
    const bioBn = document.getElementById('tm_bioBn').value.trim();

    if (!name || !nameBn) {
      alert('নাম পূরণ করা আবশ্যক!');
      return;
    }

    state.team.push({ id, name, nameBn, role, roleBn, phone, image, bioBn, bio: bioBn });
    saveEntity('team', state.team);
    closeModals();
    renderTeamTable();
    renderStats();
  }

  // Render Brochures Table
  function renderBrochuresTable() {
    const tbody = document.getElementById('adminBrochuresTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.brochures.map((b, idx) => `
      <tr>
        <td><strong>${b.title}</strong><br><small style="color:#64748b;">${b.titleBn || ''}</small></td>
        <td><span style="background:#e0f2fe; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${b.category}</span></td>
        <td>${b.fileSize}</td>
        <td><code>${b.path}</code></td>
        <td>
          <a href="../${b.path}" download="${b.filename}" class="btn btn-secondary btn-sm">ডাউনলোড টেস্ট</a>
        </td>
      </tr>
    `).join('');
  }

  // Render Users & Admins
  function renderUsersTable() {
    const tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;

    tbody.innerHTML = state.admins.map((u, idx) => `
      <tr>
        <td><code>${u.username}</code></td>
        <td><strong>${u.name || u.username}</strong></td>
        <td><span class="user-role-badge">${u.role || 'admin'}</span></td>
        <td><code>••••••••</code> (${u.password})</td>
        <td>
          ${u.username === 'admin' ? '<span style="color:#64748b; font-size:0.8rem;">ডিফল্ট সুপারএডমিন</span>' : `
            <button class="btn btn-danger btn-sm" onclick="RMT_ADMIN.deleteUser('${u.username}')">রিমুভ</button>
          `}
        </td>
      </tr>
    `).join('');
  }

  function openAddUserModal() {
    document.getElementById('userForm').reset();
    document.getElementById('userModal').classList.add('active');
  }

  function handleSaveUserModal() {
    const username = document.getElementById('um_username').value.trim().toLowerCase();
    const name = document.getElementById('um_name').value.trim();
    const password = document.getElementById('um_password').value;
    const role = document.getElementById('um_role').value;

    if (!username || !password) {
      alert('ইউজারনেম ও পাসওয়ার্ড পূরণ করুন!');
      return;
    }

    if (state.admins.some(a => a.username.toLowerCase() === username)) {
      alert('এই ইউজারনেমটি ইতিমধ্যে বিদ্যমান! অন্য ইউজারনেম দিন।');
      return;
    }

    state.admins.push({ username, name: name || username, password, role });
    localStorage.setItem('rmt_custom_admins', JSON.stringify(state.admins));
    showToast('নতুন এডমিন সফলভাবে যোগ করা হয়েছে!');
    closeModals();
    renderUsersTable();
  }

  function deleteUser(username) {
    if (!confirm(`আপনি কি '${username}' এডমিনকে মুছে দিতে চান?`)) return;
    state.admins = state.admins.filter(a => a.username !== username);
    localStorage.setItem('rmt_custom_admins', JSON.stringify(state.admins));
    showToast('এডমিন ইউজার মুছে ফেলা হয়েছে!');
    renderUsersTable();
  }

  // Clear Browser Cache
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
    showToast('ব্যাকআপ JSON ফাইল ডাউনলোড সম্পন্ন!');
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

  // Navigation & Modals
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

    // Team
    const addTeamBtn = document.getElementById('openAddTeamBtn');
    if (addTeamBtn) addTeamBtn.addEventListener('click', openAddTeamModal);

    const saveTeamBtn = document.getElementById('saveTeamModalBtn');
    if (saveTeamBtn) saveTeamBtn.addEventListener('click', handleSaveTeamModal);

    // Users
    const addUserBtn = document.getElementById('openAddUserBtn');
    if (addUserBtn) addUserBtn.addEventListener('click', openAddUserModal);

    const saveUserBtn = document.getElementById('saveUserModalBtn');
    if (saveUserBtn) saveUserBtn.addEventListener('click', handleSaveUserModal);

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
    openAddProductModal,
    openEditProductModal,
    deleteProduct,
    toggleFeatured,
    toggleProductPriceHide,
    openAddTeamModal,
    deleteTeamMember,
    openAddUserModal,
    deleteUser,
    exportAllData,
    closeModals
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  RMT_ADMIN.init();
});
