import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

export const getSignalements = () => api.get(ENDPOINTS.SIGNALEMENTS.LIST);
