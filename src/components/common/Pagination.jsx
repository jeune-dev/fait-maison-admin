import { memo } from 'react';
const Pagination = memo(function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    pages.push(1);
    if (currentPage > 4) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination" role="navigation" aria-label="Pagination">
      <button className="pagination-btn" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} aria-label="Page précédente">&#8249;</button>
      {getPages().map((p, i) =>
        p === '...'
          ? <span key={`e-${i}`} className="pagination-ellipsis">…</span>
          : <button key={p} className={`pagination-btn${p === currentPage ? ' active' : ''}`} onClick={() => onPageChange(p)} aria-label={`Page ${p}`} aria-current={p === currentPage ? 'page' : undefined}>{p}</button>
      )}
      <button className="pagination-btn" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Page suivante">&#8250;</button>
    </div>
  );
});
export default Pagination;
