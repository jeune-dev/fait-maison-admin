import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getPrixAbonnement, updatePrixAbonnement } from '../../api/admin.api';
import { getConfigs, createConfig, updateConfig } from '../../api/configs.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmModal from '../../components/common/ConfirmModal';
import Modal from '../../components/common/Modal';
import FormField from '../../components/forms/FormField';
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

  // ── Extension : configurations générales ────────────────────────────────────
  const [configs, setConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [configFormOpen, setConfigFormOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [configForm, setConfigForm] = useState({ cle: '', valeur: '', description: '' });
  const [configErrors, setConfigErrors] = useState({});
  const [savingConfig, setSavingConfig] = useState(false);

  const loadConfigs = useCallback(async () => {
    try {
      const res = await getConfigs();
      const list = res.data?.configs || res.data?.data || res.data || [];
      setConfigs(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement des configurations');
    } finally {
      setLoadingConfigs(false);
    }
  }, []);

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  const openCreateConfig = () => {
    setEditingConfig(null);
    setConfigForm({ cle: '', valeur: '', description: '' });
    setConfigErrors({});
    setConfigFormOpen(true);
  };

  const openEditConfig = (cfg) => {
    setEditingConfig(cfg);
    setConfigForm({ cle: cfg.cle, valeur: cfg.valeur ?? '', description: cfg.description ?? '' });
    setConfigErrors({});
    setConfigFormOpen(true);
  };

  const validateConfigForm = () => {
    const errors = {};
    if (!configForm.cle.trim()) errors.cle = 'La clé est requise';
    if (!configForm.valeur.trim()) errors.valeur = 'La valeur est requise';
    setConfigErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveConfig = async () => {
    if (!validateConfigForm()) return;
    setSavingConfig(true);
    try {
      if (editingConfig) {
        await updateConfig(editingConfig.cle, { valeur: configForm.valeur, description: configForm.description });
        toast.success('Configuration mise à jour');
      } else {
        await createConfig(configForm);
        toast.success('Configuration créée');
      }
      setConfigFormOpen(false);
      await loadConfigs();
    } catch {
      toast.error('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setConfigForm((f) => ({ ...f, [name]: value }));
    if (configErrors[name]) setConfigErrors((err) => ({ ...err, [name]: undefined }));
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

      {/* ── Extension : configurations générales de la plateforme ──────────── */}
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="card-header">
          <span className="card-title">Configurations générales</span>
          <button className="btn btn-primary btn-sm" onClick={openCreateConfig}>+ Ajouter</button>
        </div>
        {loadingConfigs ? <LoadingSpinner /> : (
          configs.length === 0 ? (
            <div className="empty-state"><p>Aucune configuration enregistrée pour l&apos;instant</p></div>
          ) : (
            <div>
              {configs.map((cfg) => (
                <div className="config-list-item" key={cfg.cle}>
                  <div>
                    <div className="config-list-item-key">{cfg.cle}</div>
                    {cfg.description && <div className="config-list-item-desc">{cfg.description}</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span className="config-list-item-value">{cfg.valeur}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEditConfig(cfg)}>Modifier</button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Modal
        isOpen={configFormOpen}
        onClose={() => setConfigFormOpen(false)}
        title={editingConfig ? `Modifier « ${editingConfig.cle} »` : 'Nouvelle configuration'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setConfigFormOpen(false)} disabled={savingConfig}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSaveConfig} disabled={savingConfig}>
              {savingConfig ? 'Sauvegarde...' : (editingConfig ? 'Enregistrer' : 'Créer')}
            </button>
          </>
        }
      >
        <FormField
          label="Clé" name="cle" value={configForm.cle} onChange={handleConfigChange}
          error={configErrors.cle} required placeholder="ex: contact_email"
          disabled={!!editingConfig}
        />
        <FormField
          label="Valeur" name="valeur" value={configForm.valeur} onChange={handleConfigChange}
          error={configErrors.valeur} required placeholder="Valeur de la configuration"
        />
        <FormField
          label="Description" name="description" as="textarea" value={configForm.description} onChange={handleConfigChange}
          placeholder="Description (optionnelle)"
        />
      </Modal>
    </div>
  );
}
