import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import {
  getClients,
  supprimerUtilisateur,
  activerUtilisateur,
} from '../../api/admin.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 10;

export default function AcheteursPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, action: null, client: null });

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    try {
      const res = await getClients();
      const list = res.data?.clients || res.data || [];
      setClients(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement des acheteurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = clients.filter((c) => {
    const s = debouncedSearch.toLowerCase();
    return (
      !s ||
      (c.nom || '').toLowerCase().includes(s) ||
      (c.prenom || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  const openConfirm = (action, client) => setConfirmState({ open: true, action, client });
  const closeConfirm = () => setConfirmState({ open: false, action: null, client: null });

  const handleActiver = async (client) => {
    try {
      await activerUtilisateur(client.id);
      toast.success(`Client ${client.prenom} ${client.nom} activé`);
      await load();
    } catch {
      toast.error("Erreur lors de l'activation");
    }
  };

  const handleSupprimer = async (client) => {
    try {
      await supprimerUtilisateur(client.id);
      toast.success(`Client ${client.prenom} ${client.nom} supprimé`);
      await load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const executeAction = async () => {
    const { action, client } = confirmState;
    if (action === 'activer') await handleActiver(client);
    if (action === 'supprimer') await handleSupprimer(client);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Acheteurs — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Acheteurs</h1>
          <p>{clients.length} acheteur(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des acheteurs</span>
          <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher par nom ou email..." />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Inscription</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <p>{search ? `Aucun résultat pour "${search}"` : 'Aucun acheteur enregistré pour l\'instant'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {c.photoProfil
                        ? <img className="avatar" src={c.photoProfil} alt={c.nom} />
                        : <div className="avatar-placeholder">{(c.prenom?.[0] || '')}{(c.nom?.[0] || '')}</div>
                      }
                      <span className="td-bold">{c.prenom} {c.nom}</span>
                    </div>
                  </td>
                  <td className="td-muted">{c.email || '—'}</td>
                  <td className="td-muted">{c.telephone || '—'}</td>
                  <td className="td-muted">{formatDate(c.createdAt)}</td>
                  <td>
                    <Badge variant={c.actif ? 'success' : 'default'}>
                      {c.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(c); setDetailOpen(true); }}>
                        Voir
                      </button>
                      {!c.actif && (
                        <button className="btn btn-success btn-sm" onClick={() => openConfirm('activer', c)}>
                          Activer
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => openConfirm('supprimer', c)}>
                        Supprimer
                      </button>
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

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Détails de l'acheteur"
        footer={<button className="btn btn-secondary" onClick={() => setDetailOpen(false)}>Fermer</button>}
      >
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '1.25rem' }}>
              {selected.photoProfil
                ? <img className="avatar" src={selected.photoProfil} alt={selected.nom} style={{ width: 56, height: 56 }} />
                : <div className="avatar-placeholder" style={{ width: 56, height: 56, fontSize: '1.2rem' }}>{(selected.prenom?.[0] || '')}{(selected.nom?.[0] || '')}</div>
              }
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selected.prenom} {selected.nom}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>{selected.email}</div>
              </div>
            </div>
            <div className="detail-grid">
              <div className="detail-item"><label>Téléphone</label><span>{selected.telephone || '—'}</span></div>
              <div className="detail-item"><label>Ville</label><span>{selected.ville || '—'}</span></div>
              <div className="detail-item"><label>Statut</label><span>{selected.actif ? 'Actif' : 'Inactif'}</span></div>
              <div className="detail-item"><label>Inscription</label><span>{formatDate(selected.createdAt)}</span></div>
              {selected.adresse && <div className="detail-item full"><label>Adresse</label><span>{selected.adresse}</span></div>}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmState.open}
        onClose={closeConfirm}
        onConfirm={executeAction}
        title={confirmState.action === 'supprimer' ? "Supprimer l'acheteur" : "Activer l'acheteur"}
        message={
          confirmState.action === 'supprimer'
            ? `Voulez-vous définitivement supprimer ${confirmState.client?.prenom} ${confirmState.client?.nom} ?`
            : `Voulez-vous activer le compte de ${confirmState.client?.prenom} ${confirmState.client?.nom} ?`
        }
        confirmLabel={confirmState.action === 'supprimer' ? 'Supprimer' : 'Activer'}
        variant={confirmState.action === 'supprimer' ? 'danger' : 'warning'}
      />
    </div>
  );
}
