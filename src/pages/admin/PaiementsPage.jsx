import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { getPaiements, getPaiementsEchecs } from '../../api/paiements.api';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { formatDateTime, formatMontant, formatStatut } from '../../utils/formatters';

const PAGE_SIZE = 10;

function paiementBadgeVariant(statut) {
  const s = (statut || '').toLowerCase();
  if (['reussi', 'réussi', 'valide', 'validé', 'traite'].includes(s)) return 'success';
  if (['echec', 'échec', 'refuse', 'refusé'].includes(s)) return 'danger';
  if (['en_cours', 'en cours', 'en_attente'].includes(s)) return 'warning';
  return 'default';
}

export default function PaiementsPage() {
  const [tab, setTab] = useState('tous');
  const [page, setPage] = useState(1);

  const fetcherTous = useCallback(async () => {
    const res = await getPaiements();
    const list = res.data?.paiements || res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  }, []);

  const fetcherEchecs = useCallback(async () => {
    const res = await getPaiementsEchecs();
    const list = res.data?.paiements || res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  }, []);

  const {
    data: dataTous, loading: loadingTous,
  } = usePageData(fetcherTous, 'Erreur lors du chargement des paiements');

  const {
    data: dataEchecs, loading: loadingEchecs,
  } = usePageData(fetcherEchecs, 'Erreur lors du chargement des paiements échoués');

  const paiementsTous = dataTous || [];
  const paiementsEchecs = dataEchecs || [];

  const list = tab === 'echecs' ? paiementsEchecs : paiementsTous;
  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  const paginated = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTab = (t) => { setTab(t); setPage(1); };

  const loading = tab === 'echecs' ? loadingEchecs : loadingTous;

  return (
    <div>
      <Helmet><title>Paiements — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Paiements</h1>
          <p>{paiementsTous.length} paiement(s) au total — {paiementsEchecs.length} échec(s)</p>
        </div>
      </div>

      <div className="tabs-bar">
        <button className={`tab-btn${tab === 'tous' ? ' active' : ''}`} onClick={() => handleTab('tous')}>
          Tous les paiements
        </button>
        <button className={`tab-btn${tab === 'echecs' ? ' active' : ''}`} onClick={() => handleTab('echecs')}>
          Paiements échoués
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">{tab === 'echecs' ? 'Paiements échoués' : 'Liste des paiements'}</span>
        </div>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Montant</th>
                    <th>Type</th>
                    <th>Statut</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <p>Aucun paiement {tab === 'echecs' ? 'échoué ' : ''}enregistré pour l&apos;instant</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginated.map((p) => (
                    <tr key={p.id}>
                      <td className="td-muted">#{p.id}</td>
                      <td className="td-bold">{formatMontant(p.montant)}</td>
                      <td className="td-muted">{p.type || '—'}</td>
                      <td><Badge variant={paiementBadgeVariant(p.statut)}>{formatStatut(p.statut)}</Badge></td>
                      <td className="td-muted">{formatDateTime(p.date || p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0.75rem 1.25rem' }}>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
