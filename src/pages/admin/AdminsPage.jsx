import { useEffect, useState, useCallback, memo } from 'react';
import { toast } from 'react-toastify';
import { Helmet } from 'react-helmet';
import { getAdmins, creerAdmin, supprimerAdmin, getAdminPermissions, updateAdminPerms, getMenus } from '../../api/rbac.api';
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
const EMPTY_FORM = { nom: '', prenom: '', email: '' };

const PermissionRow = memo(function PermissionRow({ menu, perm, onChange }) {
  const actions = [
    { key: 'canView',   label: 'Voir' },
    { key: 'canCreate', label: 'Créer' },
    { key: 'canUpdate', label: 'Modifier' },
    { key: 'canDelete', label: 'Supprimer' },
  ];
  return (
    <div className="perm-row">
      <span className="perm-menu-name">{menu.name}</span>
      <div className="perm-actions">
        {actions.map(({ key, label }) => (
          <label key={key} className="perm-checkbox">
            <input
              type="checkbox"
              checked={perm?.[key] || false}
              onChange={(e) => onChange(menu.id, key, e.target.checked)}
            />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
});

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal création
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [permissions, setPermissions] = useState({});
  const [saving, setSaving] = useState(false);

  // Modal permissions
  const [permOpen, setPermOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editPerms, setEditPerms] = useState({});
  const [savingPerms, setSavingPerms] = useState(false);

  // Confirm delete
  const [deleteTarget, setDeleteTarget] = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    try {
      const [adminsRes, menusRes] = await Promise.all([getAdmins(), getMenus()]);
      setAdmins(adminsRes.data?.admins || []);
      setMenus(menusRes.data?.menus || []);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = admins.filter((a) => {
    const s = debouncedSearch.toLowerCase();
    return !s || (a.nom || '').toLowerCase().includes(s) || (a.prenom || '').toLowerCase().includes(s) || (a.email || '').toLowerCase().includes(s);
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Création admin ────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    const initPerms = {};
    menus.forEach((m) => { initPerms[m.id] = { canView: false, canCreate: false, canUpdate: false, canDelete: false }; });
    setPermissions(initPerms);
    setCreateOpen(true);
  };

  const handlePermChange = (menuId, action, value) => {
    setPermissions((p) => ({ ...p, [menuId]: { ...p[menuId], [action]: value } }));
  };

  const validateCreate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = 'Requis';
    if (!form.prenom.trim()) e.prenom = 'Requis';
    if (!form.email.trim()) e.email = 'Requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCreate()) return;
    setSaving(true);
    try {
      const permList = Object.entries(permissions)
        .filter(([, p]) => Object.values(p).some(Boolean))
        .map(([menuId, p]) => ({ menuId: parseInt(menuId), ...p }));
      await creerAdmin({ ...form, permissions: permList });
      toast.success(`Administrateur ${form.prenom} ${form.nom} créé — email envoyé.`);
      setCreateOpen(false);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  // ── Édition permissions ───────────────────────────────────────────────────

  const openPermissions = async (admin) => {
    setSelectedAdmin(admin);
    try {
      const res = await getAdminPermissions(admin.id);
      const permsMap = {};
      menus.forEach((m) => { permsMap[m.id] = { canView: false, canCreate: false, canUpdate: false, canDelete: false }; });
      (res.data?.permissions || []).forEach((p) => {
        permsMap[p.menuId] = { canView: p.canView, canCreate: p.canCreate, canUpdate: p.canUpdate, canDelete: p.canDelete };
      });
      setEditPerms(permsMap);
      setPermOpen(true);
    } catch {
      toast.error('Erreur lors du chargement des permissions');
    }
  };

  const handleSavePerms = async () => {
    setSavingPerms(true);
    try {
      const permList = Object.entries(editPerms)
        .map(([menuId, p]) => ({ menuId: parseInt(menuId), ...p }));
      await updateAdminPerms(selectedAdmin.id, permList);
      toast.success('Permissions mises à jour');
      setPermOpen(false);
    } catch {
      toast.error('Erreur lors de la mise à jour des permissions');
    } finally {
      setSavingPerms(false);
    }
  };

  // ── Suppression ───────────────────────────────────────────────────────────

  const handleDelete = async () => {
    try {
      await supprimerAdmin(deleteTarget.id);
      toast.success(`Admin ${deleteTarget.prenom} ${deleteTarget.nom} supprimé`);
      setDeleteTarget(null);
      await load();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Helmet><title>Administrateurs — Fait Maison Admin</title></Helmet>
      <div>
        <div className="page-header">
          <div className="page-header-left">
            <h1>Administrateurs</h1>
            <p>{admins.length} administrateur(s) au total</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Nouvel administrateur</button>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Liste des administrateurs</span>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Rechercher..." />
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Administrateur</th>
                  <th>Email</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <p>{debouncedSearch ? `Aucun résultat pour "${debouncedSearch}"` : 'Aucun administrateur enregistré'}</p>
                      </div>
                    </td>
                  </tr>
                ) : paginated.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar-placeholder">{(a.prenom?.[0] || '')}{(a.nom?.[0] || '')}</div>
                        <span className="td-bold">{a.prenom} {a.nom}</span>
                      </div>
                    </td>
                    <td className="td-muted">{a.email}</td>
                    <td className="td-muted">{formatDate(a.createdAt)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost btn-sm" onClick={() => openPermissions(a)}>Permissions</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(a)}>Supprimer</button>
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

        {/* Modal création */}
        <Modal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          title="Nouvel administrateur"
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setCreateOpen(false)} disabled={saving}>Annuler</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Création...' : 'Créer et envoyer email'}
              </button>
            </>
          }
        >
          <FormField label="Nom" name="nom" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} error={formErrors.nom} required />
          <FormField label="Prénom" name="prenom" value={form.prenom} onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))} error={formErrors.prenom} required />
          <FormField label="Email" name="email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={formErrors.email} required />

          {menus.length > 0 && (
            <div style={{ marginTop: '1.25rem' }}>
              <div className="form-label" style={{ marginBottom: '0.75rem' }}>Permissions par menu</div>
              <div className="perm-grid">
                {menus.map((menu) => (
                  <PermissionRow
                    key={menu.id}
                    menu={menu}
                    perm={permissions[menu.id]}
                    onChange={handlePermChange}
                  />
                ))}
              </div>
            </div>
          )}
        </Modal>

        {/* Modal permissions */}
        <Modal
          isOpen={permOpen}
          onClose={() => setPermOpen(false)}
          title={`Permissions — ${selectedAdmin?.prenom} ${selectedAdmin?.nom}`}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setPermOpen(false)} disabled={savingPerms}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSavePerms} disabled={savingPerms}>
                {savingPerms ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </>
          }
        >
          <div className="perm-grid">
            {menus.map((menu) => (
              <PermissionRow
                key={menu.id}
                menu={menu}
                perm={editPerms[menu.id]}
                onChange={(menuId, action, value) => setEditPerms((p) => ({ ...p, [menuId]: { ...p[menuId], [action]: value } }))}
              />
            ))}
          </div>
        </Modal>

        <ConfirmModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Supprimer l'administrateur"
          message={`Voulez-vous supprimer ${deleteTarget?.prenom} ${deleteTarget?.nom} ? Cette action est irréversible.`}
          confirmLabel="Supprimer"
          variant="danger"
        />
      </div>
    </>
  );
}
