import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { usePolling } from '../hooks/usePolling';
import ProductCard from '../components/ProductCard';
import ProductRow from '../components/ProductRow';
import Pagination from '../components/Pagination';
import ColumnCustomizer from '../components/ColumnCustomizer';
import api from '../utils/api';
import './Products.css';

const DEFAULT_COLUMNS = ['image', 'name', 'category', 'price', 'stock', 'rating'];

export default function Products() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // State from URL
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';
  const initialSort = searchParams.get('sort') || '';
  const initialOrder = searchParams.get('order') || 'asc';
  const initialPage = parseInt(searchParams.get('page') || '1');
  const initialLimit = parseInt(searchParams.get('limit') || '12');
  const initialView = searchParams.get('view') || 'grid';

  // Local state
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? initialCategory.split(',') : []
  );
  const [sort, setSort] = useState(initialSort);
  const [order, setOrder] = useState(initialOrder);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [viewMode, setViewMode] = useState(initialView);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);
  const [columnOrder, setColumnOrder] = useState(DEFAULT_COLUMNS);

  // Debounced search - Performance Optimization
  const debouncedSearch = useDebounce(searchInput, 300);

  // Fetch categories on mount
  useEffect(() => {
    api.get('/products/categories')
      .then(setCategories)
      .catch(console.error);
  }, []);

  // Build query string - useMemo for Performance Optimization
  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategories.length) params.set('category', selectedCategories.join(','));
    if (sort) params.set('sort', sort);
    if (order !== 'asc') params.set('order', order);
    params.set('page', String(page));
    params.set('limit', String(limit));
    return params.toString();
  }, [debouncedSearch, selectedCategories, sort, order, page, limit]);

  // Fetch products - useCallback for Performance Optimization
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.get(`/products?${queryString}`);
      setProducts(data.products);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [queryString]);

  // Fetch on query change
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Real-time polling - refetch every 30 seconds
  usePolling(fetchProducts, 30000, true);

  // Sync URL with filters - URL State Synchronization
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (selectedCategories.length) params.set('category', selectedCategories.join(','));
    if (sort) params.set('sort', sort);
    if (order !== 'asc') params.set('order', order);
    if (page > 1) params.set('page', String(page));
    if (limit !== 12) params.set('limit', String(limit));
    if (viewMode !== 'grid') params.set('view', viewMode);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, selectedCategories, sort, order, page, limit, viewMode, setSearchParams]);

  // Handlers - useCallback for Performance Optimization
  const handleSearch = useCallback((e) => {
    setSearchInput(e.target.value);
    setPage(1);
  }, []);

  const handleCategoryToggle = useCallback((cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setPage(1);
  }, []);

  const handleClearCategories = useCallback(() => {
    setSelectedCategories([]);
    setPage(1);
  }, []);

  const handleSort = useCallback((newSort) => {
    if (sort === newSort) {
      setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(newSort);
      setOrder('asc');
    }
    setPage(1);
  }, [sort]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1);
  }, []);

  const handleTogglePublish = useCallback(async (id) => {
    try {
      await api.patch(`/products/${id}/toggle-publish`);
      setProducts(prev =>
        prev.map(p =>
          p._id === id ? { ...p, isPublished: !p.isPublished } : p
        )
      );
    } catch (error) {
      console.error('Toggle publish failed:', error);
    }
  }, []);

  const handleViewMode = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  // Sort icon helper
  const SortIcon = ({ field }) => {
    if (sort !== field) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon active">{order === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="products-page animate-fade-in">
      {/* Page Header */}
      <div className="products-header">
        <div>
          <h1 className="products-title">Products</h1>
          <p className="products-subtitle">{total} products found</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        {/* Search */}
        <div className="products-search-wrap">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="input products-search"
            placeholder="Search products..."
            value={searchInput}
            onChange={handleSearch}
            id="product-search"
          />
          {searchInput && (
            <button className="search-clear" onClick={() => { setSearchInput(''); setPage(1); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Sort Buttons */}
        <div className="products-sort-group">
          <button
            className={`btn btn-sm ${sort === 'price' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleSort('price')}
            id="sort-price"
          >
            Price <SortIcon field="price" />
          </button>
          <button
            className={`btn btn-sm ${sort === 'rating' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleSort('rating')}
            id="sort-rating"
          >
            Rating <SortIcon field="rating" />
          </button>
          <button
            className={`btn btn-sm ${sort === 'name' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleSort('name')}
            id="sort-name"
          >
            Name <SortIcon field="name" />
          </button>
        </div>

        {/* View Toggle + Column Customizer */}
        <div className="products-view-group">
          {viewMode === 'table' && (
            <ColumnCustomizer
              visibleColumns={visibleColumns}
              columnOrder={columnOrder}
              onVisibleChange={setVisibleColumns}
              onOrderChange={setColumnOrder}
            />
          )}
          <div className="view-toggle">
            <button
              className={`btn-icon ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => handleViewMode('grid')}
              title="Grid view"
              id="view-grid"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              className={`btn-icon ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => handleViewMode('table')}
              title="Table view"
              id="view-table"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="products-filters">
        <div className="category-filters">
          <button
            className={`category-chip ${selectedCategories.length === 0 ? 'active' : ''}`}
            onClick={handleClearCategories}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-chip ${selectedCategories.includes(cat) ? 'active' : ''}`}
              onClick={() => handleCategoryToggle(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Content */}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading products...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="products-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
            <line x1="3.27" y1="6.96" x2="12" y2="12.01" />
          </svg>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              isAdmin={isAdmin}
              onTogglePublish={handleTogglePublish}
            />
          ))}
        </div>
      ) : (
        <div className="products-table-wrap glass-card">
          <table className="products-table" id="products-table">
            <thead>
              <tr>
                {columnOrder.filter(col => visibleColumns.includes(col)).map(col => (
                  <th key={col} className="table-header">
                    {col === 'image' ? '' : col.charAt(0).toUpperCase() + col.slice(1)}
                  </th>
                ))}
                {isAdmin && <th className="table-header">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <ProductRow
                  key={product._id}
                  product={product}
                  isAdmin={isAdmin}
                  onTogglePublish={handleTogglePublish}
                  visibleColumns={visibleColumns}
                  columnOrder={columnOrder}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}
