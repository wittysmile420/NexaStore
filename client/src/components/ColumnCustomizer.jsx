import React, { useState, useCallback, useRef } from 'react';

const ALL_COLUMNS = [
  { key: 'image', label: 'Image' },
  { key: 'name', label: 'Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  { key: 'rating', label: 'Rating' },
];

/**
 * Column customizer with show/hide toggles and drag-to-reorder.
 */
const ColumnCustomizer = React.memo(function ColumnCustomizer({ visibleColumns, columnOrder, onVisibleChange, onOrderChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const toggleColumn = useCallback((key) => {
    const newVisible = visibleColumns.includes(key)
      ? visibleColumns.filter(c => c !== key)
      : [...visibleColumns, key];
    // Ensure at least one column is always visible
    if (newVisible.length > 0) {
      onVisibleChange(newVisible);
    }
  }, [visibleColumns, onVisibleChange]);

  const handleDragStart = useCallback((index) => {
    dragItem.current = index;
  }, []);

  const handleDragEnter = useCallback((index) => {
    dragOverItem.current = index;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const newOrder = [...columnOrder];
    const draggedItem = newOrder.splice(dragItem.current, 1)[0];
    newOrder.splice(dragOverItem.current, 0, draggedItem);
    onOrderChange(newOrder);
    dragItem.current = null;
    dragOverItem.current = null;
  }, [columnOrder, onOrderChange]);

  return (
    <div className="column-customizer">
      <button className="btn btn-secondary btn-sm" onClick={toggleOpen} id="column-customizer-toggle">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        Columns
      </button>

      {isOpen && (
        <>
          <div className="column-customizer-backdrop" onClick={() => setIsOpen(false)} />
          <div className="column-customizer-dropdown glass-card animate-scale-in">
            <div className="column-customizer-header">
              <span className="column-customizer-title">Customize Columns</span>
              <span className="column-customizer-hint">Drag to reorder</span>
            </div>
            <div className="column-customizer-list">
              {columnOrder.map((key, index) => {
                const col = ALL_COLUMNS.find(c => c.key === key);
                if (!col) return null;
                return (
                  <div
                    key={key}
                    className="column-customizer-item"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <span className="column-drag-handle" title="Drag to reorder">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="9" cy="6" r="1.5" />
                        <circle cx="15" cy="6" r="1.5" />
                        <circle cx="9" cy="12" r="1.5" />
                        <circle cx="15" cy="12" r="1.5" />
                        <circle cx="9" cy="18" r="1.5" />
                        <circle cx="15" cy="18" r="1.5" />
                      </svg>
                    </span>
                    <label className="column-customizer-label">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(key)}
                        onChange={() => toggleColumn(key)}
                        className="column-checkbox"
                      />
                      <span className="column-checkbox-custom"></span>
                      {col.label}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default ColumnCustomizer;
