import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.ADMIN;

// ── Listes ────────────────────────────────────────────────────────────────
export const getVendeurs      = ()         => api.get(E.VENDEURS);
export const getClients       = ()         => api.get(E.CLIENTS);
export const getProduitsActifs = ()        => api.get(E.PRODUITS_ACTIFS);

// ── Compteurs ─────────────────────────────────────────────────────────────
export const getNombreVendeursActifs   = () => api.get(E.NOMBRE_VENDEURS_ACTIFS);
export const getNombreVendeursInactifs = () => api.get(E.NOMBRE_VENDEURS_INACTIFS);
export const getNombreProduitsActifs   = () => api.get(E.NOMBRE_PRODUITS_ACTIFS);
export const getNombreClientsActifs    = () => api.get(E.NOMBRE_CLIENTS_ACTIFS);
export const getNombreClientsInactifs  = () => api.get(E.NOMBRE_CLIENTS_INACTIFS);

// ── Actions vendeurs ──────────────────────────────────────────────────────
export const abonnementManuel = (vendeurId) => api.post(E.ABONNEMENT_MANUEL(vendeurId));
export const suspendreVendeur = (vendeurId) => api.post(E.SUSPENDRE_VENDEUR(vendeurId));

// ── Actions utilisateurs ──────────────────────────────────────────────────
export const supprimerUtilisateur = (userId) => api.delete(E.SUPPRIMER_UTILISATEUR(userId));
export const activerUtilisateur   = (userId) => api.put(E.ACTIVER_UTILISATEUR(userId));

// ── Configuration ─────────────────────────────────────────────────────────
export const getPrixAbonnement    = ()      => api.get(E.PRIX_ABONNEMENT);
export const updatePrixAbonnement = (prix)  => api.put(E.UPDATE_PRIX_ABONNEMENT, { prix });

// ── Vérification vendeur ──────────────────────────────────────────────────
export const verifierVendeur = (id) => api.put(E.VERIFIER_VENDEUR(id));

// ── Modération produits ────────────────────────────────────────────────────
export const getProduitsEnAttente = ()            => api.get(E.PRODUITS_EN_ATTENTE);
export const approuverProduit     = (id)          => api.put(E.APPROUVER_PRODUIT(id));
export const rejeterProduit       = (id, raison)  => api.put(E.REJETER_PRODUIT(id), { raison });
export const supprimerProduit     = (id)          => api.delete(E.SUPPRIMER_PRODUIT(id));

// ── Boutique ───────────────────────────────────────────────────────────────
export const supprimerBoutique = (id) => api.delete(E.SUPPRIMER_BOUTIQUE(id));

// ── Statistiques avancées ─────────────────────────────────────────────────
export const getRevenusMensuels        = () => api.get(E.REVENUS_MENSUELS);
export const getInscriptionsMensuelles = () => api.get(E.INSCRIPTIONS_MENSUELLES);
