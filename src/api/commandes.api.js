import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.COMMANDES;

export const getCommandes       = (params) => api.get(E.LIST, { params });
export const getStatsEcommerce  = ()       => api.get(E.STATS_ECOMMERCE);
