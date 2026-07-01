import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import {
  getAbonnements,
  creerAbonnementManuel,
  revoquerAbonnement,
  getAbonnementsExpiration,
} from '../../api/abonnements.api';
import { getVendeurs } from '../../api/admin.api';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import FormField from '../../components/forms/FormField';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 10;

const STATUTS = [
  { value: '', label: 'Tous les statuts' },
  { value: 'actif', label: 'Actif' },
  { value: 'expire', label: 'Expiré' },
  { value: 'revoque', label: 'Révoqué' },
];

const TYPES = [
  { value: 'mensuel', label: 'Mensuel' },
  { value: 'annuel', label: 'Annuel' },
];

function abonnementBadgeVariant(statut) {
  const s = (statut || '').toLowerCase();
  if (s === 'actif' || s === 'active') return 'success';
  if (s === 'expire' || s === 'expiré' || s === 'revoque' || s === 'révoqué') return 'danger';
  return 'default';
}

const EMPTY_FORM = { vendeurId: '', type: 'mensuel', dateDebut: '', dateFin: '' };

export default function AbonnementsPage() {
  const [statutFiltre, setStatutFiltre] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const fetcher = useCallback(async () => {
    const res = await getAbonnements(statutFiltre ? { statut: statutFiltre } : undefined);
    const list = res.data?.abonnements || res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  }, [statutFiltre]);

  const { data, loading, reload } = usePageData(fetcher, 'Erreur lors du chargement des abonnements');
  const abonnements = data || [];

  const [expirants, setExpirants] = useState([]);
  const [loadingExpirants, setLoadingExpirants] = useState(true);

  useEffect(() => {
    const loadExpirants = async () => {
      try {
        const res = await getAbonnementsExpiration(30);
        const list = res.data?.abonnements || res.data?.data || res.data || [];
        setExpirants(Array.isArray(list) ? list : []);
      } catch {
        toast.error('Erreur lors du chargement des abonnements arrivant à expiration');
      } finally {
        setLoadingExpirants(false);
      }
    };
    loadExpirants();
  }, []);

  // ── Modal création manuelle ────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [vendeurs, setVendeurs] = useState([]);
  const [vendeurSearch, setVendeurSearch] = useState('');

  const openCreate = async () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setVendeurSearch('');
    setCreateOpen(true);
    try {
      const res = await getVendeurs();
      const list = res.data?.vendeurs || res.data || [];
      setVendeurs(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement des vendeurs');
    }
  };

  const filteredVendeurs = vendeurs.filter((v) => {
    const s = vendeurSearch.toLowerCase();
    return !s || `${v.prenom || ''} ${v.nom || ''} ${v.email || ''}`.toLowerCase().includes(s);
  });

  const validateForm = () => {
    const errors = {};
    if (!form.vendeurId) errors.vendeurId = 'Sélectionnez un vendeur';
    if (!form.dateDebut) errors.dateDebut = 'Date de début requise';
    if (!form.dateFin) errors.dateFin = 'Date de fin requise';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      await creerAbonnementManuel(form.vendeurId, {
        type: form.type,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin,
      });
      toast.success('Abonnement manuel créé avec succès');
      setCreateOpen(false);
      await reload();
    } catch {
      toast.error("Erreur lors de la création de l'abonnement");
    } finally {
      setSaving(false);
    }
  };

  // ── Révocation ──────────────────────────────────────────────────────────────
  const [revokeTarget, setRevokeTarget] = useState(null);

  const handleRevoquer = async () => {
    if (!revokeTarget) return;
    try {
      await revoquerAbonnement(revokeTarget.id);
      toast.success('Abonnement révoqué');
      setRevokeTarget(null);
      await reload();
    } catch {
      toast.error("Erreur lors de la révocation de l'abonnement");
    }
  };

  const filtered = abonnements.filter((a) => {
    const s = debouncedSearch.toLowerCase();
    const vendeurNom = typeof a.vendeur === 'string' ? a.vendeur : `${a.vendeur?.prenom || ''} ${a.vendeur?.nom || ''}`;
    return !s || vendeurNom.toLowerCase().includes(s);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleStatutChange = (val) => { setStatutFiltre(val); setPage(1); };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Abonnements — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Abonnements</h1>
          <p>{abonnements.length} abonnement(s) au total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Créer abonnement manuel</button>
      </div>

      {!loadingExpirants && expirants.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Expirent bientôt (30 jours)</span>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Vendeur</th><th>Type</th><th>Fin</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {expirants.map((a) => (
                  <tr key={a.id}>
                    <td className="td-bold">
                      {typeof a.vendeur === 'string' ? a.vendeur : `${a.vendeur?.prenom || ''} ${a.vendeur?.nom || ''}`.trim() || '—'}
                    </td>
                    <td className="td-muted">{a.type || '—'}</td>
                    <td className="td-muted">{formatDate(a.dateFin)}</td>
                    <td><Badge variant={abonnementBadgeVariant(a.statut)}>{a.statut || 'Actif'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des abonnements</span>
          <div className="toolbar-left" style={{ flex: 'unset', justifyContent: 'flex-end' }}>
            <select
              className="form-select filter-select"
              value={statutFiltre}
              onChange={(e) => handleStatutChange(e.target.value)}
              aria-label="Filtrer par statut"
            >
              {STATUTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher par vendeur..." />
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vendeur</th>
                <th>Type</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <p>{search ? `Aucun résultat pour "${search}"` : 'Aucun abonnement enregistré pour l\'instant'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((a) => (
                <tr key={a.id}>
                  <td className="td-bold">
                    {typeof a.vendeur === 'string' ? a.vendeur : `${a.vendeur?.prenom || ''} ${a.vendeur?.nom || ''}`.trim() || '—'}
                  </td>
                  <td className="td-muted">{a.type || '—'}</td>
                  <td className="td-muted">{formatDate(a.dateDebut)}</td>
                  <td className="td-muted">{formatDate(a.dateFin)}</td>
                  <td><Badge variant={abonnementBadgeVariant(a.statut)}>{a.statut || 'Actif'}</Badge></td>
                  <td>
                    {abonnementBadgeVariant(a.statut) === 'success' && (
                      <button className="btn btn-danger btn-sm" onClick={() => setRevokeTarget(a)}>Révoquer</button>
                    )}
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
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Créer un abonnement manuel"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setCreateOpen(false)} disabled={saving}>Annuler</button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
              {saving ? 'Création...' : 'Créer'}
            </button>
          </>
        }
      >
        <div className="form-field">
          <label className="form-label" htmlFor="vendeurSearch">Vendeur <span style={{ color: 'var(--color-danger)' }}>*</span></label>
          <SearchInput value={vendeurSearch} onChange={setVendeurSearch} placeholder="Rechercher un vendeur..." />
          <select
            id="vendeurSearch"
            className="form-select"
            style={{ marginTop: '0.5rem' }}
            value={form.vendeurId}
            onChange={(e) => { setForm((f) => ({ ...f, vendeurId: e.target.value })); setFormErrors((err) => ({ ...err, vendeurId: undefined })); }}
          >
            <option value="">— Sélectionner un vendeur —</option>
            {filteredVendeurs.map((v) => (
              <option key={v.id} value={v.id}>{v.prenom} {v.nom} ({v.email})</option>
            ))}
          </select>
          {formErrors.vendeurId && <p className="form-error">{formErrors.vendeurId}</p>}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="type">Type d&apos;abonnement</label>
          <select
            id="type"
            className="form-select"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>

        <FormField
          label="Date de début" name="dateDebut" type="date"
          value={form.dateDebut}
          onChange={(e) => { setForm((f) => ({ ...f, dateDebut: e.target.value })); setFormErrors((err) => ({ ...err, dateDebut: undefined })); }}
          error={formErrors.dateDebut} required
        />
        <FormField
          label="Date de fin" name="dateFin" type="date"
          value={form.dateFin}
          onChange={(e) => { setForm((f) => ({ ...f, dateFin: e.target.value })); setFormErrors((err) => ({ ...err, dateFin: undefined })); }}
          error={formErrors.dateFin} required
        />
      </Modal>

      <ConfirmModal
        isOpen={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        onConfirm={handleRevoquer}
        title="Révoquer l'abonnement"
        message={`Voulez-vous révoquer l'abonnement de ${typeof revokeTarget?.vendeur === 'string' ? revokeTarget?.vendeur : `${revokeTarget?.vendeur?.prenom || ''} ${revokeTarget?.vendeur?.nom || ''}`.trim()} ?`}
        confirmLabel="Révoquer"
        variant="danger"
      />
    </div>
  );
}
