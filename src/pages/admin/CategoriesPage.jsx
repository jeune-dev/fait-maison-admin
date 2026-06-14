import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import {
  getCategories,
  createCategorie,
  updateCategorie,
  deleteCategorie,
} from '../../api/categories.api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import FormField from '../../components/forms/FormField';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 10;
const EMPTY_FORM = { nom: '', description: '' };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    try {
      const res = await getCategories();
      const list = res.data?.categories || res.data || [];
      setCategories(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = categories.filter((c) => {
    const s = debouncedSearch.toLowerCase();
    return !s || (c.nom || '').toLowerCase().includes(s);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (cat) => {
    setEditTarget(cat);
    setForm({ nom: cat.nom || '', description: cat.description || '' });
    setFormErrors({});
    setFormOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.nom.trim()) errors.nom = 'Le nom est requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateCategorie(editTarget.id, form);
        toast.success('Catégorie modifiée avec succès');
      } else {
        await createCategorie(form);
        toast.success('Catégorie créée avec succès');
      }
      setFormOpen(false);
      await load();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategorie(deleteTarget.id);
      toast.success(`Catégorie "${deleteTarget.nom}" supprimée`);
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (formErrors[name]) setFormErrors((err) => ({ ...err, [name]: undefined }));
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Catégories — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Catégories</h1>
          <p>{categories.length} catégorie(s) au total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          + Ajouter une catégorie
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Liste des catégories</span>
          <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher..." />
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Description</th>
                <th>Créée le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <p>{search ? `Aucun résultat pour "${search}"` : 'Aucune catégorie enregistrée pour l\'instant'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((cat) => (
                <tr key={cat.id}>
                  <td className="td-bold">{cat.nom}</td>
                  <td className="td-muted">{cat.description || '—'}</td>
                  <td className="td-muted">{formatDate(cat.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(cat)}>Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(cat)}>Supprimer</button>
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
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editTarget ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Annuler</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Sauvegarde...' : (editTarget ? 'Enregistrer' : 'Créer')}
            </button>
          </>
        }
      >
        <FormField
          label="Nom" name="nom" value={form.nom} onChange={handleChange}
          error={formErrors.nom} required placeholder="Nom de la catégorie"
        />
        <FormField
          label="Description" name="description" as="textarea"
          value={form.description} onChange={handleChange}
          placeholder="Description (optionnelle)"
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer la catégorie"
        message={`Voulez-vous supprimer la catégorie "${deleteTarget?.nom}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        variant="danger"
      />
    </div>
  );
}
