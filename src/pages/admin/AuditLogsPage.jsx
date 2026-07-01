import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { getAuditLogs } from '../../api/auditLogs.api';
import usePageData from '../../hooks/usePageData';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchInput from '../../components/common/SearchInput';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/formatters';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 15;

export default function AuditLogsPage() {
  const [search, setSearch] = useState('');
  const [actionFiltre, setActionFiltre] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);
  const debouncedAction = useDebounce(actionFiltre, 300);

  const fetcher = useCallback(async () => {
    const params = {};
    if (debouncedAction) params.action = debouncedAction;
    const res = await getAuditLogs(params);
    const list = res.data?.logs || res.data?.data || res.data || [];
    return Array.isArray(list) ? list : [];
  }, [debouncedAction]);

  const { data, loading } = usePageData(fetcher, 'Erreur lors du chargement des logs d\'audit');
  const logs = data || [];

  const filtered = logs.filter((l) => {
    const s = debouncedSearch.toLowerCase();
    return (
      !s ||
      (l.action || '').toLowerCase().includes(s) ||
      (l.cible || '').toLowerCase().includes(s) ||
      String(l.adminId || '').includes(s) ||
      String(l.cibleId || '').includes(s)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleAction = (val) => { setActionFiltre(val); setPage(1); };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Helmet><title>Logs d&apos;audit — Fait Maison Admin</title></Helmet>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Logs d&apos;audit</h1>
          <p>{logs.length} entrée(s) au total</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Journal des actions administrateur</span>
          <div className="toolbar-left" style={{ flex: 'unset', justifyContent: 'flex-end' }}>
            <input
              className="form-input filter-select"
              style={{ width: 'auto', minWidth: 160 }}
              value={actionFiltre}
              onChange={(e) => handleAction(e.target.value)}
              placeholder="Filtrer par action..."
              aria-label="Filtrer par action"
            />
            <SearchInput value={search} onChange={handleSearch} placeholder="Rechercher (admin, cible)..." />
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Cible</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="empty-state">
                      <p>{search || actionFiltre ? 'Aucun résultat pour ce filtre' : 'Aucun log enregistré pour l\'instant'}</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((l) => (
                <tr key={l.id}>
                  <td className="td-muted">{formatDateTime(l.createdAt)}</td>
                  <td className="td-bold">#{l.adminId}</td>
                  <td className="td-muted">{l.action || '—'}</td>
                  <td className="td-muted">{l.cible ? `${l.cible} #${l.cibleId ?? ''}` : '—'}</td>
                  <td className="td-muted" style={{ maxWidth: 260 }}>
                    {typeof l.details === 'string' ? l.details : (l.details ? JSON.stringify(l.details) : '—')}
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
