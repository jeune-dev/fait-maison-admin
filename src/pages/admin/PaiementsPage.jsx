import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getPaiements } from '../../api/paiements.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatDateTime, formatMontant } from '../../utils/formatters';

const LIMIT = 20;

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'success', label: 'Réussi' },
  { value: 'failed', label: 'Échoué' },
  { value: 'cancelled', label: 'Annulé' },
];

function statutVariant(s) {
  if (s === 'success') return 'success';
  if (s === 'failed' || s === 'cancelled') return 'danger';
  return 'warning';
}

function nomComplet(u) {
  if (!u) return '—';
  return `${u.prenom || ''} ${u.nom || ''}`.trim() || u.email || '—';
}

export default function PaiementsPage() {
  const [paiements, setPaiements] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statut, setStatut] = useState('');
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPaiements({ statut: statut || undefined, page, limit: LIMIT });
      const list = res.data?.paiements || [];
      setPaiements(Array.isArray(list) ? list : []);
      setTotal(res.data?.total || list.length);
    } catch {
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  }, [statut, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));
  const handleStatut = (v) => { setStatut(v); setPage(1); };

  if (loading && paiements.length === 0) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Paiements — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Paiements</h1>
          <p>{total} paiement(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Transactions</span>
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
                <th>Utilisateur</th>
                <th>Type</th>
                <th>Méthode</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {paiements.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Aucun paiement</td></tr>
              )}
              {paiements.map((p) => (
                <tr key={p.id}>
                  <td>{p.referencePaiement || p.transactionId || '—'}</td>
                  <td>{nomComplet(p.utilisateur)}</td>
                  <td>{p.type === 'commande' ? 'Commande' : 'Abonnement'}</td>
                  <td>{p.methode === 'orange_money' ? 'Orange Money' : p.methode === 'wave' ? 'Wave' : p.methode}</td>
                  <td>{formatMontant(p.montant)}</td>
                  <td><Badge variant={statutVariant(p.statut)}>{p.statut}</Badge></td>
                  <td>{formatDateTime(p.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', padding: '1rem' }}>
            <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Précédent</button>
            <span style={{ alignSelf: 'center' }}>Page {page} / {totalPages}</span>
            <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</button>
          </div>
        )}
      </div>
    </div>
  );
}
