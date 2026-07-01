import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import {
  getProduitsEnAttente,
  approuverProduit,
  rejeterProduit,
} from '../../api/moderation.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatMontant } from '../../utils/formatters';

export default function ModerationPage() {
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProduitsEnAttente();
      const list = res.data?.produits || res.data || [];
      setProduits(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const action = async (id, type) => {
    setBusy(id);
    try {
      if (type === 'approve') {
        await approuverProduit(id);
        toast.success('Produit approuvé');
      } else {
        await rejeterProduit(id);
        toast.success('Produit rejeté');
      }
      setProduits((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Échec de l'action");
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Modération — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Modération des produits</h1>
          <p>{produits.length} produit(s) en attente</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Produits en attente</span></div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Vendeur</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {produits.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Aucun produit en attente</td></tr>
              )}
              {produits.map((p) => (
                <tr key={p.id}>
                  <td>{p.nom}</td>
                  <td>{p.vendeur ? `${p.vendeur.prenom || ''} ${p.vendeur.nom || ''}`.trim() : '—'}</td>
                  <td>{p.categorie?.nom || '—'}</td>
                  <td>{formatMontant(p.prix)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary" disabled={busy === p.id}
                        onClick={() => action(p.id, 'approve')}>Approuver</button>
                      <button className="btn btn-danger" disabled={busy === p.id}
                        onClick={() => action(p.id, 'reject')}>Rejeter</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
