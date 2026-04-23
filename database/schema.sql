-- ================================================================
-- DEKA DESIGN — Schéma Base de Données
-- Moteur : SQLite (prototype) / MySQL (production)
-- Généré pour le prototype HTML/JS utilisant sql.js (SQLite WASM)
-- ================================================================

-- ----------------------------------------------------------------
-- TABLE : users
-- Tous les utilisateurs (clients + admins)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  nom          TEXT    NOT NULL,
  email        TEXT    NOT NULL UNIQUE,
  password     TEXT    NOT NULL,  -- bcrypt en prod, MD5 simulé ici
  tel          TEXT,
  role         TEXT    NOT NULL DEFAULT 'client', -- 'client' | 'admin'
  avatar       TEXT,              -- URL ou initiales
  created_at   TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------
-- TABLE : clients
-- Informations métier liées à un user de rôle 'client'
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS clients (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  forfait_id      INTEGER REFERENCES forfaits(id),
  forfait_nom     TEXT    NOT NULL DEFAULT 'Pack Essentiel',
  forfait_visuels INTEGER NOT NULL DEFAULT 5,   -- max visuels / mois
  visuels_used    INTEGER NOT NULL DEFAULT 0,   -- consommés ce mois
  mrr             INTEGER NOT NULL DEFAULT 0,   -- revenu mensuel FCFA
  last_order_date TEXT,
  actif           INTEGER NOT NULL DEFAULT 1,   -- 0 = inactif
  notes           TEXT,
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------
-- TABLE : forfaits
-- Catalogue des forfaits disponibles
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS forfaits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  nom         TEXT    NOT NULL,
  visuels_max INTEGER NOT NULL,
  prix        INTEGER NOT NULL,  -- FCFA / mois
  description TEXT,
  actif       INTEGER NOT NULL DEFAULT 1
);

-- ----------------------------------------------------------------
-- TABLE : projects
-- Projets / commandes créatives
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  titre       TEXT    NOT NULL,
  type        TEXT    NOT NULL,  -- Post RS, Affiche, Logo...
  description TEXT,
  statut      TEXT    NOT NULL DEFAULT 'En attente',
                                 -- En attente | Création | Révision | Livré
  delai       TEXT,              -- date souhaitée
  note_admin  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------
