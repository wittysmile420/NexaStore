import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Memoized product table row for table view.
 * Performance Optimization: React.memo prevents unnecessary re-renders.
 */
const ProductRow = React.memo(function ProductRow({ product, isAdmin, onTogglePublish, visibleColumns, columnOrder }) {
  const navigate = useNavigate();

  const stockBadge = product.stock > 10
    ? 'badge-success'
    : product.stock > 0
    ? 'badge-warning'
    : 'badge-danger';

  const stockText = product.stock > 10
    ? `In Stock (${product.stock})`
    : product.stock > 0
    ? `Low (${product.stock})`
    : 'Out of Stock';

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < fullStars ? '' : 'star-empty'}>★</span>
      );
    }
    return stars;
  };

  const cellRenderers = {
    image: (
      <td key="image" className="table-cell table-cell-img">
        <img src={product.thumbnail} alt={product.title} className="table-product-img" loading="lazy" />
      </td>
    ),
    name: (
      <td key="name" className="table-cell table-cell-name">
        <span className="table-product-name">{product.title}</span>
        {product.brand && <span className="table-product-brand">{product.brand}</span>}
      </td>
    ),
    category: (
      <td key="category" className="table-cell">
        <span className="badge badge-info">{product.category}</span>
      </td>
    ),
    price: (
      <td key="price" className="table-cell table-cell-price">
        <span className="table-price">${product.price.toFixed(2)}</span>
        {product.discountPercentage > 0 && (
          <span className="table-discount">-{Math.round(product.discountPercentage)}%</span>
        )}
      </td>
    ),
    stock: (
      <td key="stock" className="table-cell">
        <span className={`badge ${stockBadge}`}>{stockText}</span>
      </td>
    ),
    rating: (
      <td key="rating" className="table-cell">
        <div className="table-rating">
          <div className="stars">{renderStars(product.rating)}</div>
          <span className="table-rating-num">{product.rating.toFixed(1)}</span>
        </div>
      </td>
    ),
  };

  // Render cells in column order, only for visible columns
  const orderedColumns = columnOrder.filter(col => visibleColumns.includes(col));

  return (
    <tr
      className={`table-row ${!product.isPublished ? 'table-row-unpublished' : ''}`}
      onClick={() => navigate(`/products/${product._id}`)}
      id={`product-row-${product._id}`}
    >
      {orderedColumns.map(col => cellRenderers[col])}
      {isAdmin && (
        <td className="table-cell table-cell-actions">
          <button
            className={`btn btn-sm ${product.isPublished ? 'btn-secondary' : 'btn-primary'}`}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublish(product._id);
            }}
          >
            {product.isPublished ? 'Unpublish' : 'Publish'}
          </button>
        </td>
      )}
    </tr>
  );
});

export default ProductRow;
