import api from './axiosInstance';
import { ENDPOINTS } from '../constants/endpoints';

const R = ENDPOINTS.RBAC;

// ── Admins ────────────────────────────────────────────────────────────────
export const getAdmins           = ()           => api.get(R.ADMINS);
export const creerAdmin          = (data)       => api.post(R.ADMINS, data);
export const supprimerAdmin      = (id)         => api.delete(R.ADMIN_BY_ID(id));
export const getAdminPermissions = (id)         => api.get(R.ADMIN_PERMISSIONS(id));
export const updateAdminPerms    = (id, perms)  => api.put(R.ADMIN_PERMISSIONS(id), { permissions: perms });

// ── Menus ─────────────────────────────────────────────────────────────────
export const getMenus    = ()         => api.get(R.MENUS);
export const creerMenu   = (data)     => api.post(R.MENUS, data);
export const updateMenu  = (id, data) => api.put(R.MENU_BY_ID(id), data);
export const supprimerMenu = (id)     => api.delete(R.MENU_BY_ID(id));
