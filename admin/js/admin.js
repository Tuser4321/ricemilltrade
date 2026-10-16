// =========================================
// Rice Mill Trade - Admin Panel JavaScript
// =========================================

const API_BASE = '../data';
let site = { company: {}, social: {}, features: {}, admins: [] };
let products = [];
let team = [];
let currentAdmin = null;

// Auth
const auth = {
  check: () => {
    const stored = localStorage.getItem('rmt_admin');
    if (!stored) { window.location.href = 'login.html'; return null; }
    currentAdmin = JSON.parse(stored);
    document.getElementById('current-user').textContent = currentAdmin.username;
    return currentAdmin;
  },
  logout: () => {
    localStorage.removeItem('rmt_admin');
    window.location.href = 'login.html';
  },
  isSuperAdmin: () => currentAdmin && currentAdmin.role === 'superadmin'
};

// Load data
async function loadData() {
  try {
    const [sRes, pRes, tRes] = await Promise.all([
      fetch(`${API_BASE}/site.json`),
      fetch(`${API_BASE}/products.json`),
      fetch(`${API_BASE}/team.json`)
    ]);
    site = await sRes.json();
    products = (await pRes.json()).products || [];
    team = (await tRes.json()).team || [];
    renderDashboard();
  } catch (e) { console.error('Load error:', e); }
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    const section = link.getAttribute('data-section');
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('hidden'));
    document.getElementById('section-' + section).classList.remove('hidden');
    document.getElementById('page-title').textContent = link.textContent.trim();
    if (section === 'dashboard') renderDashboard();
    if (section === 'products') renderProductsTable();
    if (section === 'team') renderTeamTable();
    if (section === 'admins') renderAdminsTable();
// -------- Site Control --------
function loadSiteForm() {
  const c = site.company || {};
  const s = site.social || {};
  document.getElementById('site-name').value = c.name || '';
  document.getElementById('site-tagline').value = c.tagline || '';
  document.getElementById('site-phone').value = c.phone || '';
  document.getElementById('site-email').value = c.email || '';
  document.getElementById('site-mainaddr').value = c.mainAddress || '';
  document.getElementById('site-oldaddr').value = c.oldAddress || '';
  document.getElementById('social-facebook').value = s.facebook || '';
  document.getElementById('social-whatsapp').value = s.whatsapp || '';
  document.getElementById('social-linkedin').value = s.linkedin || '';
  document.getElementById('social-youtube').value = s.youtube || '';
}

window.siteConfig = {
  save: () => {
    site.company = {
      name: document.getElementById('site-name').value,
      tagline: document.getElementById('site-tagline').value,
      taglineBn: site.company.taglineBn || 'আপনার ব্যবসায় আপনার বিশ্বস্ত সহযোগী',
      phone: document.getElementById('site-phone').value,
      whatsapp: site.whatsapp || '8801348249343',
      email: document.getElementById('site-email').value,
      mainAddress: document.getElementById('site-mainaddr').value,
      mainAddressBn: site.company.mainAddressBn || '',
      oldAddress: document.getElementById('site-oldaddr').value,
      oldAddressBn: site.company.oldAddressBn || '',
      mapEmbed: site.company.mapEmbed || ''
    };
    saveJSON('site.json', site).then(() => alert('Site settings saved!'));
  },
  saveSocial: () => {
    site.social = {
      facebook: document.getElementById('social-facebook').value,
      whatsapp: document.getElementById('social-whatsapp').value,
      linkedin: document.getElementById('social-linkedin').value,
      youtube: document.getElementById('social-youtube').value
    };
    saveJSON('site.json', site).then(() => alert('Social links saved!'));
  }
};
    if (section === 'site') loadSiteForm();
