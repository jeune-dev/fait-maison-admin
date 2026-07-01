import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.PAIEMENTS;

export const getPaiements       = (params) => api.get(E.LIST, { params });
export const getPaiementsEchecs = (params) => api.get(E.ECHECS, { params });
