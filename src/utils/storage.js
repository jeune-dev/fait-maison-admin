export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);
export const removeToken = () => localStorage.removeItem('token');

export const getUser = () => {
  try {
    const raw = localStorage.getItem('utilisateur');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setUser = (u) => localStorage.setItem('utilisateur', JSON.stringify(u));
export const removeUser = () => localStorage.removeItem('utilisateur');

export const clearAuth = () => {
  removeToken();
  removeUser();
};
