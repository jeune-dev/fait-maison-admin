import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import {
  getVendeurs,
  abonnementManuel,
  suspendreVendeur,
  supprimerUtilisateur,
  activerUtilisateur,
  verifierVendeur,
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

// Le backend renvoie `statut` ('actif' | 'inactif' | 'suspendu').
function statutBadge(statut) {
  if (statut === 'suspendu') return 'danger';
  if (statut === 'actif') return 'success';
  return 'default';
}

function statutLabel(statut) {
  if (statut === 'suspendu') return 'Suspendu';
  if (statut === 'actif') return 'Actif';
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
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0 });

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

  const handleVerifier = async (vendeur) => {
    try {
      await verifierVendeur(vendeur.id);
      toast.success(`Vendeur ${vendeur.prenom} ${vendeur.nom} vérifié`);
      await load();
    } catch {
      toast.error('Erreur lors de la vérification du vendeur');
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
          <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher par nom ou email..." />
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
                      {v.verifie && <Badge variant="info">Vérifié</Badge>}
                    </div>
                  </td>
                  <td className="td-muted">{v.email || '—'}</td>
                  <td className="td-muted">{v.telephone || '—'}</td>
                  <td className="td-muted">{v.ville || v.boutiques?.localisation || v.adresse || '—'}</td>
                  <td>
                    <Badge variant={v.abonnementActif ? 'success' : 'default'}>
                      {v.abonnementActif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={statutBadge(v.statut)}>
                      {statutLabel(v.statut)}
                    </Badge>
                  </td>
                  <td className="td-muted">{formatDate(v.createdAt)}</td>
                  <td>
                    <div className="dropdown-actions-container">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDropdownCoords({
                            top: rect.bottom + window.scrollY,
                            left: rect.right + window.scrollX - 140,
                          });
                          setOpenDropdownId(openDropdownId === v.id ? null : v.id);
                        }}
                      >
                        Actions ▾
                      </button>
                      {openDropdownId === v.id && createPortal(
                        <>
                          <div className="dropdown-backdrop" onClick={() => setOpenDropdownId(null)} />
                          <div
                            className="dropdown-menu-actions"
                            style={{
                              position: 'absolute',
                              top: dropdownCoords.top + 4,
                              left: dropdownCoords.left,
                            }}
                          >
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                setSelected(v);
                                setDetailOpen(true);
                                setOpenDropdownId(null);
                              }}
                            >
                              Voir
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => {
                                handleAbonnement(v);
                                setOpenDropdownId(null);
                              }}
                            >
                              Abonnement
                            </button>
                            {!v.verifie && (
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  handleVerifier(v);
                                  setOpenDropdownId(null);
                                }}
                              >
                                Vérifier
                              </button>
                            )}
                            {v.statut !== 'actif' ? (
                              <button
                                className="dropdown-item success"
                                onClick={() => {
                                  openConfirm('activer', v);
                                  setOpenDropdownId(null);
                                }}
                              >
                                Réactiver
                              </button>
                            ) : (
                              <button
                                className="dropdown-item warning"
                                onClick={() => {
                                  openConfirm('suspendre', v);
                                  setOpenDropdownId(null);
                                }}
                              >
                                Suspendre
                              </button>
                            )}
                            <button
                              className="dropdown-item danger"
                              onClick={() => {
                                openConfirm('supprimer', v);
                                setOpenDropdownId(null);
                              }}
                            >
                              Supprimer
                            </button>
                          </div>
                        </>,
                        document.body
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
              <div className="detail-item"><label>Ville</label><span>{selected.ville || selected.boutiques?.localisation || selected.adresse || '—'}</span></div>
              <div className="detail-item"><label>Statut</label><span>{statutLabel(selected.statut)}</span></div>
              <div className="detail-item"><label>Abonnement</label><span>{selected.abonnementActif ? 'Actif' : 'Inactif'}</span></div>
              <div className="detail-item"><label>Vérification</label><span>{selected.verifie ? 'Vérifié' : 'Non vérifié'}</span></div>
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
