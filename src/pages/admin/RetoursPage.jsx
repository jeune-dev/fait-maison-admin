import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getDemandesRetour, traiterDemandeRetour } from '../../api/retours.api';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 10;

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'acceptee', label: 'Acceptée' },
  { value: 'refusee', label: 'Refusée' },
];

function retourBadgeVariant(statut) {
  const s = (statut || '').toLowerCase();
  if (s === 'acceptee' || s === 'acceptée') return 'success';
  if (s === 'refusee' || s === 'refusée') return 'danger';
  return 'warning';
}

export default function RetoursPage() {
  const [statutFiltre, setStatutFiltre] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const fetcher = useCallback(async () => {
    const res = await getDemandesRetour(statutFiltre ? { statut: statutFiltre } : undefined);
    const list = res.data?.demandes || res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  }, [statutFiltre]);

  const { data, loading, reload } = usePageData(fetcher, 'Erreur lors du chargement des demandes de retour');
  const retours = data || [];

  const [traiterState, setTraiterState] = useState({ open: false, action: null, retour: null });
  const [reponseAdmin, setReponseAdmin] = useState('');
  const [saving, setSaving] = useState(false);

  const openTraiter = (action, retour) => {
    setTraiterState({ open: true, action, retour });
    setReponseAdmin('');
  };
  const closeTraiter = () => setTraiterState({ open: false, action: null, retour: null });

  const handleTraiter = async () => {
    const { action, retour } = traiterState;
    if (!retour) return;
    setSaving(true);
    try {
      await traiterDemandeRetour(retour.id, { action, reponseAdmin });
      toast.success(action === 'accepter' ? 'Demande de retour acceptée' : 'Demande de retour refusée');
      closeTraiter();
      await reload();
    } catch {
      toast.error('Erreur lors du traitement de la demande');
    } finally {
      setSaving(false);
    }
  };

  const filtered = retours.filter((r) => {
    const s = debouncedSearch.toLowerCase();
    return !s || (r.raison || '').toLowerCase().includes(s) || String(r.commandeId || '').includes(s);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleStatutChange = (val) => { setStatutFiltre(val); setPage(1); };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Demandes de retour — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Demandes de retour</h1>
          <p>{retours.length} demande(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des demandes</span>
          <div className="toolbar-left" style={{ flex: 'unset', justifyContent: 'flex-end' }}>
            <select
              className="form-select filter-select"
              value={statutFiltre}
              onChange={(e) => handleStatutChange(e.target.value)}
              aria-label="Filtrer par statut"
            >
              {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher par raison ou commande..." />
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Commande</th>
                <th>Acheteur</th>
                <th>Raison</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <p>{search ? `Aucun résultat pour "${search}"` : 'Aucune demande de retour enregistrée pour l\'instant'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((r) => (
                <tr key={r.id}>
                  <td className="td-bold">#{r.commandeId}</td>
                  <td className="td-muted">#{r.acheteurId}</td>
                  <td className="td-muted" style={{ maxWidth: 320 }}>
                    {(r.raison || '—').substring(0, 80)}{(r.raison || '').length > 80 ? '...' : ''}
                  </td>
                  <td><Badge variant={retourBadgeVariant(r.statut)}>{r.statut || 'En attente'}</Badge></td>
                  <td>
                    <div className="table-actions">
                      {(!r.statut || r.statut.toLowerCase() === 'en_attente') && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => openTraiter('accepter', r)}>Accepter</button>
                          <button className="btn btn-danger btn-sm" onClick={() => openTraiter('refuser', r)}>Refuser</button>
                        </>
                      )}
                    </div>
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
        isOpen={traiterState.open}
        onClose={closeTraiter}
        title={traiterState.action === 'accepter' ? 'Accepter la demande de retour' : 'Refuser la demande de retour'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeTraiter} disabled={saving}>Annuler</button>
            <button
              className={traiterState.action === 'accepter' ? 'btn btn-success' : 'btn btn-danger'}
              onClick={handleTraiter}
              disabled={saving}
            >
              {saving ? 'Traitement...' : (traiterState.action === 'accepter' ? 'Accepter' : 'Refuser')}
            </button>
          </>
        }
      >
        <div className="form-field">
          <label className="form-label" htmlFor="reponseAdmin">Réponse de l&apos;administrateur</label>
          <textarea
            id="reponseAdmin"
            className="form-textarea"
            value={reponseAdmin}
            onChange={(e) => setReponseAdmin(e.target.value)}
            placeholder="Message optionnel à destination de l'acheteur..."
          />
        </div>
      </Modal>
    </div>
  );
}
