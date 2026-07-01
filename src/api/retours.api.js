import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.RETOURS;

export const getDemandesRetour    = (params)      => api.get(E.LIST, { params });
export const traiterDemandeRetour = (id, data)    => api.put(E.TRAITER(id), data);
