import { createContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMe } from '../api/auth.api';
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/storage';

export const AuthContext = createContext(null);

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [menus, setMenus] = useState(() => {
    try { return JSON.parse(localStorage.getItem('menus') || '[]'); } catch { return []; }
  });

  const clearSession = useCallback(() => {
    removeToken();
    removeUser();
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('menus');
    setTokenState(null);
    setUserState(null);
    setMenus([]);
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedToken = getToken();
      if (!storedToken) { setIsLoading(false); return; }
      if (isTokenExpired(storedToken)) { clearSession(); setIsLoading(false); return; }
      try {
        const res = await getMe();
        const utilisateur = res.data?.utilisateur || res.data;
        if (utilisateur && utilisateur.role === 'Admin') {
          setToken(storedToken);
          setUser(utilisateur);
          setTokenState(storedToken);
          setUserState(utilisateur);
        } else {
          clearSession();
        }
      } catch {
        const storedUser = getUser();
        if (storedUser && storedUser.role === 'Admin') {
          setTokenState(storedToken);
          setUserState(storedUser);
        } else {
          clearSession();
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const response = await apiLogin(email, password);
    const { token: newToken, refreshToken, utilisateur, menus: menusData } = response.data;
    setToken(newToken);
    setUser(utilisateur);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    const resolvedMenus = menusData || [];
    localStorage.setItem('menus', JSON.stringify(resolvedMenus));
    setTokenState(newToken);
    setUserState(utilisateur);
    setMenus(resolvedMenus);
    return utilisateur;
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    clearSession();
    window.location.href = '/login';
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, token, menus, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
