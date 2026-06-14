import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const E = ENDPOINTS.CATEGORIES;

export const getCategories    = ()          => api.get(E.LIST);
export const createCategorie  = (data)      => api.post(E.CREATE, data);
export const updateCategorie  = (id, data)  => api.put(E.UPDATE(id), data);
export const deleteCategorie  = (id)        => api.delete(E.DELETE(id));
