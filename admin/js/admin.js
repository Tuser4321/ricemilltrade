// =========================================
// Rice Mill Trade - Admin Panel JavaScript
// =========================================

const API_BASE = "../data";
let site = { company: {}, social: {}, features: {}, admins: [], homepage: {}, about: {}, services: [], contact: {}, design: {}, downloads: [] };
let products = [];
let team = [];
let currentAdmin = null;

// Auth
const auth = {
  check: () => {
    const stored = localStorage.getItem("rmt_admin");
    if (!stored) { window.location.href = "login.html"; return null; }
    currentAdmin = JSON.parse(stored);
    document.getElementById("current-user").textContent = currentAdmin.username;
    return currentAdmin;
  },
  logout: () => {
    localStorage.removeItem("rmt_admin");
    window.location.href = "login.html";
  },
  isSuperAdmin: () => currentAdmin && currentAdmin.role === "superadmin"
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
    loadSiteForm();
    loadHomepageForm();
    loadAboutForm();
    loadContactForm();
    loadDesignForm();
    renderServicesTable();
    renderDownloadsTable();
  } catch (e) { console.error("Load error:", e); }
}

// Navigation
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    const section = link.getAttribute("data-section");
    document.querySelectorAll(".content-section").forEach(s => s.classList.add("hidden"));
    document.getElementById("section-" + section).classList.remove("hidden");
    document.getElementById("page-title").textContent = link.textContent.trim();
    if (section === "dashboard") renderDashboard();
    if (section === "products") renderProductsTable();
    if (section === "team") renderTeamTable();
    if (section === "admins") renderAdminsTable();
    if (section === "services") renderServicesTable();
    if (section === "downloads") renderDownloadsTable();
  });
});
// -------- Site Control --------
function loadSiteForm() {
  const c = site.company || {};
  const s = site.social || {};
  document.getElementById("site-name").value = c.name || "";
  document.getElementById("site-tagline").value = c.tagline || "";
  document.getElementById("site-taglinebn").value = c.taglineBn || "";
  document.getElementById("site-phone").value = c.phone || "";
  document.getElementById("site-email").value = c.email || "";
  document.getElementById("site-mainaddr").value = c.mainAddress || "";
  document.getElementById("site-mainaddrbn").value = c.mainAddressBn || "";
  document.getElementById("site-oldaddr").value = c.oldAddress || "";
  document.getElementById("site-oldaddrbn").value = c.oldAddressBn || "";
  document.getElementById("social-facebook").value = s.facebook || "";
  document.getElementById("social-whatsapp").value = s.whatsapp || "";
  document.getElementById("social-linkedin").value = s.linkedin || "";
  document.getElementById("social-youtube").value = s.youtube || "";
}

window.siteConfig = {
  save: () => {
    site.company = {
      name: document.getElementById("site-name").value,
      tagline: document.getElementById("site-tagline").value,
      taglineBn: document.getElementById("site-taglinebn").value,
      phone: document.getElementById("site-phone").value,
      whatsapp: site.whatsapp || "8801348249343",
      email: document.getElementById("site-email").value,
      mainAddress: document.getElementById("site-mainaddr").value,
      mainAddressBn: document.getElementById("site-mainaddrbn").value,
      oldAddress: document.getElementById("site-oldaddr").value,
      oldAddressBn: document.getElementById("site-oldaddrbn").value,
      mapEmbed: site.company.mapEmbed || ""
    };
    saveJSON("site.json", site).then(() => { alert("Site settings saved."); });
  },
  saveSocial: () => {
    site.social = {
      facebook: document.getElementById("social-facebook").value,
      whatsapp: document.getElementById("social-whatsapp").value,
      linkedin: document.getElementById("social-linkedin").value,
      youtube: document.getElementById("social-youtube").value
    };
    saveJSON("site.json", site).then(() => { alert("Social links saved."); });
  }
};

// -------- Homepage --------
function loadHomepageForm() {
  const h = site.homepage || {};
  document.getElementById("hp-tagline").value = h.tagline || "";
  document.getElementById("hp-taglinebn").value = h.taglineBn || "";
  document.getElementById("hp-subtitle").value = h.subtitle || "";
  document.getElementById("hp-subtitlebn").value = h.subtitleBn || "";
  document.getElementById("hp-heroimg").value = h.heroImage || "";
}

window.homepage = {
  save: () => {
    site.homepage = {
      tagline: document.getElementById("hp-tagline").value,
      taglineBn: document.getElementById("hp-taglinebn").value,
      subtitle: document.getElementById("hp-subtitle").value,
      subtitleBn: document.getElementById("hp-subtitlebn").value,
      heroImage: document.getElementById("hp-heroimg").value,
      ctaButtonText: site.homepage.ctaButtonText || "View Products",
      ctaButtonTextBn: site.homepage.ctaButtonTextBn || "পণ্য দেখুন",
      whatsappButtonText: site.homepage.whatsappButtonText || "WhatsApp Inquiry",
      whatsappButtonTextBn: site.homepage.whatsappButtonTextBn || "উইটসএপের মাধ্যমে জিজ্ঞাসা করুন",
      services: site.homepage.services || [],
      featuredProducts: site.homepage.featuredProducts || []
    };
    saveJSON("site.json", site).then(() => { alert("Homepage settings saved."); });
  }
};
