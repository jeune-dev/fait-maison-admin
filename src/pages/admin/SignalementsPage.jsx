import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getSignalements } from '../../api/signalements.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { formatDateTime } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 10;

function signalBadge(statut) {
  if (!statut) return 'default';
  const s = statut.toLowerCase();
  if (s === 'traite' || s === 'traité') return 'success';
  if (s === 'en_cours' || s === 'en cours') return 'warning';
  return 'info';
}

export default function SignalementsPage() {
  const [signalements, setSignalements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    try {
      const res = await getSignalements();
      const list = res.data?.signalements || res.data || [];
      setSignalements(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = signalements.filter((s) => {
    const q = debouncedSearch.toLowerCase();
    return (
      !q ||
      (s.raison || s.motif || s.message || '').toLowerCase().includes(q) ||
      (s.statut || '').toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Signalements — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Signalements</h1>
          <p>{signalements.length} signalement(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des signalements</span>
          <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher..." />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Raison / Motif</th>
                <th>Signalé par</th>
                <th>Cible</th>
                <th>Date</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <p>{search ? `Aucun résultat pour "${search}"` : 'Aucun signalement enregistré pour l\'instant'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((s, i) => (
                <tr key={s.id || i}>
                  <td className="td-muted">{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>
                    <span className="td-bold" style={{ fontSize: '0.88rem' }}>
                      {(s.raison || s.motif || s.message || '—').substring(0, 60)}
                      {(s.raison || s.motif || s.message || '').length > 60 ? '...' : ''}
                    </span>
                  </td>
                  <td className="td-muted signal-meta">
                    {s.signalePar
                      ? `${s.signalePar.prenom || ''} ${s.signalePar.nom || ''}`.trim() || s.signalePar.email || '—'
                      : '—'}
                  </td>
                  <td className="td-muted signal-meta">
                    {s.cible
                      ? `${s.cible.prenom || ''} ${s.cible.nom || ''}`.trim() || s.cible.email || '—'
                      : s.produit?.nom || '—'}
                  </td>
                  <td className="td-muted signal-meta">{formatDateTime(s.createdAt)}</td>
                  <td>
                    <Badge variant={signalBadge(s.statut)}>
                      {s.statut || 'En attente'}
                    </Badge>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(s)}>
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '0.75rem 1.25rem' }}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title="Détail du signalement"
        footer={<button className="btn btn-secondary" onClick={() => setSelected(null)}>Fermer</button>}
      >
        {selected && (
          <div>
            <div className="detail-grid">
              <div className="detail-item"><label>Statut</label>
                <span><Badge variant={signalBadge(selected.statut)}>{selected.statut || 'En attente'}</Badge></span>
              </div>
              <div className="detail-item"><label>Date</label><span>{formatDateTime(selected.createdAt)}</span></div>
              <div className="detail-item">
                <label>Signalé par</label>
                <span>
                  {selected.signalePar
                    ? `${selected.signalePar.prenom || ''} ${selected.signalePar.nom || ''}`.trim() || selected.signalePar.email || '—'
                    : '—'}
                </span>
              </div>
              <div className="detail-item">
                <label>Cible</label>
                <span>
                  {selected.cible
                    ? `${selected.cible.prenom || ''} ${selected.cible.nom || ''}`.trim() || selected.cible.email || '—'
                    : selected.produit?.nom || '—'}
                </span>
              </div>
              <div className="detail-item full">
                <label>Raison / Motif</label>
                <span style={{ whiteSpace: 'pre-wrap' }}>{selected.raison || selected.motif || selected.message || '—'}</span>
              </div>
              {selected.description && (
                <div className="detail-item full">
                  <label>Description</label>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{selected.description}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
