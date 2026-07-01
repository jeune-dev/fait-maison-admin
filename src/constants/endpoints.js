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
    ME:                  '/account/me',
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
    // Listes (alignées sur les vraies routes backend)
    VENDEURS:                '/admin/liste-vendeurs',
    CLIENTS:                 '/admin/liste-clients',
    PRODUITS_ACTIFS:         '/admin/liste-produits-actifs',

    // Compteurs (attention : vendeurs = singulier "actif/inactif" côté backend)
    NOMBRE_VENDEURS_ACTIFS:  '/admin/nombre-vendeurs-actif',
    NOMBRE_VENDEURS_INACTIFS:'/admin/nombre-vendeurs-inactif',
    NOMBRE_PRODUITS_ACTIFS:  '/admin/nombre-produits-actifs',
    NOMBRE_CLIENTS_ACTIFS:   '/admin/nombre-clients-actifs',
    NOMBRE_CLIENTS_INACTIFS: '/admin/nombre-clients-inactifs',

    // Actions sur vendeurs
    ABONNEMENT_MANUEL:   (vendeurId) => `/admin/abonnement-manuel/${vendeurId}`,
    SUSPENDRE_VENDEUR:   (vendeurId) => `/admin/vendeur/${vendeurId}/suspendre`,
    ACTIVER_VENDEUR:     (vendeurId) => `/admin/vendeur/${vendeurId}/activer`,
    SUSPENDRE_ACHETEUR:  (acheteurId) => `/admin/acheteur/${acheteurId}/suspendre`,
    VERIFIER_VENDEUR:    (vendeurId) => `/admin/vendeur/${vendeurId}/verifier`,

    // Actions sur utilisateurs
    SUPPRIMER_UTILISATEUR: (userId) => `/admin/supprimer-utilisateur/${userId}`,
    ACTIVER_UTILISATEUR:   (userId) => `/admin/vendeur/${userId}/activer`,

    // Modération produits
    PRODUITS_EN_ATTENTE: '/admin/produits-en-attente',
    APPROUVER_PRODUIT:   (id) => `/admin/produit/${id}/approuver`,
    REJETER_PRODUIT:     (id) => `/admin/produit/${id}/rejeter`,
    SUPPRIMER_PRODUIT:   (id) => `/admin/produit/${id}`,

    // Boutique
    SUPPRIMER_BOUTIQUE: (id) => `/admin/boutique/${id}`,

    // Statistiques avancées
    REVENUS_MENSUELS:        '/admin/revenus-mensuels',
    INSCRIPTIONS_MENSUELLES: '/admin/inscriptions-mensuelles',

    // Configuration
    PRIX_ABONNEMENT:        '/prix-abonnement',
    UPDATE_PRIX_ABONNEMENT: '/admin/prix-abonnement',

    // Commandes (e-commerce) — routes backend réelles
    COMMANDES:        '/admin/commandes',
    STATS_ECOMMERCE:  '/admin/stats-ecommerce',

    // Paiements
    PAIEMENTS:        '/admin/paiements',
    PAIEMENTS_ECHECS: '/admin/paiements/echecs',

    // Abonnements
    ABONNEMENTS:             '/admin/abonnements',
    ABONNEMENTS_EXPIRATION:  '/admin/abonnements-expiration',
    REVOQUER_ABONNEMENT:     (id) => `/admin/abonnement/${id}/revoquer`,

    // Notification globale
    NOTIFICATION_GLOBALE: '/admin/notification-globale',
  },

  // ── Commandes ─────────────────────────────────────────────────────────────
  COMMANDES: {
    LIST:            '/admin/commandes',
    STATS_ECOMMERCE: '/admin/stats-ecommerce',
  },

  // ── Abonnements ───────────────────────────────────────────────────────────
  ABONNEMENTS: {
    LIST:         '/admin/abonnements',
    CREER_MANUEL: (vendeurId) => `/admin/abonnement-manuel/${vendeurId}`,
    REVOQUER:     (id) => `/admin/abonnement/${id}/revoquer`,
    EXPIRATION:   '/admin/abonnements-expiration',
  },

  // ── Paiements ─────────────────────────────────────────────────────────────
  PAIEMENTS: {
    LIST:   '/admin/paiements',
    ECHECS: '/admin/paiements/echecs',
  },

  // ── Demandes de retour ────────────────────────────────────────────────────
  RETOURS: {
    LIST:    '/admin/demandes-retour',
    TRAITER: (id) => `/admin/demandes-retour/${id}/traiter`,
  },

  // ── Logs d'audit ──────────────────────────────────────────────────────────
  AUDIT_LOGS: {
    LIST: '/admin/audit-logs',
  },

  // ── Configuration générale ────────────────────────────────────────────────
  CONFIGS: {
    LIST:   '/admin/configs',
    CREATE: '/admin/configs',
    UPDATE: (cle) => `/admin/configs/${cle}`,
  },

  // ── Notification globale ─────────────────────────────────────────────────
  NOTIFICATION_GLOBALE: {
    ENVOYER: '/admin/notification-globale',
  },

  // ── Catégories ────────────────────────────────────────────────────────────
  CATEGORIES: {
    LIST:   '/categories/',                         // GET public
    CREATE: '/admin/ajout-categorie',               // POST (admin)
    UPDATE: (id) => `/admin/categorie/${id}`,       // PUT (admin)
    DELETE: (id) => `/admin/categorie/${id}`,       // DELETE (admin)
  },

  // ── Signalements (liste admin) ────────────────────────────────────────────
  SIGNALEMENTS: {
    LIST: '/admin/signalements',
  },

  // ── Messages clients ──────────────────────────────────────────────────────
  MESSAGES: {
    STATS:    '/admin/messages/stats',
    LIST:     '/admin/messages',
    REPONDRE: (id) => `/admin/messages/${id}/repondre`,
  },
};
