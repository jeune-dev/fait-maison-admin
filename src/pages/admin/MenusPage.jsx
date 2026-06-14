import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getMenus, creerMenu, updateMenu, supprimerMenu } from '../../api/rbac.api';
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
const EMPTY_FORM = { name: '', code: '', path: '', icon: '', ordre: 0 };

export default function MenusPage() {
  const [menus, setMenus] = useState([]);
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
      const res = await getMenus();
      setMenus(res.data?.menus || []);
    } catch {
      toast.error('Erreur lors du chargement des menus');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = menus.filter((m) => {
    const s = debouncedSearch.toLowerCase();
    return !s || (m.name || '').toLowerCase().includes(s) || (m.code || '').toLowerCase().includes(s);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormErrors({}); setFormOpen(true); };
  const openEdit = (menu) => {
    setEditTarget(menu);
    setForm({ name: menu.name, code: menu.code, path: menu.path, icon: menu.icon || '', ordre: menu.ordre || 0 });
    setFormErrors({});
    setFormOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Requis';
    if (!form.code.trim()) e.code = 'Requis';
    if (!form.path.trim()) e.path = 'Requis';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (formErrors[name]) setFormErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editTarget) {
        await updateMenu(editTarget.id, form);
        toast.success('Menu modifié');
      } else {
        await creerMenu(form);
        toast.success('Menu créé');
      }
      setFormOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await supprimerMenu(deleteTarget.id);
      toast.success(`Menu "${deleteTarget.name}" supprimé`);
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet><title>Menus — Fait Maison Admin</title></Helmet>
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Menus</h1>
            <p>{menus.length} menu(s) configuré(s)</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Ajouter un menu</button>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Liste des menus</span>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher..." />
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Code</th>
                  <th>Chemin</th>
                  <th>Ordre</th>
                  <th>Statut</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="empty-state">
                        <p>{debouncedSearch ? `Aucun résultat pour "${debouncedSearch}"` : 'Aucun menu enregistré'}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((m) => (
                  <tr key={m.id}>
                    <td className="td-bold">{m.name}</td>
                    <td>
                      <code style={{ background: 'var(--color-bg)', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>
                        {m.code}
                      </code>
                    </td>
                    <td className="td-muted">{m.path}</td>
                    <td className="td-muted">{m.ordre}</td>
                    <td>
                      <Badge variant={m.isActive ? 'success' : 'default'}>
                        {m.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="td-muted">{formatDate(m.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}>Modifier</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(m)}>Supprimer</button>
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
          title={editTarget ? 'Modifier le menu' : 'Nouveau menu'}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setFormOpen(false)} disabled={saving}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Sauvegarde...' : (editTarget ? 'Enregistrer' : 'Créer')}
              </button>
            </>
          }
        >
          <FormField label="Nom" name="name" value={form.name} onChange={handleChange} error={formErrors.name} required placeholder="Ex: Vendeurs" />
          <FormField label="Code" name="code" value={form.code} onChange={handleChange} error={formErrors.code} required placeholder="Ex: VENDEURS" />
          <FormField label="Chemin (route)" name="path" value={form.path} onChange={handleChange} error={formErrors.path} required placeholder="Ex: /vendeurs" />
          <FormField label="Icône (optionnel)" name="icon" value={form.icon} onChange={handleChange} placeholder="Ex: store" />
          <FormField label="Ordre d'affichage" name="ordre" type="number" value={form.ordre} onChange={handleChange} placeholder="0" />
        </Modal>

        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Supprimer le menu"
          message={`Voulez-vous supprimer le menu "${deleteTarget?.name}" ? Les permissions associées seront aussi supprimées.`}
          confirmLabel="Supprimer"
          variant="danger"
        />
      </div>
    </>
  );
}
