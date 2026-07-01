import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import {
  getProduitsActifs,
  getProduitsEnAttente,
  approuverProduit,
  rejeterProduit,
} from '../../api/admin.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatMontant } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 10;

export default function ProduitsPage() {
  const [tab, setTab] = useState('actifs');

  // ── Vue "Produits actifs" (comportement existant, inchangé) ────────────────
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    try {
      const res = await getProduitsActifs();
      const list = res.data?.produits || res.data || [];
      setProduits(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = produits.filter((p) => {
    const s = debouncedSearch.toLowerCase();
    return (
      !s ||
      (p.nom || '').toLowerCase().includes(s) ||
      (p.categorie?.nom || '').toLowerCase().includes(s) ||
      (p.vendeur?.nom || '').toLowerCase().includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  // ── Extension : modération des produits en attente ──────────────────────────
  const [enAttente, setEnAttente] = useState([]);
  const [loadingAttente, setLoadingAttente] = useState(true);
  const [attentePage, setAttentePage] = useState(1);
  const [rejetTarget, setRejetTarget] = useState(null);
  const [raisonRejet, setRaisonRejet] = useState('');
  const [saving, setSaving] = useState(false);

  const loadEnAttente = useCallback(async () => {
    setLoadingAttente(true);
    try {
      const res = await getProduitsEnAttente();
      const list = res.data?.produits || res.data?.data || res.data || [];
      setEnAttente(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement des produits en attente');
    } finally {
      setLoadingAttente(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'attente') loadEnAttente();
  }, [tab, loadEnAttente]);

  const attenteTotalPages = Math.ceil(enAttente.length / PAGE_SIZE);
  const attentePaginated = enAttente.slice((attentePage - 1) * PAGE_SIZE, attentePage * PAGE_SIZE);

  const handleApprouver = async (produit) => {
    try {
      await approuverProduit(produit.id);
      toast.success(`Produit "${produit.nom}" approuvé`);
      await loadEnAttente();
    } catch {
      toast.error("Erreur lors de l'approbation du produit");
    }
  };

  const openRejeter = (produit) => { setRejetTarget(produit); setRaisonRejet(''); };
  const closeRejeter = () => setRejetTarget(null);

  const handleRejeter = async () => {
    if (!rejetTarget) return;
    setSaving(true);
    try {
      await rejeterProduit(rejetTarget.id, raisonRejet);
      toast.success(`Produit "${rejetTarget.nom}" rejeté`);
      closeRejeter();
      await loadEnAttente();
    } catch {
      toast.error('Erreur lors du rejet du produit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Helmet><title>Produits — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Produits</h1>
          <p>{tab === 'actifs' ? `${produits.length} produit(s) actif(s) au total` : `${enAttente.length} produit(s) en attente de modération`}</p>
        </div>
      </div>

      <div className="tabs-bar">
        <button className={`tab-btn${tab === 'actifs' ? ' active' : ''}`} onClick={() => setTab('actifs')}>
          Produits actifs
        </button>
        <button className={`tab-btn${tab === 'attente' ? ' active' : ''}`} onClick={() => setTab('attente')}>
          En attente de modération
        </button>
      </div>

      {tab === 'actifs' ? (
        loading ? <LoadingSpinner /> : (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Liste des produits</span>
              <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher par nom, vendeur, catégorie..." />
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Vendeur</th>
                    <th>Prix</th>
                    <th>Catégorie</th>
                    <th>Stock</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6}>
                        <div className="empty-state">
                          <p>{search ? `Aucun résultat pour "${search}"` : 'Aucun produit enregistré pour l\'instant'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : paginated.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {p.image
                            ? <img src={p.image} alt={p.nom} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                            : <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>IMG</div>
                          }
                          <span className="td-bold">{p.nom || '—'}</span>
                        </div>
                      </td>
                      <td className="td-muted">
                        {p.vendeur ? `${p.vendeur.prenom || ''} ${p.vendeur.nom || ''}`.trim() || '—' : '—'}
                      </td>
                      <td className="td-bold">{formatMontant(p.prix)}</td>
                      <td className="td-muted">{p.categorie?.nom || p.categorieNom || '—'}</td>
                      <td className="td-muted">{p.stock ?? p.quantite ?? '—'}</td>
                      <td>
                        <Badge variant={p.actif ? 'success' : 'default'}>
                          {p.actif ? 'Actif' : 'Inactif'}
                        </Badge>
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
        )
      ) : (
        loadingAttente ? <LoadingSpinner /> : (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Produits en attente de modération</span>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Vendeur</th>
                    <th>Prix</th>
                    <th>Catégorie</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attentePaginated.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty-state">
                          <p>Aucun produit en attente de modération</p>
                        </div>
                      </td>
                    </tr>
                  ) : attentePaginated.map((p) => (
                    <tr key={p.id}>
                      <td className="td-bold">{p.nom || '—'}</td>
                      <td className="td-muted">
                        {p.vendeur ? `${p.vendeur.prenom || ''} ${p.vendeur.nom || ''}`.trim() || '—' : '—'}
                      </td>
                      <td className="td-bold">{formatMontant(p.prix)}</td>
                      <td className="td-muted">{p.categorie?.nom || p.categorieNom || '—'}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn btn-success btn-sm" onClick={() => handleApprouver(p)}>Approuver</button>
                          <button className="btn btn-danger btn-sm" onClick={() => openRejeter(p)}>Rejeter</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0.75rem 1.25rem' }}>
              <Pagination currentPage={attentePage} totalPages={attenteTotalPages} onPageChange={setAttentePage} />
            </div>
          </div>
        )
      )}

      <Modal
        isOpen={!!rejetTarget}
        onClose={closeRejeter}
        title="Rejeter le produit"
        footer={
          <>
            <button className="btn btn-secondary" onClick={closeRejeter} disabled={saving}>Annuler</button>
            <button className="btn btn-danger" onClick={handleRejeter} disabled={saving}>
              {saving ? 'Rejet...' : 'Rejeter'}
            </button>
          </>
        }
      >
        <div className="form-field">
          <label className="form-label" htmlFor="raisonRejet">Raison du rejet <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <textarea
            id="raisonRejet"
            className="form-textarea"
            value={raisonRejet}
            onChange={(e) => setRaisonRejet(e.target.value)}
            placeholder="Expliquez pourquoi ce produit est rejeté..."
          />
        </div>
      </Modal>
    </div>
  );
}
