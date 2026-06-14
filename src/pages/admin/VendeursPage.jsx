import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import {
  getVendeurs,
  abonnementManuel,
  suspendreVendeur,
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

function statusBadge(actif, suspendu) {
  if (suspendu) return 'danger';
  if (actif) return 'success';
  return 'default';
}

function statusLabel(actif, suspendu) {
  if (suspendu) return 'Suspendu';
  if (actif) return 'Actif';
  return 'Inactif';
}

export default function VendeursPage() {
  const [vendeurs, setVendeurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [confirmState, setConfirmState] = useState({ open: false, action: null, vendeur: null });

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    try {
      const res = await getVendeurs();
      const list = res.data?.vendeurs || res.data || [];
      setVendeurs(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement des vendeurs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = vendeurs.filter((v) => {
    const s = debouncedSearch.toLowerCase();
    return (
      !s ||
      (v.nom || '').toLowerCase().includes(s) ||
      (v.prenom || '').toLowerCase().includes(s) ||
      (v.email || '').toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  const openConfirm = (action, vendeur) => setConfirmState({ open: true, action, vendeur });
  const closeConfirm = () => setConfirmState({ open: false, action: null, vendeur: null });

  const handleAbonnement = async (vendeur) => {
    try {
      await abonnementManuel(vendeur.id);
      toast.success(`Abonnement activé pour ${vendeur.prenom} ${vendeur.nom}`);
      await load();
    } catch {
      toast.error("Erreur lors de l'activation de l'abonnement");
    }
  };

  const handleSuspendre = async (vendeur) => {
    try {
      await suspendreVendeur(vendeur.id);
      toast.success(`Vendeur ${vendeur.prenom} ${vendeur.nom} suspendu`);
      await load();
    } catch {
      toast.error('Erreur lors de la suspension');
    }
  };

  const handleActiver = async (vendeur) => {
    try {
      await activerUtilisateur(vendeur.id);
      toast.success(`Vendeur ${vendeur.prenom} ${vendeur.nom} activé`);
      await load();
    } catch {
      toast.error("Erreur lors de l'activation");
    }
  };

  const handleSupprimer = async (vendeur) => {
    try {
      await supprimerUtilisateur(vendeur.id);
      toast.success(`Vendeur ${vendeur.prenom} ${vendeur.nom} supprimé`);
      await load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const executeAction = async () => {
    const { action, vendeur } = confirmState;
    if (action === 'suspendre') await handleSuspendre(vendeur);
    if (action === 'activer') await handleActiver(vendeur);
    if (action === 'supprimer') await handleSupprimer(vendeur);
  };

  const confirmMessages = {
    suspendre: (v) => `Voulez-vous suspendre le compte de ${v?.prenom} ${v?.nom} ?`,
    activer: (v) => `Voulez-vous réactiver le compte de ${v?.prenom} ${v?.nom} ?`,
    supprimer: (v) => `Voulez-vous définitivement supprimer ${v?.prenom} ${v?.nom} ? Cette action est irréversible.`,
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Vendeurs — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Vendeurs</h1>
          <p>{vendeurs.length} vendeur(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des vendeurs</span>
          <div className="toolbar-left">
            <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher par nom ou email..." />
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendeur</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Ville</th>
                <th>Abonnement</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <p>{search ? `Aucun résultat pour "${search}"` : 'Aucun vendeur enregistré pour l\'instant'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((v) => (
                <tr key={v.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {v.photoProfil
                        ? <img className="avatar" src={v.photoProfil} alt={v.nom} />
                        : <div className="avatar-placeholder">{(v.prenom?.[0] || '')}{(v.nom?.[0] || '')}</div>
                      }
                      <span className="td-bold">{v.prenom} {v.nom}</span>
                    </div>
                  </td>
                  <td className="td-muted">{v.email || '—'}</td>
                  <td className="td-muted">{v.telephone || '—'}</td>
                  <td className="td-muted">{v.ville || '—'}</td>
                  <td>
                    <Badge variant={v.abonnementActif ? 'success' : 'default'}>
                      {v.abonnementActif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={statusBadge(v.actif, v.suspendu)}>
                      {statusLabel(v.actif, v.suspendu)}
                    </Badge>
                  </td>
                  <td className="td-muted">{formatDate(v.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(v); setDetailOpen(true); }}>
                        Voir
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleAbonnement(v)}>
                        Abonnement
                      </button>
                      {v.suspendu || !v.actif ? (
                        <button className="btn btn-success btn-sm" onClick={() => openConfirm('activer', v)}>
                          Réactiver
                        </button>
                      ) : (
                        <button className="btn btn-warning btn-sm" onClick={() => openConfirm('suspendre', v)}>
                          Suspendre
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => openConfirm('supprimer', v)}>
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

      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Détails du vendeur"
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
              <div className="detail-item"><label>Statut</label><span>{statusLabel(selected.actif, selected.suspendu)}</span></div>
              <div className="detail-item"><label>Abonnement</label><span>{selected.abonnementActif ? 'Actif' : 'Inactif'}</span></div>
              <div className="detail-item"><label>Inscription</label><span>{formatDate(selected.createdAt)}</span></div>
              <div className="detail-item"><label>Boutique</label><span>{selected.boutiques?.nom || '—'}</span></div>
              {selected.adresse && <div className="detail-item full"><label>Adresse</label><span>{selected.adresse}</span></div>}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={confirmState.open}
        onClose={closeConfirm}
        onConfirm={executeAction}
        title={confirmState.action === 'supprimer' ? 'Supprimer le vendeur' : confirmState.action === 'suspendre' ? 'Suspendre le vendeur' : 'Réactiver le vendeur'}
        message={confirmState.vendeur ? (confirmMessages[confirmState.action]?.(confirmState.vendeur) || '') : ''}
        confirmLabel={confirmState.action === 'supprimer' ? 'Supprimer' : confirmState.action === 'suspendre' ? 'Suspendre' : 'Réactiver'}
        variant={confirmState.action === 'supprimer' ? 'danger' : 'warning'}
      />
    </div>
  );
}
