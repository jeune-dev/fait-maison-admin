import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.AUDIT_LOGS;

export const getAuditLogs = (params) => api.get(E.LIST, { params });
