import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.ADMIN;

export const getPaiements = (params = {}) =>
  api.get(E.PAIEMENTS, { params });

export const getPaiementsEchoues = () => api.get(E.PAIEMENTS_ECHECS);
