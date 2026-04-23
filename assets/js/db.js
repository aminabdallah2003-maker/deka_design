/* ================================================================
   DEKA DESIGN — Moteur Base de Données (sql.js / SQLite WASM)
   Fichier : assets/js/db.js
   
   Utilise sql.js pour exécuter SQLite dans le navigateur.
   En production Laravel : remplacer par des appels API REST.
================================================================ */

// ================================================================
// INITIALISATION SQL.JS
// ================================================================
let DB = null;
let SQL = null;

async function initDB() {
  if (DB) return DB;

  // Charger sql.js
  SQL = await initSqlJs({
    locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`
  });

  // Récupérer la DB depuis localStorage si elle existe
  const saved = localStorage.getItem('dekaDesignDB');
  if (saved) {
    const arr = new Uint8Array(JSON.parse(saved));
    DB = new SQL.Database(arr);
  } else {
    DB = new SQL.Database();
    // Créer les tables et insérer les données initiales
    await seedDatabase();
  }

  return DB;
}

// Sauvegarder la DB dans localStorage
function saveDB() {
  if (!DB) return;
  const data = DB.export();
  localStorage.setItem('dekaDesignDB', JSON.stringify(Array.from(data)));
}

// Réinitialiser la DB (utile pour les démos)
function resetDB() {
  localStorage.removeItem('dekaDesignDB');
  DB = null;
  location.reload();
}

// ================================================================
// SEED — Création des tables et données initiales
// ================================================================
async function seedDatabase() {
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      nom        TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      password   TEXT NOT NULL,
      tel        TEXT,
      role       TEXT NOT NULL DEFAULT 'client',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS clients (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL REFERENCES users(id),
      forfait_nom     TEXT NOT NULL DEFAULT 'Pack Essentiel',
      forfait_visuels INTEGER NOT NULL DEFAULT 5,
      visuels_used    INTEGER NOT NULL DEFAULT 0,
      mrr             INTEGER NOT NULL DEFAULT 0,
      last_order_date TEXT,
      actif           INTEGER NOT NULL DEFAULT 1,
      notes           TEXT
    );

    CREATE TABLE IF NOT EXISTS forfaits (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      nom         TEXT NOT NULL,
      visuels_max INTEGER NOT NULL,
      prix        INTEGER NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES clients(id),
      titre       TEXT NOT NULL,
      type        TEXT NOT NULL,
      description TEXT,
      statut      TEXT NOT NULL DEFAULT 'En attente',
      delai       TEXT,
      note_admin  TEXT,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS brand_files (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id  INTEGER NOT NULL REFERENCES clients(id),
      project_id INTEGER,
      nom        TEXT NOT NULL,
      type       TEXT NOT NULL DEFAULT 'PNG',
      icon       TEXT NOT NULL DEFAULT '🖼️',
      couleur_bg TEXT NOT NULL DEFAULT '#FFF3E0',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS factures (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      numero        TEXT NOT NULL UNIQUE,
      client_id     INTEGER NOT NULL REFERENCES clients(id),
      type          TEXT NOT NULL DEFAULT 'Abonnement mensuel',
      date_emit     TEXT NOT NULL,
      date_echeance TEXT,
      statut        TEXT NOT NULL DEFAULT 'En attente',
      note          TEXT,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS facture_lignes (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      facture_id  INTEGER NOT NULL REFERENCES factures(id),
      description TEXT NOT NULL,
      quantite    REAL NOT NULL DEFAULT 1,
      prix_unit   INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS emails_log (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id    INTEGER NOT NULL REFERENCES clients(id),
      type         TEXT NOT NULL,
      destinataire TEXT NOT NULL,
      sujet        TEXT NOT NULL,
      sent_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `;

  DB.run(schema);

  // Données seed
  DB.run(`INSERT OR IGNORE INTO forfaits VALUES
    (1,'Pack Essentiel',5,75000,'5 visuels/mois, PNG et PDF'),
    (2,'Pack Pro',10,135000,'10 visuels prioritaires, tous formats'),
    (3,'Pack Studio',20,250000,'20 visuels, gestionnaire dédié');`);

  DB.run(`INSERT OR IGNORE INTO users VALUES
    (1,'Admin DEKA','admin@dekadesign.tg','admin123','+228 90 00 00 00','admin',datetime('now')),
    (2,'Ama Koffi','ama@boutikelome.tg','password123','+228 90 11 22 33','client',datetime('now')),
    (3,'Kofi Mensah','kofi@techafrik.tg','password123','+228 90 44 55 66','client',datetime('now')),
    (4,'Aïcha Diabaté','aicha@modeafrique.tg','password123','+228 90 77 88 99','client',datetime('now')),
    (5,'Yves Agboton','yves@agro-tg.com','password123','+228 91 00 11 22','client',datetime('now'));`);

  DB.run(`INSERT OR IGNORE INTO clients VALUES
    (1,2,'Pack Essentiel',5,3,75000,'2025-04-10',1,NULL),
    (2,3,'Pack Pro',10,9,135000,'2025-04-18',1,NULL),
    (3,4,'Pack Studio',20,5,250000,'2025-03-20',1,NULL),
    (4,5,'Pack Essentiel',5,0,75000,'2025-02-28',1,NULL);`);

  DB.run(`INSERT OR IGNORE INTO projects VALUES
    (1,1,'Affiche Promo Pâques','Affiche / Flyer',NULL,'Livré','2025-04-12',NULL,datetime('now')),
    (2,1,'Story Instagram Mai','Story / Reel',NULL,'Révision','2025-04-19',NULL,datetime('now')),
    (3,1,'Post Fête des Mères','Post réseaux sociaux',NULL,'Création','2025-04-22',NULL,datetime('now')),
    (4,2,'Carte de Visite Tech Afrik','Carte de visite',NULL,'Livré','2025-04-15',NULL,datetime('now')),
    (5,2,'Bannière Site Web','Bannière web',NULL,'En attente','2025-04-20',NULL,datetime('now')),
    (6,3,'Lookbook Mode Été 2025','Affiche / Flyer',NULL,'Création','2025-04-18',NULL,datetime('now')),
    (7,4,'Logo Agro-Togo','Logo / Identité',NULL,'Livré','2025-04-05',NULL,datetime('now'));`);

  DB.run(`INSERT OR IGNORE INTO brand_files (client_id,project_id,nom,type,icon,couleur_bg) VALUES
    (1,1,'Affiche Promo Pâques','PDF','🖼️','#FFF3E0'),
    (1,NULL,'Logo Principal','PNG','⭐','#E8F5E9'),
    (1,NULL,'Charte Couleurs','PDF','🎨','#E3F2FD'),
    (1,NULL,'Kit Réseaux Sociaux','ZIP','📦','#F3E5F5');`);

  DB.run(`INSERT OR IGNORE INTO factures VALUES
    (1,'DD-2025-001',1,'Abonnement mensuel','2025-04-01','2025-04-05','Payé','Merci pour votre fidélité.',datetime('now')),
    (2,'DD-2025-002',2,'Abonnement mensuel','2025-04-01','2025-04-05','Payé','Paiement reçu.',datetime('now')),
    (3,'DD-2025-003',1,'Facture projet','2025-04-12','2025-04-20','En attente','Solde dû avant livraison finale.',datetime('now'));`);

  DB.run(`INSERT OR IGNORE INTO facture_lignes (facture_id,description,quantite,prix_unit) VALUES
    (1,'Pack Essentiel — Abonnement Avril 2025',1,75000),
    (2,'Pack Pro — Abonnement Avril 2025',1,135000),
    (3,'Affiche Promo Pâques (A3 + web)',1,25000),
    (3,'Retouches et variations couleurs',2,5000);`);

  saveDB();
}

// ================================================================
// HELPERS REQUÊTES
// ================================================================

/** Exécuter une requête SELECT et retourner un tableau d'objets */
function dbQuery(sql, params = []) {
  if (!DB) return [];
  try {
    const stmt = DB.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  } catch (e) {
    console.error('DB Query error:', sql, e);
    return [];
  }
}

/** Exécuter INSERT/UPDATE/DELETE et sauvegarder */
function dbRun(sql, params = []) {
  if (!DB) return false;
  try {
    DB.run(sql, params);
    saveDB();
    return true;
  } catch (e) {
    console.error('DB Run error:', sql, e);
    return false;
  }
}

/** Récupérer une seule ligne */
function dbGet(sql, params = []) {
  const rows = dbQuery(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// ================================================================
// AUTHENTIFICATION
// ================================================================

const AUTH_KEY = 'dekaSession';

function authLogin(email, password) {
  const user = dbGet(
    'SELECT u.*, c.id as client_id, c.forfait_nom, c.forfait_visuels, c.visuels_used, c.mrr, c.last_order_date FROM users u LEFT JOIN clients c ON c.user_id = u.id WHERE u.email = ? AND u.password = ?',
    [email.trim().toLowerCase(), password]
  );
  if (!user) return { success: false, error: 'Email ou mot de passe incorrect.' };

  const session = {
    userId:    user.id,
    clientId:  user.client_id || null,
    nom:       user.nom,
    email:     user.email,
    tel:       user.tel,
    role:      user.role,
    forfait:   user.forfait_nom,
    forfaitMax:user.forfait_visuels,
    used:      user.visuels_used || 0,
    mrr:       user.mrr || 0,
    loginAt:   Date.now()
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return { success: true, session };
}

function authLogout() {
  localStorage.removeItem(AUTH_KEY);
}

function authGetSession() {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  return JSON.parse(raw);
}

function authIsLoggedIn() {
  return authGetSession() !== null;
}

function authIsAdmin() {
  const s = authGetSession();
  return s && s.role === 'admin';
}

function authRequire(role = null) {
  const s = authGetSession();
  if (!s) { window.location.href = '../pages/login.html'; return null; }
  if (role && s.role !== role) { window.location.href = '../pages/login.html'; return null; }
  return s;
}

// ================================================================
// CRUD CLIENTS
// ================================================================

function getAllClients() {
  return dbQuery(`
    SELECT c.*, u.nom, u.email, u.tel
    FROM clients c JOIN users u ON u.id = c.user_id
    ORDER BY c.id
  `);
}

function getClientById(clientId) {
  return dbGet(`
    SELECT c.*, u.nom, u.email, u.tel, u.role
    FROM clients c JOIN users u ON u.id = c.user_id
    WHERE c.id = ?
  `, [clientId]);
}

function getClientByUserId(userId) {
  return dbGet(`
    SELECT c.*, u.nom, u.email, u.tel
    FROM clients c JOIN users u ON u.id = c.user_id
    WHERE c.user_id = ?
  `, [userId]);
}

function createClient(nom, email, password, tel, forfaitId, mrr) {
  const forfaits = { 1: { nom: 'Pack Essentiel', v: 5 }, 2: { nom: 'Pack Pro', v: 10 }, 3: { nom: 'Pack Studio', v: 20 } };
  const f = forfaits[forfaitId] || forfaits[1];
  dbRun('INSERT INTO users (nom, email, password, tel, role) VALUES (?, ?, ?, ?, "client")',
        [nom, email.toLowerCase(), password, tel || null]);
  const user = dbGet('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!user) return false;
  dbRun('INSERT INTO clients (user_id, forfait_nom, forfait_visuels, mrr) VALUES (?, ?, ?, ?)',
        [user.id, f.nom, f.v, mrr || 0]);
  return user.id;
}

function updateClientUsage(clientId, used) {
  dbRun('UPDATE clients SET visuels_used = ? WHERE id = ?', [used, clientId]);
}

// ================================================================
// CRUD PROJETS
// ================================================================

function getProjectsByClient(clientId) {
  return dbQuery(
    'SELECT * FROM projects WHERE client_id = ? ORDER BY created_at DESC',
    [clientId]
  );
}

function getAllProjects() {
  return dbQuery(`
    SELECT p.*, u.nom as client_nom
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    JOIN users u ON u.id = c.user_id
    ORDER BY p.created_at DESC
  `);
}

function createProject(clientId, titre, type, description, delai) {
  dbRun(
    'INSERT INTO projects (client_id, titre, type, description, delai) VALUES (?, ?, ?, ?, ?)',
    [clientId, titre, type, description || null, delai || null]
  );
  // Mettre à jour last_order_date
  dbRun('UPDATE clients SET last_order_date = date("now") WHERE id = ?', [clientId]);
}

function updateProjectStatus(projectId, statut) {
  dbRun('UPDATE projects SET statut = ? WHERE id = ?', [statut, projectId]);
}

// ================================================================
// CRUD FACTURES
// ================================================================

function getFacturesByClient(clientId) {
  return dbQuery(
    'SELECT * FROM factures WHERE client_id = ? ORDER BY date_emit DESC',
    [clientId]
  );
}

function getAllFactures() {
  return dbQuery(`
    SELECT f.*, u.nom as client_nom, u.email as client_email
    FROM factures f
    JOIN clients c ON c.id = f.client_id
    JOIN users u ON u.id = c.user_id
    ORDER BY f.date_emit DESC
  `);
}

function getFactureLignes(factureId) {
  return dbQuery('SELECT * FROM facture_lignes WHERE facture_id = ?', [factureId]);
}

function genNumeroFacture() {
  const count = dbGet('SELECT COUNT(*) as n FROM factures').n;
  return `DD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
}

function createFacture(clientId, type, dateEmit, dateEcheance, statut, note, lignes) {
  const numero = genNumeroFacture();
  dbRun(
    'INSERT INTO factures (numero, client_id, type, date_emit, date_echeance, statut, note) VALUES (?,?,?,?,?,?,?)',
    [numero, clientId, type, dateEmit, dateEcheance, statut, note]
  );
  const facture = dbGet('SELECT id FROM factures WHERE numero = ?', [numero]);
  if (facture) {
    lignes.forEach(l => {
      dbRun(
        'INSERT INTO facture_lignes (facture_id, description, quantite, prix_unit) VALUES (?,?,?,?)',
        [facture.id, l.description, l.qte, l.pu]
      );
    });
  }
  return numero;
}

function updateFactureStatut(factureId, statut) {
  dbRun('UPDATE factures SET statut = ? WHERE id = ?', [statut, factureId]);
}

// ================================================================
// BRAND FILES
// ================================================================

function getBrandFilesByClient(clientId) {
  return dbQuery('SELECT * FROM brand_files WHERE client_id = ? ORDER BY created_at DESC', [clientId]);
}

// ================================================================
// EMAILS LOG
// ================================================================

function logEmail(clientId, type, destinataire, sujet) {
  dbRun('INSERT INTO emails_log (client_id, type, destinataire, sujet) VALUES (?,?,?,?)',
        [clientId, type, destinataire, sujet]);
}

function getEmailsByClient(clientId) {
  return dbQuery('SELECT * FROM emails_log WHERE client_id = ? ORDER BY sent_at DESC', [clientId]);
}

// ================================================================
// STATS ADMIN
// ================================================================

function getAdminStats() {
  const clients = dbGet('SELECT COUNT(*) as n FROM clients')?.n || 0;
  const mrr     = dbGet('SELECT SUM(mrr) as s FROM clients')?.s || 0;
  const active  = dbGet("SELECT COUNT(*) as n FROM projects WHERE statut != 'Livré'")?.n || 0;
  const livres  = dbGet("SELECT COUNT(*) as n FROM projects WHERE statut = 'Livré'")?.n || 0;
  return { clients, mrr, active, livres };
}

function getInactiveClients(days = 30) {
  return dbQuery(`
    SELECT c.*, u.nom, u.email, u.tel
    FROM clients c JOIN users u ON u.id = c.user_id
    WHERE c.last_order_date IS NULL
       OR julianday('now') - julianday(c.last_order_date) >= ?
    ORDER BY c.last_order_date ASC
  `, [days]);
}

// ================================================================
// UTILITAIRES
// ================================================================

function formatDate(d) {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('close'); document.getElementById(id)?.classList.remove('open'); }

// Fermer modale en cliquant hors
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });
});
