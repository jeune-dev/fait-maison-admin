import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import Topbar from '../layout/Topbar';
import { ROUTES } from '../../constants/routes';
import useInactivityLogout from '../../hooks/useInactivityLogout';
import { useAuth } from '../../hooks/useAuth';

const PAGE_TITLES = {
  [ROUTES.DASHBOARD]: { title: "Vue d'ensemble", sub: "Tableau de bord" },
  [ROUTES.VENDEURS]: { title: "Vendeurs", sub: "Gestion des vendeurs" },
  [ROUTES.ACHETEURS]: { title: "Acheteurs", sub: "Gestion des acheteurs" },
  [ROUTES.PRODUITS]: { title: "Produits", sub: "Gestion des produits actifs" },
  [ROUTES.CATEGORIES]: { title: "Catégories", sub: "Gestion des catégories" },
  [ROUTES.COMMANDES]: { title: "Commandes", sub: "Suivi des commandes e-commerce" },
  [ROUTES.PAIEMENTS]: { title: "Paiements", sub: "Transactions et paiements" },
  [ROUTES.ABONNEMENTS]: { title: "Abonnements", sub: "Abonnements vendeurs" },
  [ROUTES.MODERATION]: { title: "Modération", sub: "Produits en attente de validation" },
  [ROUTES.NOTIFICATIONS]: { title: "Notifications", sub: "Envoi de notifications globales" },
  [ROUTES.SIGNALEMENTS]: { title: "Signalements", sub: "Gestion des signalements" },
  [ROUTES.CONFIG]:  { title: "Configuration",    sub: "Paramètres de l'application" },
  [ROUTES.ADMINS]:  { title: "Administrateurs",  sub: "Gestion des administrateurs" },
  [ROUTES.MENUS]:   { title: "Menus",            sub: "Gestion des menus de navigation" },
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();
  const pageInfo = PAGE_TITLES[pathname] || { title: 'Dashboard', sub: '' };
  const { logout } = useAuth();

  useInactivityLogout(logout);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="admin-layout">
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} aria-hidden="true" />
      )}
      <Sidebar
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className={`admin-main${sidebarOpen ? '' : ' sidebar-closed'}`}>
        <Topbar
          pageTitle={pageInfo.title}
          pageSub={pageInfo.sub}
          onMobileMenuToggle={() => setMobileOpen((o) => !o)}
        />
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
