import React, { useCallback } from 'react';

/**
 * Pagination component with page numbers, prev/next, items-per-page selector.
 */
const Pagination = React.memo(function Pagination({ page, totalPages, total, limit, onPageChange, onLimitChange }) {
  const handlePrev = useCallback(() => {
    if (page > 1) onPageChange(page - 1);
  }, [page, onPageChange]);

  const handleNext = useCallback(() => {
    if (page < totalPages) onPageChange(page + 1);
  }, [page, totalPages, onPageChange]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="pagination" id="pagination">
      <div className="pagination-info">
        <span className="pagination-showing">
          Showing <strong>{startItem}-{endItem}</strong> of <strong>{total}</strong>
        </span>
        <div className="pagination-limit">
          <label htmlFor="page-limit">Per page:</label>
          <select
            id="page-limit"
            className="input pagination-select"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            <option value={8}>8</option>
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
          </select>
        </div>
      </div>

      <div className="pagination-controls">
        <button
          className="btn btn-secondary btn-sm pagination-btn"
          disabled={page <= 1}
          onClick={handlePrev}
          id="pagination-prev"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15,18 9,12 15,6" />
          </svg>
        </button>

        {getPageNumbers().map((p, i) => (
          p === '...' ? (
            <span key={`dots-${i}`} className="pagination-dots">...</span>
          ) : (
            <button
              key={p}
              className={`btn btn-sm pagination-page ${p === page ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        ))}

        <button
          className="btn btn-secondary btn-sm pagination-btn"
          disabled={page >= totalPages}
          onClick={handleNext}
          id="pagination-next"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
      </div>
    </div>
  );
});

export default Pagination;
