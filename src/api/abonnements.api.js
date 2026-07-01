import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.ABONNEMENTS;

export const getAbonnements            = (params)          => api.get(E.LIST, { params });
export const creerAbonnementManuel     = (vendeurId, data) => api.post(E.CREER_MANUEL(vendeurId), data);
export const revoquerAbonnement        = (id)               => api.put(E.REVOQUER(id));
export const getAbonnementsExpiration  = (jours = 30)       => api.get(E.EXPIRATION, { params: { jours } });
