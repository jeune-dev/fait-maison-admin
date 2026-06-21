import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

export const login        = (email, password) => api.post(ENDPOINTS.AUTH.LOGIN, { email, mot_de_passe: password });
export const logout       = ()                => api.post(ENDPOINTS.AUTH.LOGOUT);
export const refreshToken = ()                => api.post(ENDPOINTS.AUTH.REFRESH);
export const getMe        = ()                => api.get(ENDPOINTS.AUTH.ME);
