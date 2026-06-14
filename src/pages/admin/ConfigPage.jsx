import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getPrixAbonnement, updatePrixAbonnement } from '../../api/admin.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatMontant } from '../../utils/formatters';

export default function ConfigPage() {
  const [currentPrice, setCurrentPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPrixAbonnement();
        const prix = res.data?.prix ?? res.data?.price ?? null;
        setCurrentPrice(prix);
        if (prix !== null) setNewPrice(String(prix));
      } catch {
        toast.error('Erreur lors du chargement du prix');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    const prix = parseFloat(newPrice);
    if (isNaN(prix) || prix <= 0) {
      toast.error('Veuillez saisir un prix valide');
      return;
    }
    setSaving(true);
    try {
      await updatePrixAbonnement(prix);
      setCurrentPrice(prix);
      toast.success('Prix mis à jour avec succès');
    } catch {
      toast.error('Erreur lors de la mise à jour du prix');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Configuration — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Configuration</h1>
          <p>Paramètres de la plateforme</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <div className="card-header">
          <span className="card-title">Prix de l&apos;abonnement</span>
        </div>
        <div className="card-body">
          <div className="config-current-price">
            <div>
              <div className="config-price-label">Prix actuel</div>
              <div className="config-price-value">
                {currentPrice !== null ? formatMontant(currentPrice) : '—'}
              </div>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="newPrice">
              Nouveau prix (FCFA) <span style={{ color: 'var(--color-danger)' }}>*</span>
            </label>
            <input
              id="newPrice"
              className="form-input"
              type="number"
              min="0"
              step="100"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="Ex: 5000"
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => setConfirmOpen(true)}
              disabled={saving || !newPrice}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setNewPrice(currentPrice !== null ? String(currentPrice) : '')}
              disabled={saving}
            >
              Annuler
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSave}
        title="Modifier le prix"
        message={`Voulez-vous modifier le prix de l'abonnement à ${formatMontant(parseFloat(newPrice) || 0)} ?`}
        confirmLabel="Confirmer"
        variant="warning"
      />
    </div>
  );
}
