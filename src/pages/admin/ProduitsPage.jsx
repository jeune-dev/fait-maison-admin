import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getProduitsActifs } from '../../api/admin.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatMontant } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 10;

export default function ProduitsPage() {
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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Produits — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Produits actifs</h1>
          <p>{produits.length} produit(s) au total</p>
        </div>
      </div>

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
    </div>
  );
}
