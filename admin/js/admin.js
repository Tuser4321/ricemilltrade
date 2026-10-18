/**
 * Rice Mill Trade - Official Admin Control Logic
 * Complete CRUD operations, real-time persistence, user management, and backup.
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
    if (dElem) dElem.textContent = new Date().toLocaleDateString('bn-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    setupNavigation();
    setupForms();
    renderAll();
  }

  // Render All Sections
  function renderAll() {
    renderStats();
    populateSiteForm();
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

  // Populate Site Settings Form
  function populateSiteForm() {
    const c = (state.site && state.site.company) || {};
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
    setVal('cfg_mainMap', c.mainOfficeMapEmbed || '');
    setVal('cfg_manikganjMap', c.manikganjOfficeMapEmbed || '');
  }

  // Save Site Settings
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
      manikganjOfficeAddress: getVal('cfg_manikganjAddress'),
      mainOfficeMapEmbed: getVal('cfg_mainMap'),
      manikganjOfficeMapEmbed: getVal('cfg_manikganjMap')
    };

    saveEntity('site', state.site);
  }

  // Render Products Table
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
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#64748b;">কোনো প্রোডাক্ট পাওয়া যায়নি।</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(p => `
      <tr>
        <td><img src="../${p.image}" class="table-img" onerror="this.src='../assets/images/brand/logo.png'"></td>
        <td><code>${p.id}</code></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.nameBn || '-'}</td>
        <td><span style="background:#e2e8f0; padding:2px 8px; border-radius:4px; font-size:0.75rem;">${p.category}</span></td>
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
    `).join('');
  }

  // Product Actions
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
    document.getElementById('pm_image').value = p.image;
    document.getElementById('pm_specs').value = (p.specs || []).join(', ');
    document.getElementById('pm_description').value = p.description || '';
    document.getElementById('pm_descriptionBn').value = p.descriptionBn || '';
    document.getElementById('pm_whatsappMsg').value = p.whatsappMsg || '';
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
    const img = document.getElementById('pm_image').value.trim() || 'assets/images/brand/logo.png';
    const specsStr = document.getElementById('pm_specs').value.trim();
    const specs = specsStr ? specsStr.split(',').map(s => s.trim()).filter(Boolean) : [];
    const desc = document.getElementById('pm_description').value.trim();
    const descBn = document.getElementById('pm_descriptionBn').value.trim();
    const wa = document.getElementById('pm_whatsappMsg').value.trim() || `Inquiry for ${name}`;
    const featured = document.getElementById('pm_featured').checked;

    const prodObj = {
      id: pid,
      name,
      nameBn,
      category: cat,
      image: img,
      specs,
      description: desc,
      descriptionBn: descBn,
      whatsappMsg: wa,
      featured
    };

    if (state.editingProductId) {
      const idx = state.products.findIndex(p => p.id === state.editingProductId);
      if (idx !== -1) state.products[idx] = prodObj;
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
        <td>${(s.features || []).length} টি ফিচার</td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="alert('সার্ভিসের শিরোনাম ও ফিচারসমূহ সেভ বাটনে চাপলে সরাসরি সংরক্ষিত হবে।')">তথ্য দেখুন</button>
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
        <td>${m.email || 'N/A'}</td>
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
    openAddProductModal,
    openEditProductModal,
    deleteProduct,
    toggleFeatured,
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
