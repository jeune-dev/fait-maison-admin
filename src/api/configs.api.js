import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.CONFIGS;

export const getConfigs    = ()          => api.get(E.LIST);
export const createConfig  = (data)      => api.post(E.CREATE, data);
export const updateConfig  = (cle, data) => api.put(E.UPDATE(cle), data);
