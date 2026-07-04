import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Memoized product card for grid view.
 * Performance Optimization: React.memo prevents re-renders when props haven't changed.
 */
const ProductCard = React.memo(function ProductCard({ product, isAdmin, onTogglePublish }) {
  const navigate = useNavigate();

  const stockBadge = product.stock > 10
    ? 'badge-success'
    : product.stock > 0
    ? 'badge-warning'
    : 'badge-danger';

  const stockText = product.stock > 10
    ? 'In Stock'
    : product.stock > 0
    ? 'Low Stock'
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

  return (
    <div
      className={`product-card glass-card ${!product.isPublished ? 'product-card-unpublished' : ''}`}
      onClick={() => navigate(`/products/${product._id}`)}
      id={`product-card-${product._id}`}
    >
      {isAdmin && (
        <button
          className={`product-publish-toggle ${product.isPublished ? 'published' : 'unpublished'}`}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePublish(product._id);
          }}
          title={product.isPublished ? 'Unpublish' : 'Publish'}
        >
          {product.isPublished ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          )}
        </button>
      )}

      <div className="product-card-img-wrap">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="product-card-img"
          loading="lazy"
        />
        <span className="product-card-category badge badge-info">{product.category}</span>
      </div>

      <div className="product-card-body">
        <h3 className="product-card-title">{product.title}</h3>

        <div className="product-card-meta">
          <div className="product-card-rating">
            <div className="stars">{renderStars(product.rating)}</div>
            <span className="product-card-rating-num">{product.rating.toFixed(1)}</span>
          </div>
          <span className={`badge ${stockBadge}`}>{stockText}</span>
        </div>

        <div className="product-card-footer">
          <span className="product-card-price">${product.price.toFixed(2)}</span>
          {product.discountPercentage > 0 && (
            <span className="product-card-discount">-{Math.round(product.discountPercentage)}%</span>
          )}
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
