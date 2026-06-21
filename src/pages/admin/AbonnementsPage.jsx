import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getAbonnements, revoquerAbonnement } from '../../api/moderation.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { formatDate, formatMontant } from '../../utils/formatters';

export default function AbonnementsPage() {
  const [abonnements, setAbonnements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAbonnements();
      const list = res.data?.abonnements || res.data || [];
      setAbonnements(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement des abonnements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const revoquer = async (id) => {
    setBusy(id);
    try {
      await revoquerAbonnement(id);
      toast.success('Abonnement révoqué');
      load();
    } catch {
      toast.error('Échec de la révocation');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Abonnements — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Abonnements</h1>
          <p>{abonnements.length} abonnement(s)</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Liste des abonnements</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendeur</th>
                <th>Type</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {abonnements.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Aucun abonnement</td></tr>
              )}
              {abonnements.map((a) => {
                const u = a.utilisateur;
                return (
                  <tr key={a.id}>
                    <td>{u ? `${u.prenom || ''} ${u.nom || ''}`.trim() : '—'}</td>
                    <td>{a.type}</td>
                    <td>{formatDate(a.dateDebut)}</td>
                    <td>{formatDate(a.dateFin)}</td>
                    <td>{formatMontant(a.montant)}</td>
                    <td><Badge variant={a.statut === 'actif' ? 'success' : 'default'}>{a.statut}</Badge></td>
                    <td>
                      {a.statut === 'actif' && (
                        <button className="btn btn-danger" disabled={busy === a.id}
                          onClick={() => revoquer(a.id)}>Révoquer</button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
