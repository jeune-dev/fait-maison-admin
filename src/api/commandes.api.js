import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.ADMIN;

export const getCommandes = (params = {}) =>
  api.get(E.COMMANDES, { params });

export const getStatsEcommerce = () => api.get(E.STATS_ECOMMERCE);
