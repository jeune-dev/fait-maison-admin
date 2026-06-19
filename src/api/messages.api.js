import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.MESSAGES;

export const getStatsMessages  = ()          => api.get(E.STATS);
export const getMessages       = (params)    => api.get(E.LIST, { params });
export const repondreMessage   = (id, reponse) => api.post(E.REPONDRE(id), { reponse });
