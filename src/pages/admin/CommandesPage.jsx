import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getCommandes, getStatsEcommerce } from '../../api/commandes.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatDateTime, formatMontant } from '../../utils/formatters';

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirmee', label: 'Confirmée' },
  { value: 'en_preparation', label: 'En préparation' },
  { value: 'prete', label: 'Prête' },
  { value: 'en_livraison', label: 'En livraison' },
  { value: 'livree', label: 'Livrée' },
  { value: 'annulee', label: 'Annulée' },
];

const STATUT_LABEL = Object.fromEntries(STATUTS.map((s) => [s.value, s.label]));

function statutVariant(statut) {
  if (statut === 'livree') return 'success';
  if (statut === 'annulee') return 'danger';
  if (statut === 'en_livraison' || statut === 'prete') return 'warning';
  return 'info';
}

function nomComplet(u) {
  if (!u) return '—';
  return `${u.prenom || ''} ${u.nom || ''}`.trim() || '—';
}

export default function CommandesPage() {
  const [commandes, setCommandes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [resCmd, resStats] = await Promise.all([
        getCommandes({ statut: statut || undefined, page, limit: 20 }),
        page === 1 ? getStatsEcommerce() : Promise.resolve(null),
      ]);
      const list = resCmd.data?.commandes || [];
      setCommandes(Array.isArray(list) ? list : []);
      if (resCmd.data?.pagination) setPagination(resCmd.data.pagination);
      if (resStats) setStats(resStats.data);
    } catch {
      toast.error('Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  }, [statut, page]);

  useEffect(() => { load(); }, [load]);

  const handleStatut = (v) => { setStatut(v); setPage(1); };

  if (loading && commandes.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Commandes — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Commandes</h1>
          <p>Suivi des commandes e-commerce</p>
        </div>
      </div>

      {/* Statistiques e-commerce */}
      {stats && (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard label="Chiffre d'affaires" value={formatMontant(stats.chiffreAffaires)} />
          <StatCard label="Commandes totales" value={stats.totalCommandes} />
          <StatCard label="Commandes payées" value={stats.commandesPayees} />
          <StatCard label="Panier moyen" value={formatMontant(stats.panierMoyen)} />
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des commandes</span>
          <select
            className="form-select"
            value={statut}
            onChange={(e) => handleStatut(e.target.value)}
            style={{ padding: '0.5rem 0.75rem', borderRadius: 8 }}
          >
            {STATUTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Acheteur</th>
                <th>Vendeur</th>
                <th>Articles</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {commandes.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Aucune commande</td></tr>
              )}
              {commandes.map((c) => {
                const nbArticles = (c.lignes || []).reduce((s, l) => s + (l.quantite || 0), 0);
                return (
                  <tr key={c.id}>
                    <td>{c.referenceCommande}</td>
                    <td>{nomComplet(c.acheteur)}</td>
                    <td>{nomComplet(c.vendeur)}</td>
                    <td>{nbArticles}</td>
                    <td>{formatMontant(c.montantTotal)}</td>
                    <td><Badge variant={statutVariant(c.statut)}>{STATUT_LABEL[c.statut] || c.statut}</Badge></td>
                    <td>
                      <Badge variant={c.statutPaiement === 'paye' ? 'success' : c.statutPaiement === 'rembourse' ? 'warning' : 'default'}>
                        {c.statutPaiement === 'paye' ? 'Payé' : c.statutPaiement === 'rembourse' ? 'Remboursé' : 'Non payé'}
                      </Badge>
                    </td>
                    <td>{formatDateTime(c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination simple basée sur le backend */}
        {pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }}>
            <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</button>
            <span style={{ alignSelf: 'center' }}>Page {page} / {pagination.totalPages}</span>
            <button className="btn btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: '1rem 1.25rem' }}>
      <div style={{ fontSize: '0.8rem', color: '#7A8473', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1A1A1A' }}>{value}</div>
    </div>
  );
}
