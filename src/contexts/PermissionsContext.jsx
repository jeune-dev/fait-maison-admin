import { createContext, useContext, useMemo } from 'react';
import { AuthContext } from './AuthContext';

export const PermissionsContext = createContext(null);

export function PermissionsProvider({ children }) {
  const { user, menus } = useContext(AuthContext);

  const hasPermission = useMemo(() => (code, action = 'canView') => {
    if (!menus || !code) return false;
    const menu = menus.find((m) => m.code === code);
    if (!menu) return false;
    return menu.permissions?.[action] === true;
  }, [menus]);

  const canView   = useMemo(() => (code) => hasPermission(code, 'canView'),   [hasPermission]);
  const canCreate = useMemo(() => (code) => hasPermission(code, 'canCreate'), [hasPermission]);
  const canUpdate = useMemo(() => (code) => hasPermission(code, 'canUpdate'), [hasPermission]);
  const canDelete = useMemo(() => (code) => hasPermission(code, 'canDelete'), [hasPermission]);

  const isSuperAdmin = user?.role === 'SuperAdmin';

  return (
    <PermissionsContext.Provider value={{ menus: menus || [], hasPermission, canView, canCreate, canUpdate, canDelete, isSuperAdmin }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export const usePermissions = () => useContext(PermissionsContext);