-- TABLE : brand_files
-- Fichiers livrés dans la Brand Library du client
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_files (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id  INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id),
  nom        TEXT    NOT NULL,
  type       TEXT    NOT NULL DEFAULT 'PNG',  -- PNG | PDF | ZIP | AI
  icon       TEXT    NOT NULL DEFAULT '🖼️',
  couleur_bg TEXT    NOT NULL DEFAULT '#FFF3E0',
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------
-- TABLE : factures (reçus)
-- Factures/reçus générés par l'admin
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS factures (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  numero      TEXT    NOT NULL UNIQUE,   -- DD-2025-001
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type        TEXT    NOT NULL DEFAULT 'Abonnement mensuel',
  date_emit   TEXT    NOT NULL,
  date_echeance TEXT,
  statut      TEXT    NOT NULL DEFAULT 'En attente', -- Payé | En attente | Annulé
  note        TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------
-- TABLE : facture_lignes
-- Lignes de détail d'une facture
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facture_lignes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  facture_id  INTEGER NOT NULL REFERENCES factures(id) ON DELETE CASCADE,
  description TEXT    NOT NULL,
  quantite    REAL    NOT NULL DEFAULT 1,
  prix_unit   INTEGER NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------
-- TABLE : emails_log
-- Historique des emails automatiques envoyés
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emails_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type        TEXT    NOT NULL,  -- bienvenue | relance_inactivite | relance_upgrade
  destinataire TEXT   NOT NULL,
  sujet       TEXT    NOT NULL,
  statut      TEXT    NOT NULL DEFAULT 'envoyé',
  sent_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ----------------------------------------------------------------
-- TABLE : sessions
-- Sessions de connexion (simulées en JS)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT    PRIMARY KEY,  -- token UUID
  user_id    INTEGER NOT NULL REFERENCES users(id),
  expires_at TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ================================================================
-- DONNÉES INITIALES (SEED)
-- ================================================================

-- Forfaits
INSERT OR IGNORE INTO forfaits (id, nom, visuels_max, prix, description) VALUES
  (1, 'Pack Essentiel', 5,  75000,  '5 visuels par mois, fichiers PNG et PDF'),
  (2, 'Pack Pro',       10, 135000, '10 visuels prioritaires, tous formats, charte graphique'),
  (3, 'Pack Studio',    20, 250000, '20 visuels, gestionnaire dédié, support 7j/7');

-- Compte Admin
INSERT OR IGNORE INTO users (id, nom, email, password, role) VALUES
  (1, 'Admin DEKA', 'admin@dekadesign.tg', 'admin123', 'admin');

-- Comptes Clients de démonstration
INSERT OR IGNORE INTO users (id, nom, email, password, role, tel) VALUES
  (2, 'Ama Koffi',     'ama@boutikelome.tg',  'password123', 'client', '+228 90 11 22 33'),
  (3, 'Kofi Mensah',   'kofi@techafrik.tg',   'password123', 'client', '+228 90 44 55 66'),
  (4, 'Aïcha Diabaté', 'aicha@modeafrique.tg','password123', 'client', '+228 90 77 88 99'),
  (5, 'Yves Agboton',  'yves@agro-tg.com',    'password123', 'client', '+228 91 00 11 22');

-- Profils clients
INSERT OR IGNORE INTO clients (id, user_id, forfait_id, forfait_nom, forfait_visuels, visuels_used, mrr, last_order_date) VALUES
  (1, 2, 1, 'Pack Essentiel', 5,  3, 75000,  '2025-04-10'),
  (2, 3, 2, 'Pack Pro',       10, 9, 135000, '2025-04-18'),
  (3, 4, 3, 'Pack Studio',    20, 5, 250000, '2025-03-20'),
  (4, 5, 1, 'Pack Essentiel', 5,  0, 75000,  '2025-02-28');

-- Projets
INSERT OR IGNORE INTO projects (id, client_id, titre, type, statut, delai) VALUES
  (1, 1, 'Affiche Promo Pâques',       'Affiche / Flyer',      'Livré',      '2025-04-12'),
  (2, 1, 'Story Instagram Mai',        'Story / Reel',         'Révision',   '2025-04-19'),
  (3, 1, 'Post Fête des Mères',        'Post réseaux sociaux', 'Création',   '2025-04-22'),
  (4, 2, 'Carte de Visite Tech Afrik', 'Carte de visite',      'Livré',      '2025-04-15'),
  (5, 2, 'Bannière Site Web',          'Bannière web',         'En attente', '2025-04-20'),
  (6, 3, 'Lookbook Mode Été 2025',     'Affiche / Flyer',      'Création',   '2025-04-18'),
  (7, 4, 'Logo Agro-Togo',             'Logo / Identité',      'Livré',      '2025-04-05');

-- Brand files
INSERT OR IGNORE INTO brand_files (client_id, project_id, nom, type, icon, couleur_bg) VALUES
  (1, 1, 'Affiche Promo Pâques', 'PDF', '🖼️', '#FFF3E0'),
  (1, NULL, 'Logo Principal',    'PNG', '⭐', '#E8F5E9'),
  (1, NULL, 'Charte Couleurs',   'PDF', '🎨', '#E3F2FD'),
  (1, NULL, 'Kit Réseaux Sociaux','ZIP', '📦', '#F3E5F5');

-- Factures
INSERT OR IGNORE INTO factures (id, numero, client_id, type, date_emit, date_echeance, statut, note) VALUES
  (1, 'DD-2025-001', 1, 'Abonnement mensuel', '2025-04-01', '2025-04-05', 'Payé',      'Merci pour votre fidélité.'),
  (2, 'DD-2025-002', 2, 'Abonnement mensuel', '2025-04-01', '2025-04-05', 'Payé',      'Paiement reçu.'),
  (3, 'DD-2025-003', 1, 'Facture projet',     '2025-04-12', '2025-04-20', 'En attente','Solde dû avant livraison finale.');

INSERT OR IGNORE INTO facture_lignes (facture_id, description, quantite, prix_unit) VALUES
  (1, 'Pack Essentiel — Abonnement Avril 2025', 1, 75000),
  (2, 'Pack Pro — Abonnement Avril 2025',       1, 135000),
  (3, 'Affiche Promo Pâques (A3 + web)',        1, 25000),
  (3, 'Retouches et variations couleurs',       2, 5000);
