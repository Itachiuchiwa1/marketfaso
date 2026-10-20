# MarketFaso v1.0 — Plateforme E-Commerce & Gestion des Livraisons au Burkina Faso

**MarketFaso** est une plateforme web moderne et complète développée sur mesure pour faciliter le commerce électronique et la logistique de livraison au Burkina Faso (Ouagadougou, Bobo-Dioulasso, Koudougou, etc.).

---

## 🌟 Fonctionnalités Clés

### 🛒 Côté Acheteur (Invité & Général)
- **Catalogue & Recherche** : Filtrage par catégories (Panneaux Solaires, Artisanat, Téléphonie, etc.) et recherche par mot-clé et par ville.
- **Panier dynamique** : Gestion du panier local (`localStorage`) avec persistance et calcul automatique des frais de livraison par secteur.
- **Commande Sans Compte (Guest Checkout)** : Passage de commande fluide sans inscription obligatoire, avec génération d'un numéro unique (ex: `MF-2026-88412`).
- **Paiement Mobile Money (Simulé)** : Prise en charge d'Orange Money, Moov Money et Coris Money avec webhook d'actualisation instantanée de statut.
- **Suivi de commande en temps réel** : Page dédiée `/suivi/[numero]` avec indicateur de progression (Commandée -> Payée -> En préparation -> En livraison -> Livrée).

### 🏪 Côté Vendeur (Espace Pros)
- **Inscription & Gestion de boutique** : Création de compte vendeur lié à une boutique physique ou en ligne.
- **Gestion des produits** : Ajout de produits avec **1 à 5 photos** (définition automatique de la première comme image principale `estPrincipale: true`), gestion du stock, prix et description.
- **Tableau de bord Vendeur** : Suivi des ventes, des stocks et de la liste des commandes à préparer.

### 🚴 Côté Livreur Partenaire
- **Inscription avec Sécurité & Workflow d'Approbation** : Inscription de livreur par défaut au statut `EN_ATTENTE`.
- **Validation Obligatoire par l'Admin** : Un administrateur doit approuver le profil (`ACTIF`) avant que le livreur ne puisse revendiquer des courses.
- **Attribution Atomique des Courses** : Algorithme anti-concurrence (race condition safe) garantissant qu'une livraison ne peut être acceptée que par un seul livreur.
- **Mise à jour d'état** : Suivi de la course étape par étape (`ACCEPTEE` -> `EN_PREPARATION` -> `EN_COURS` -> `LIVREE`).

### 🛡️ Côté Administrateur
- **Tableau de bord Exécutif** : Vision globale du chiffre d'affaires total en FCFA, du volume de commandes et des acteurs du réseau.
- **Gestion & Validation des Utilisateurs** : Validation en 1-clic des candidats livreurs (`EN_ATTENTE` -> `ACTIF`), suspension de comptes.
- **Rapports & Statistiques Détaillés** : Filtrage de l'activité commerciale par période (`jour`, `semaine`, `mois`, `tout`) avec ventilation par statut de commande et de livraison.

---

## 🛠️ Stack Technique

- **Framework** : Next.js 15 (App Router, React 19, TypeScript)
- **Styles** : Tailwind CSS v4 (Configuration par jetons `@theme` dans `src/app/globals.css`)
- **Base de Données & ORM** : PostgreSQL 18 & Prisma 7 (`prisma-client` avec adaptateur `@prisma/adapter-pg` et `prisma.config.ts`)
- **Authentification** : Auth.js v5 (`next-auth@beta` avec adaptateur Credentials e-mail / téléphone)
- **Icônes** : `lucide-react`
- **Monnaie & Formats** : FCFA (Franc CFA XOF, ex: `25 000 FCFA`)

---

## 📂 Structure du Projet

```
C:\xampp\htdocs\marketfaso\
├── prisma/
│   ├── schema.prisma         # Modèle de données Prisma 7
│   └── seed.ts               # Données de démonstration réalistes
├── src/
│   ├── app/
│   │   ├── admin/            # Dashboard, utilisateurs & stats admin
│   │   ├── api/              # API Routes (auth, produits, commandes, livraisons, stats...)
│   │   ├── commande/         # Formulaire de commande client (guest)
│   │   ├── livreur/          # Espace & suivi des courses livreur
│   │   ├── paiement/         # Simulation Mobile Money (Orange, Moov, Coris)
│   │   ├── panier/           # Panier d'achat local
│   │   ├── produits/         # Catalogue & Fiche produit (1-5 photos)
│   │   ├── suivi/[numero]/   # Suivi direct par numéro de commande
│   │   ├── vendeur/          # Dashboard & ajout produit vendeur
│   │   ├── globals.css       # Variables Tailwind v4 & thèmes Faso (Rouge, Vert, Jaune)
│   │   └── page.tsx          # Page d'accueil MarketFaso
│   ├── components/           # Navbar, Footer & Composants UI
│   └── lib/                  # Auth.js, Prisma Singleton, Helper Cart FCFA
├── prisma.config.ts          # Configuration spécifique Prisma 7
├── next.config.ts            # Configuration Next.js 15
└── package.json
```

---

## 🔑 Identifiants de Démonstration (Seed)

| Rôle | E-mail / Identifiant | Mot de passe | Description |
|---|---|---|---|
| **Administrateur** | `admin@marketfaso.bf` | `AdminPassword2026!` | Accès complet au panel `/admin` |
| **Vendeur 1** | `vendeur.ouaga@marketfaso.bf` | `VendeurPass123!` | Boutique *Faso Électronique & Solaire* |
| **Vendeur 2** | `vendeur.bobo@marketfaso.bf` | `VendeurPass123!` | Boutique *Artisanat & Mode du Faso* |
| **Livreur (Actif)** | `livreur.express@marketfaso.bf` | `LivreurPass123!` | Livreur actif (Ouagadougou, Moto) |
| **Livreur (En Attente)** | `livreur.bobo@marketfaso.bf` | `LivreurPass123!` | Livreur en attente de validation admin |
| **Commande Démo** | `MF-2026-88412` | N/A | Numéro de suivi pour la page `/suivi/MF-2026-88412` |

---

## 🚀 Installation & Démarrage

### 1. Prérequis
- Node.js v20+
- PostgreSQL 18 fonctionnel sur `localhost:5432` avec une base nommée `marketfaso`

### 2. Configuration d'environnement (`.env`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketfaso"
AUTH_SECRET="marketfaso_secret_key_burkina_2026_super_secure"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Exécution des migrations & du Seeding Prisma 7
```bash
# Générer le client Prisma
& "C:\Program Files\nodejs\node.exe" node_modules/prisma/dist/prisma.js generate

# Pousser le schéma dans la base PostgreSQL
& "C:\Program Files\nodejs\node.exe" node_modules/prisma/dist/prisma.js db push

# Exécuter le seed
& "C:\Program Files\nodejs\node.exe" node_modules/prisma/dist/prisma.js db seed
```

### 4. Démarrer le serveur de développement
```bash
npm run dev
```
Rendez-vous sur [http://localhost:3000](http://localhost:3000).

---

## 🎨 Charte Graphique & Couleurs Nationales
- **Rouge Faso** (`--color-faso-red`) : `#EF3340`
- **Vert Faso** (`--color-faso-green`) : `#009739`
- **Or Faso** (`--color-faso-gold`) : `#FFCD00`
- **Encre Fondale** (`--color-ink`) : `#16241C`
- **Surface Neutre** (`--color-surface`) : `#F7F8F4`

---

© 2026 **MarketFaso** — Plateforme Nationale de Commerce & Livraison.
