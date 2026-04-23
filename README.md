# DEKA DESIGN — CRM Studio
## Documentation du Prototype

---

## Structure du projet

```
deka-design/
│
├── index.html                  → Redirection vers pages/accueil.html
│
├── pages/                      → Toutes les pages HTML séparées
│   ├── accueil.html            → Page d'accueil publique (hero, forfaits, CTA)
│   ├── services.html           → Page services détaillés avec CTA
│   ├── login.html              → Connexion (clients + admin)
│   ├── espace-client.html      → Dashboard personnel du client connecté
│   ├── admin.html              → Dashboard admin (projets, clients, factures, relances)
│   ├── recu.html               → Visualisation et impression d'une facture
│   └── profil.html             → Modification du profil client
│
├── assets/
│   ├── css/
│   │   └── global.css          → Feuille de style partagée par toutes les pages
│   ├── js/
│   │   ├── db.js               → Moteur SQLite (sql.js) + CRUD complet + Auth
│   │   └── topbar.js           → Composant navbar injecté sur chaque page
│   └── images/
│       └── logo.png            → Logo DK Design
│
└── database/
    └── schema.sql              → Schéma SQL + données de seed (MySQL/SQLite)
```

---

## Base de données — Tables

| Table            | Description                                      |
|------------------|--------------------------------------------------|
| `users`          | Tous les comptes (clients + admins)              |
| `clients`        | Profil métier lié à un user client               |
| `forfaits`       | Catalogue des packs disponibles                  |
| `projects`       | Commandes créatives                              |
| `brand_files`    | Fichiers livrés dans la Brand Library            |
| `factures`       | Reçus/factures générés par l'admin               |
| `facture_lignes` | Lignes de détail d'une facture                   |
| `emails_log`     | Historique des emails automatiques               |

---

## Comptes de démonstration

| Rôle   | Email                    | Mot de passe  |
|--------|--------------------------|---------------|
| Admin  | admin@dekadesign.tg      | admin123      |
| Client | ama@boutikelome.tg       | password123   |
| Client | kofi@techafrik.tg        | password123   |
| Client | aicha@modeafrique.tg     | password123   |
| Client | yves@agro-tg.com         | password123   |

---

## Comment ouvrir le projet dans VS Code

1. Ouvrir le dossier `deka-design/` dans VS Code
2. Installer l'extension **Live Server** (ritwickdey.LiveServer)
3. Clic droit sur `index.html` → **Open with Live Server**
4. Le navigateur ouvre `http://localhost:5500`

> ⚠️ Ne pas ouvrir les fichiers directement en double-cliquant  
> (sql.js nécessite un serveur HTTP local)

---

## Migration vers Laravel

### Structure équivalente

```
app/Models/          → User, Client, Project, Facture, BrandFile
app/Http/Controllers/→ AuthController, ClientController, AdminController, FactureController
database/migrations/ → Reprendre le schema.sql ci-dessus
resources/views/     → Les pages HTML deviennent des templates Blade
routes/web.php       → Routes pour chaque page
routes/api.php       → API REST si frontend séparé
```

### Commandes pour démarrer

```bash
laravel new deka-crm
cd deka-crm
php artisan make:model User --migration
php artisan make:model Client --migration
# ...etc
php artisan migrate --seed
php artisan serve
```

---

## Fonctionnalités implémentées

- ✅ Authentification complète (login, session, logout, rôles)
- ✅ Espace client personnalisé (nom, forfait, projets, fichiers, reçus)
- ✅ Dashboard admin avec onglets (projets, clients, factures, relances)
- ✅ CRUD projets avec changement de statut
- ✅ CRUD clients avec ajout de compte
- ✅ Génération de factures avec lignes de services
- ✅ Visualisation et impression des reçus
- ✅ Brand Library par client
- ✅ Relances automatiques (inactifs 30+ jours)
- ✅ Emails log tracés en base
- ✅ Profil modifiable (nom, téléphone, mot de passe)
- ✅ Base de données SQLite dans le navigateur (sql.js)
- ✅ Persistance des données (localStorage)
- ✅ Design responsive mobile-first
