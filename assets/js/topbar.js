/* ================================================================
   DEKA DESIGN — Topbar & Navigation (composant partagé)
   Fichier : assets/js/topbar.js
   Injecte automatiquement la navbar sur chaque page
================================================================ */

const LOGO_PATH = '../assets/images/logo.png';

function buildTopbar(activePage = '') {
  const session = authGetSession();

  const navLinks = [
    { id: 'accueil',  href: '../pages/accueil.html',   icon: 'fa-house',       label: 'Accueil'   },
    { id: 'services', href: '../pages/services.html',  icon: 'fa-palette',     label: 'Services'  },
    { id: 'client',   href: '../pages/espace-client.html', icon: 'fa-user-circle', label: 'Mon Espace' },
    ...(session?.role === 'admin' ? [
      { id: 'admin', href: '../pages/admin.html', icon: 'fa-gauge-high', label: 'Admin' }
    ] : [])
  ];

  const navHTML = navLinks.map(l => `
    <a href="${l.href}" class="nav-link ${activePage === l.id ? 'active' : ''}">
      <i class="fa-solid ${l.icon}"></i>
      <span class="nav-label">${l.label}</span>
    </a>
  `).join('');

  let userHTML = '';
  if (session) {
    const initials = session.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const dashLink = session.role === 'admin'
      ? `<a href="../pages/admin.html"><i class="fa-solid fa-gauge-high"></i> Dashboard Admin</a>`
      : `<a href="../pages/espace-client.html"><i class="fa-solid fa-user"></i> Mon Espace</a>`;

    userHTML = `
      <div class="user-badge">
        <div class="avatar" id="user-avatar-btn" onclick="toggleUserDropdown()">${initials}</div>
        <span class="nav-label" style="color:rgba(255,255,255,0.75);">${session.nom.split(' ')[0]}</span>
        <div class="user-dropdown" id="user-dropdown">
          <div class="user-dropdown-header">
            <div class="ud-name">${session.nom}</div>
            <div class="ud-email">${session.email}</div>
          </div>
          ${dashLink}
          <a href="../pages/profil.html"><i class="fa-solid fa-gear"></i> Mon Profil</a>
          <button class="logout-btn" onclick="doLogout()"><i class="fa-solid fa-right-from-bracket"></i> Déconnexion</button>
        </div>
      </div>`;
  } else {
    userHTML = `
      <a href="../pages/login.html" class="btn btn-gold btn-sm" style="text-decoration:none;">
        <i class="fa-solid fa-right-to-bracket"></i> Connexion
      </a>`;
  }

  return `
    <header class="topbar">
      <a href="../pages/accueil.html" class="topbar-logo">
        <img src="${LOGO_PATH}" alt="DK Design" onerror="this.style.display='none'">
        <div class="topbar-logo-text">
          <span class="brand-name">DEKA</span>
          <span class="brand-sub">Design</span>
        </div>
      </a>

      <nav class="topbar-nav" style="background:rgba(255,255,255,0.07); border:1px solid rgba(201,168,76,0.25); border-radius:30px; padding:3px;">
        ${navHTML}
      </nav>

      <div style="display:flex; align-items:center; gap:1rem;">
        <div class="theme-toggle">
         
          </button>
        </div>
        ${userHTML}
      </div>
    </header>
    <div id="toast"></div>
  `;
}

function injectTopbar(activePage = '') {
  const placeholder = document.getElementById('topbar-placeholder');
  if (placeholder) placeholder.outerHTML = buildTopbar(activePage);
}

function toggleUserDropdown() {
  document.getElementById('user-dropdown')?.classList.toggle('open');
}

function doLogout() {
  authLogout();
  window.location.href = '../pages/login.html';
}

// Fermer dropdown si clic ailleurs
document.addEventListener('click', e => {
  const dd = document.getElementById('user-dropdown');
  const btn = document.getElementById('user-avatar-btn');
  if (dd && btn && !dd.contains(e.target) && !btn.contains(e.target)) {
    dd.classList.remove('open');
  }
});
