import { NavLink } from "react-router-dom";
import LOGO from "../../assets/images/logo.jpeg";
import { useAuth } from "../../hooks/useAuth";
import { usePermissions } from "../../contexts/PermissionsContext";

// Map code → icône SVG (contenu JSX inner du <svg>)
const ICON_MAP = {
  DASHBOARD:    <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></>,
  VENDEURS:     <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  ACHETEURS:    <><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><path d="M16 3.13a4 4 0 0 1 0 7.75M21 21v-2a4 4 0 0 0-3-3.87"/></>,
  PRODUITS:     <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></>,
  CATEGORIES:   <><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></>,
  COMMANDES:    <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  PAIEMENTS:    <><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></>,
  ABONNEMENTS:  <><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  MODERATION:   <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  NOTIFICATIONS:<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  SIGNALEMENTS: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  ADMINS:       <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  MENUS:        <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  CONFIG:       <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
};

// Icône générique si code non mappé
const DEFAULT_ICON = <><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>;

export default function Sidebar({ isOpen, setIsOpen, mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const { menus } = usePermissions();
  const initials = user ? `${(user.nom || '')[0] || ''}${(user.prenom || '')[0] || ''}`.toUpperCase() : 'A';

  // La page "Notifications" est retirée du dashboard.
  const navItems = menus
    .filter((menu) => menu.code !== 'NOTIFICATIONS')
    .map((menu) => ({
      to: menu.path,
      label: menu.name,
      code: menu.code,
      icon: ICON_MAP[menu.code] || DEFAULT_ICON,
      end: menu.path === '/',
    }));

  return (
    <aside className={`sidebar${isOpen ? '' : ' closed'}${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-top">
        <img className="sidebar-logo" src={LOGO} alt="Fait Maison" />
        <div className="sidebar-brand">
          <div className="sidebar-brand-name">Fait Maison</div>
          <div className="sidebar-brand-sub">Administration</div>
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => { setIsOpen((o) => !o); if (setMobileOpen) setMobileOpen(false); }}
          title={isOpen ? 'Réduire' : 'Développer'}
          aria-label={isOpen ? 'Réduire la sidebar' : 'Développer la sidebar'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points={isOpen ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}/>
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav" role="navigation" aria-label="Navigation principale">
        {navItems.length === 0 && (
          <div className="sidebar-section" style={{ opacity: 0.5, fontSize: '0.75rem', padding: '1rem' }}>
            Aucun menu disponible
          </div>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            aria-label={item.label}
            title={!isOpen ? item.label : undefined}
          >
            <span className="sidebar-item-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                {item.icon}
              </svg>
            </span>
            <span className="sidebar-item-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-foot">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar" aria-hidden="true">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user ? `${user.prenom || ''} ${user.nom || ''}`.trim() : 'Admin'}</div>
            <div className="sidebar-user-role">{user?.role || 'Admin'}</div>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Déconnexion" aria-label="Se déconnecter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