// -------- Features --------
window.features = {
  toggle: (key) => {
    const btn = document.getElementById('toggle-' + key);
    btn.classList.toggle('active');
  },
  save: () => {
    site.features = {
      whatsappInquiry: document.getElementById('toggle-whatsapp').classList.contains('active'),
      solarOfferings: document.getElementById('toggle-solar').classList.contains('active'),
      b2bQuotation: document.getElementById('toggle-quotation').classList.contains('active')
    };
    saveJSON('site.json', site).then(() => alert('Feature settings saved!'));
  }
};
  });
});

// -------- Products --------
window.products = {
  editingId: null,
  openModal: (id = null) => {
    products.editingId = id;
    const form = document.getElementById('product-form');
    const title = document.getElementById('product-modal-title');
    form.reset();
    if (id) {
      const p = products.find(x => x.id === id);
      title.textContent = 'Edit Product';
      document.getElementById('product-id').value = p.id;
      document.getElementById('product-name').value = p.name;
      document.getElementById('product-model').value = p.model;
      document.getElementById('product-category').value = p.category;
      document.getElementById('product-desc').value = p.description;
      document.getElementById('product-image').value = p.image;
      document.getElementById('product-specs').value = (p.specs || []).join(', ');
    } else {
      title.textContent = 'Add Product';
      document.getElementById('product-id').value = '';
    }
    document.getElementById('product-modal').classList.remove('hidden');
  },
  closeModal: () => {
    document.getElementById('product-modal').classList.add('hidden');
    products.editingId = null;
  },
  save: () => {
    const data = {
      id: document.getElementById('product-id').value || 'p' + Date.now(),
      name: document.getElementById('product-name').value,
      model: document.getElementById('product-model').value,
      category: document.getElementById('product-category').value,
      description: document.getElementById('product-desc').value,
      image: document.getElementById('product-image').value,
      specs: document.getElementById('product-specs').value.split(',').map(s => s.trim()).filter(Boolean),
      features: []
    };
    if (products.editingId) {
      products = products.map(p => p.id === products.editingId ? data : p);
    } else {
      products.push(data);
    }
    saveJSON('products.json', { products }).then(() => {
      products.closeModal();
      renderProductsTable();
      renderDashboard();
    });
  },
  delete: (id) => {
    if (!confirm('Delete this product?')) return;
    products = products.filter(p => p.id !== id);
    saveJSON('products.json', { products }).then(() => {
      renderProductsTable();
      renderDashboard();
    });
  },
  renderProductsTable: () => {
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = '';
    products.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${p.image}" onerror="this.src='../assets/images/brand/Company Name and Logo Colour.png'" alt="${p.name}"></td>
        <td>${p.name}</td>
        <td>${p.model}</td>
// -------- Team --------
window.team = {
  editingId: null,
  openModal: (id = null) => {
    team.editingId = id;
    const form = document.getElementById('team-form');
    const title = document.getElementById('team-modal-title');
    form.reset();
    if (id) {
      const m = team.find(x => x.id === id);
      title.textContent = 'Edit Team Member';
      document.getElementById('team-id').value = m.id;
      document.getElementById('team-name').value = m.name;
      document.getElementById('team-title').value = m.title;
      document.getElementById('team-bio').value = m.bio;
      document.getElementById('team-image').value = m.image;
      document.getElementById('team-email').value = m.email;
      document.getElementById('team-phone').value = m.phone;
    } else {
      title.textContent = 'Add Team Member';
      document.getElementById('team-id').value = '';
    }
    document.getElementById('team-modal').classList.remove('hidden');
  },
  closeModal: () => {
    document.getElementById('team-modal').classList.add('hidden');
    team.editingId = null;
  },
  save: () => {
    const data = {
      id: document.getElementById('team-id').value || 't' + Date.now(),
      name: document.getElementById('team-name').value,
      title: document.getElementById('team-title').value,
      titleBn: '',
      bio: document.getElementById('team-bio').value,
      image: document.getElementById('team-image').value,
      email: document.getElementById('team-email').value,
      phone: document.getElementById('team-phone').value
    };
    if (team.editingId) {
      team = team.map(m => m.id === team.editingId ? data : m);
    } else {
      team.push(data);
    }
    saveJSON('team.json', { team }).then(() => {
      team.closeModal();
      renderTeamTable();
      renderDashboard();
    });
  },
  delete: (id) => {
    if (!confirm('Delete this team member?')) return;
    team = team.filter(m => m.id !== id);
    saveJSON('team.json', { team }).then(() => {
      renderTeamTable();
      renderDashboard();
    });
  },
  renderTeamTable: () => {
    const tbody = document.getElementById('team-table-body');
    tbody.innerHTML = '';
    team.forEach(m => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img src="${m.image}" onerror="this.src='../assets/images/brand/Company Name and Logo Colour.png'" alt="${m.name}"></td>
        <td>${m.name}</td>
        <td>${m.title}</td>
// -------- Admins --------
window.admins = {
  editingId: null,
  openModal: (id = null) => {
    admins.editingId = id;
    const form = document.getElementById('admin-form');
    const title = document.getElementById('admin-modal-title');
    form.reset();
    if (id) {
      const a = site.admins.find(x => x.username === id);
      title.textContent = 'Edit Admin';
      document.getElementById('admin-id').value = a.username;
      document.getElementById('admin-username').value = a.username;
      document.getElementById('admin-password').value = a.password || '';
      document.getElementById('admin-role').value = a.role;
    } else {
      title.textContent = 'Add Admin';
      document.getElementById('admin-id').value = '';
    }
    document.getElementById('admin-modal').classList.remove('hidden');
  },
  closeModal: () => {
    document.getElementById('admin-modal').classList.add('hidden');
    admins.editingId = null;
  },
  save: () => {
    const data = {
      username: document.getElementById('admin-username').value,
      password: document.getElementById('admin-password').value,
      role: document.getElementById('admin-role').value
    };
    if (!data.password && !admins.editingId) { alert('Password is required'); return; }
    if (admins.editingId) {
      site.admins = site.admins.map(a => a.username === admins.editingId ? { ...a, ...data } : a);
    } else {
      site.admins.push(data);
    }
    saveJSON('site.json', site).then(() => {
      admins.closeModal();
      renderAdminsTable();
      renderDashboard();
    });
  },
  delete: (username) => {
    if (!confirm('Remove admin user ' + username + '?')) return;
    site.admins = site.admins.filter(a => a.username !== username);
    saveJSON('site.json', site).then(() => {
      renderAdminsTable();
      renderDashboard();
    });
  },
  renderAdminsTable: () => {
    const tbody = document.getElementById('admins-table-body');
    tbody.innerHTML = '';
    (site.admins || []).forEach(a => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${a.username}</td>
        <td>${a.role}</td>
        <td>
          ${auth.isSuperAdmin() ? `<button class="btn btn-outline btn-sm" onclick="admins.openModal('${a.username}')">Edit</button>` : ''}
          ${auth.isSuperAdmin() && site.admins.length > 1 ? `<button class="btn btn-danger btn-sm" onclick="admins.delete('${a.username}')">Remove</button>` : ''}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
};

// -------- Helpers --------
async function saveJSON(filename, data) {
  const key = 'rmt_' + filename.replace('.json', '');
  localStorage.setItem(key, JSON.stringify(data));
  if (filename === 'site.json') site = data;
  if (filename === 'products.json') products = data.products;
  if (filename === 'team.json') team = data.team;
  return Promise.resolve();
}

// Modal close on outside click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.add('hidden');
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  auth.check();
  loadData();
});
        <td>${m.email}</td>
        <td>${m.phone}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="team.openModal('${m.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="team.delete('${m.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
};
        <td><span class="badge badge-${p.category}">${p.category}</span></td>
        <td>${p.description}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="products.openModal('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="products.delete('${p.id}')">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
};
function renderDashboard() {
  document.getElementById('stat-products').textContent = products.length;
  document.getElementById('stat-team').textContent = team.length;
  document.getElementById('stat-admins').textContent = site.admins ? site.admins.length : 0;
}