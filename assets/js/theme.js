/* ================================================================
   DEKA DESIGN — Gestion du Thème Global
   Fichier : assets/js/theme.js
   Gère le changement de thème sombre/clair sur toutes les pages
================================================================ */

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-mode');
    updateThemeButton('light');
    localStorage.setItem('theme', 'light');
  } else {
    document.body.classList.remove('light-mode');
    updateThemeButton('dark');
    localStorage.setItem('theme', 'dark');
  }
}

function updateThemeButton(theme) {
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    if (theme === 'light') {
      btn.innerHTML = '<i class="fas fa-sun"></i>';
      btn.title = 'Passer au mode sombre';
    } else {
      btn.innerHTML = '<i class="fas fa-moon"></i>';
      btn.title = 'Passer au mode clair';
    }
  }
}

function toggleTheme() {
  const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

// Initialiser le thème au chargement de la page
document.addEventListener('DOMContentLoaded', initTheme);
