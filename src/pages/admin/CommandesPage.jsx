import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { getCommandes } from '../../api/commandes.api';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDate, formatMontant, formatStatut } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 10;

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'livree', label: 'Livrée' },
  { value: 'annulee', label: 'Annulée' },
];

function commandeBadgeVariant(statut) {
  const s = (statut || '').toLowerCase();
  if (['livree', 'livré', 'livrée', 'traite'].includes(s)) return 'success';
  if (['annulee', 'annulée', 'refuse', 'refusee'].includes(s)) return 'danger';
  if (['en_cours', 'en cours'].includes(s)) return 'warning';
  return 'info';
}

export default function CommandesPage() {
  const [statutFiltre, setStatutFiltre] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const fetcher = useCallback(async () => {
    const res = await getCommandes(statutFiltre ? { statut: statutFiltre } : undefined);
    const list = res.data?.commandes || res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  }, [statutFiltre]);

  const { data, loading } = usePageData(fetcher, 'Erreur lors du chargement des commandes');
  const commandes = data || [];

  const filtered = commandes.filter((c) => {
    const s = debouncedSearch.toLowerCase();
    return (
      !s ||
      (c.ref || '').toLowerCase().includes(s) ||
      (c.acheteur?.nom || c.acheteur || '').toString().toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleStatutChange = (val) => { setStatutFiltre(val); setPage(1); };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Commandes — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Commandes</h1>
          <p>{commandes.length} commande(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des commandes</span>
          <div className="toolbar-left" style={{ flex: 'unset', justifyContent: 'flex-end' }}>
            <select
              className="form-select filter-select"
              value={statutFiltre}
              onChange={(e) => handleStatutChange(e.target.value)}
              aria-label="Filtrer par statut"
            >
              {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher par référence..." />
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Acheteur</th>
                <th>Vendeur</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <p>{search ? `Aucun résultat pour "${search}"` : 'Aucune commande enregistrée pour l\'instant'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((c) => (
                <tr key={c.id}>
                  <td className="td-bold">{c.ref || `#${c.id}`}</td>
                  <td className="td-muted">
                    {typeof c.acheteur === 'string' ? c.acheteur : `${c.acheteur?.prenom || ''} ${c.acheteur?.nom || ''}`.trim() || c.acheteur?.email || '—'}
                  </td>
                  <td className="td-muted">
                    {typeof c.vendeur === 'string' ? c.vendeur : `${c.vendeur?.prenom || ''} ${c.vendeur?.nom || ''}`.trim() || '—'}
                  </td>
                  <td className="td-bold">{formatMontant(c.montant)}</td>
                  <td>
                    <Badge variant={commandeBadgeVariant(c.statut)}>{formatStatut(c.statut)}</Badge>
                  </td>
                  <td className="td-muted">{formatDate(c.createdAt || c.date)}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelected(c)}>Voir</button>
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
        title="Détail de la commande"
        footer={<button className="btn btn-secondary" onClick={() => setSelected(null)}>Fermer</button>}
      >
        {selected && (
          <div className="detail-grid">
            <div className="detail-item"><label>Référence</label><span>{selected.ref || `#${selected.id}`}</span></div>
            <div className="detail-item"><label>Statut</label>
              <span><Badge variant={commandeBadgeVariant(selected.statut)}>{formatStatut(selected.statut)}</Badge></span>
            </div>
            <div className="detail-item">
              <label>Acheteur</label>
              <span>{typeof selected.acheteur === 'string' ? selected.acheteur : `${selected.acheteur?.prenom || ''} ${selected.acheteur?.nom || ''}`.trim() || selected.acheteur?.email || '—'}</span>
            </div>
            <div className="detail-item">
              <label>Vendeur</label>
              <span>{typeof selected.vendeur === 'string' ? selected.vendeur : `${selected.vendeur?.prenom || ''} ${selected.vendeur?.nom || ''}`.trim() || '—'}</span>
            </div>
            <div className="detail-item"><label>Montant</label><span>{formatMontant(selected.montant)}</span></div>
            <div className="detail-item"><label>Date</label><span>{formatDate(selected.createdAt || selected.date)}</span></div>
          </div>
        )}
      </Modal>
    </div>
  );
}
