/**
 * Centralisation de tous les endpoints de l'API Fait Maison.
 * Toute modification d'URL backend se fait uniquement ici.
 */

export const ENDPOINTS = {

  // ── Authentification ──────────────────────────────────────────────────────
  AUTH: {
    LOGIN:               '/auth/login',
    LOGOUT:              '/auth/logout',
    REFRESH:             '/auth/refresh',
    ME:                  '/auth/me',
    CHANGER_MOT_DE_PASSE: '/auth/changer-mot-de-passe',
  },

  // ── RBAC Administration ───────────────────────────────────────────────────
  RBAC: {
    // Admins
    ADMINS:            '/admin/rbac/admins',
    ADMIN_BY_ID:       (id) => `/admin/rbac/admins/${id}`,
    ADMIN_PERMISSIONS: (id) => `/admin/rbac/admins/${id}/permissions`,
    // Menus
    MENUS:             '/admin/rbac/menus',
    MENU_BY_ID:        (id) => `/admin/rbac/menus/${id}`,
  },

  // ── Administration ────────────────────────────────────────────────────────
  ADMIN: {
    // Listes
    VENDEURS:                '/admin/vendeurs',
    CLIENTS:                 '/admin/clients',
    PRODUITS_ACTIFS:         '/admin/produits-actifs',

    // Compteurs
    NOMBRE_VENDEURS_ACTIFS:  '/admin/nombre-vendeurs-actifs',
    NOMBRE_VENDEURS_INACTIFS:'/admin/nombre-vendeurs-inactifs',
    NOMBRE_PRODUITS_ACTIFS:  '/admin/nombre-produits-actifs',
    NOMBRE_CLIENTS_ACTIFS:   '/admin/nombre-clients-actifs',
    NOMBRE_CLIENTS_INACTIFS: '/admin/nombre-clients-inactifs',

    // Actions sur vendeurs
    ABONNEMENT_MANUEL:   (vendeurId) => `/admin/abonnement-manuel/${vendeurId}`,
    SUSPENDRE_VENDEUR:   (vendeurId) => `/admin/suspendre-vendeur/${vendeurId}`,

    // Actions sur utilisateurs
    SUPPRIMER_UTILISATEUR: (userId) => `/admin/supprimer-utilisateur/${userId}`,
    ACTIVER_UTILISATEUR:   (userId) => `/admin/activer-utilisateur/${userId}`,

    // Configuration
    PRIX_ABONNEMENT:        '/prix-abonnement',
    UPDATE_PRIX_ABONNEMENT: '/admin/prix-abonnement',
  },

  // ── Catégories ────────────────────────────────────────────────────────────
  CATEGORIES: {
    LIST:   '/categories/',
    CREATE: '/categories/',
    UPDATE: (id) => `/categories/${id}`,
    DELETE: (id) => `/categories/${id}`,
  },

  // ── Signalements ──────────────────────────────────────────────────────────
  SIGNALEMENTS: {
    LIST: '/signalements/',
  },

  // ── Messages clients ──────────────────────────────────────────────────────
  MESSAGES: {
    STATS:    '/admin/messages/stats',
    LIST:     '/admin/messages',
    REPONDRE: (id) => `/admin/messages/${id}/repondre`,
  },
};
