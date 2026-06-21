import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.ADMIN;

// Abonnements
export const getAbonnements = () => api.get(E.ABONNEMENTS);
export const getAbonnementsExpiration = () => api.get(E.ABONNEMENTS_EXPIRATION);
export const revoquerAbonnement = (id) => api.put(E.REVOQUER_ABONNEMENT(id));

// Modération produits
export const getProduitsEnAttente = () => api.get(E.PRODUITS_EN_ATTENTE);
export const approuverProduit = (id) => api.put(E.APPROUVER_PRODUIT(id));
export const rejeterProduit = (id) => api.put(E.REJETER_PRODUIT(id));

// Notification globale
export const envoyerNotificationGlobale = (payload) =>
  api.post(E.NOTIFICATION_GLOBALE, payload);
