import { useEffect, useState, memo } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import {
  getNombreVendeursActifs, getNombreVendeursInactifs,
  getNombreProduitsActifs, getNombreClientsActifs,
  getNombreClientsInactifs, getVendeurs, getClients,
  getRevenusMensuels, getInscriptionsMensuelles,
} from '../../api/admin.api';
import { getStatsEcommerce } from '../../api/commandes.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import MiniBarChart from '../../components/common/MiniBarChart';
import { formatDate, formatMontant } from '../../utils/formatters';

const StatCard = memo(function StatCard({ label, value, color, icon }) {
  return (
    <div className="stat-card">
      <div className={`stat-card-icon ${color}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>{icon}</svg>
      </div>
      <div className="stat-card-value">{value ?? 0}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
});

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [vendeurs, setVendeurs] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Extension : stats e-commerce + graphiques ──────────────────────────────
  const [statsEcommerce, setStatsEcommerce] = useState(null);
  const [revenusMensuels, setRevenusMensuels] = useState([]);
  const [inscriptionsMensuelles, setInscriptionsMensuelles] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [va, vi, pa, ca, ci, vList, cList] = await Promise.all([
          getNombreVendeursActifs(), getNombreVendeursInactifs(),
          getNombreProduitsActifs(), getNombreClientsActifs(),
          getNombreClientsInactifs(), getVendeurs(), getClients(),
        ]);
        setStats({
          vendeursActifs: va.data?.count ?? va.data?.totalVendeurs ?? 0,
          vendeursInactifs: vi.data?.count ?? vi.data?.totalVendeurs ?? 0,
          produitsActifs: pa.data?.count ?? pa.data?.totalProduits ?? 0,
          clientsActifs: ca.data?.count ?? ca.data?.totalClients ?? 0,
          clientsInactifs: ci.data?.count ?? ci.data?.totalClients ?? 0,
        });
        const vl = vList.data?.vendeurs || vList.data || [];
        const cl = cList.data?.clients || cList.data || [];
        setVendeurs(Array.isArray(vl) ? vl.slice(0, 5) : []);
        setClients(Array.isArray(cl) ? cl.slice(0, 5) : []);
      } catch {
        toast.error('Erreur lors du chargement du tableau de bord');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadExtra = async () => {
      try {
        const [se, rm, im] = await Promise.all([
          getStatsEcommerce(), getRevenusMensuels(), getInscriptionsMensuelles(),
        ]);
        setStatsEcommerce(se.data?.stats || se.data || null);
        const rmList = rm.data?.revenus || rm.data?.data || rm.data || [];
        const imList = im.data?.inscriptions || im.data?.data || im.data || [];
        setRevenusMensuels(Array.isArray(rmList) ? rmList : []);
        setInscriptionsMensuelles(Array.isArray(imList) ? imList : []);
      } catch {
        toast.error('Erreur lors du chargement des statistiques avancées');
      } finally {
        setLoadingExtra(false);
      }
    };
    loadExtra();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet><title>Vue d&apos;ensemble — Fait Maison Admin</title></Helmet>
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Vue d&apos;ensemble</h1>
            <p>Statistiques générales de la plateforme</p>
          </div>
        </div>

        <div className="stats-grid">
          <StatCard label="Vendeurs actifs" value={stats?.vendeursActifs} color="green"
            icon={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>} />
          <StatCard label="Vendeurs inactifs" value={stats?.vendeursInactifs} color="gray"
            icon={<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></>} />
          <StatCard label="Clients actifs" value={stats?.clientsActifs} color="blue"
            icon={<><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></>} />
          <StatCard label="Clients inactifs" value={stats?.clientsInactifs} color="gold"
            icon={<><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></>} />
          <StatCard label="Produits actifs" value={stats?.produitsActifs} color="red"
            icon={<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></>} />
        </div>

        <div className="dashboard-grid">
          <div className="card">
            <div className="card-header"><span className="card-title">Vendeurs récents</span></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Nom</th><th>Email</th><th>Statut</th></tr></thead>
                <tbody>
                  {vendeurs.length === 0
                    ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1.5rem' }}>Aucun vendeur</td></tr>
                    : vendeurs.map((v) => (
                        <tr key={v.id}>
                          <td className="td-bold">{v.prenom} {v.nom}</td>
                          <td className="td-muted">{v.email || '—'}</td>
                          <td><Badge variant={v.actif ? 'success' : 'default'}>{v.actif ? 'Actif' : 'Inactif'}</Badge></td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
          <div className="card">
            <div className="card-header"><span className="card-title">Clients récents</span></div>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Nom</th><th>Email</th><th>Inscription</th></tr></thead>
                <tbody>
                  {clients.length === 0
                    ? <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1.5rem' }}>Aucun client</td></tr>
                    : clients.map((c) => (
                        <tr key={c.id}>
                          <td className="td-bold">{c.prenom} {c.nom}</td>
                          <td className="td-muted">{c.email || '—'}</td>
                          <td className="td-muted">{formatDate(c.createdAt)}</td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Extension : statistiques e-commerce avancées ──────────────────── */}
        {!loadingExtra && statsEcommerce && (
          <div className="stats-grid">
            <StatCard label="Commandes totales" value={statsEcommerce.commandes_total} color="blue"
              icon={<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></>} />
            <StatCard label="Montant total" value={formatMontant(statsEcommerce.montant_total)} color="green"
              icon={<><circle cx="12" cy="12" r="10"/><path d="M12 6v12M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1.1-3 2.5 1.3 2.5 3 2.5 3 1.1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5"/></>} />
            <StatCard label="Commandes livrées" value={statsEcommerce.commandes_livrees} color="gold"
              icon={<><path d="M20 6 9 17l-5-5"/></>} />
          </div>
        )}

        {!loadingExtra && (revenusMensuels.length > 0 || inscriptionsMensuelles.length > 0) && (
          <div className="dashboard-grid">
            <div className="card">
              <div className="card-header"><span className="card-title">Revenus mensuels</span></div>
              <div className="card-body">
                <MiniBarChart data={revenusMensuels} labelKey="mois" valueKey="revenu" formatValue={formatMontant} />
              </div>
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Inscriptions mensuelles</span></div>
              <div className="card-body">
                <MiniBarChart data={inscriptionsMensuelles} labelKey="mois" valueKey="nombre" />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
