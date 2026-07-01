import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.NOTIFICATION_GLOBALE;

export const envoyerNotificationGlobale = (data) => api.post(E.ENVOYER, data);
