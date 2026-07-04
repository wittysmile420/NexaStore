import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Auto-play carousel
  useEffect(() => {
    if (!product?.images?.length || product.images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentImage(prev => (prev + 1) % product.images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [product]);

  const handlePrevImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImage(prev => (prev - 1 + product.images.length) % product.images.length);
  }, [product]);

  const handleNextImage = useCallback(() => {
    if (!product?.images?.length) return;
    setCurrentImage(prev => (prev + 1) % product.images.length);
  }, [product]);

  const renderStars = (rating) => {
    const stars = [];
    const full = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < full ? '' : 'star-empty'}>★</span>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading product...</span>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="products-empty">
        <h3>{error || 'Product not found'}</h3>
        <button className="btn btn-primary" onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.thumbnail];
  const stockBadge = product.stock > 10 ? 'badge-success' : product.stock > 0 ? 'badge-warning' : 'badge-danger';
  const stockText = product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock';
  const discountedPrice = product.price * (1 - product.discountPercentage / 100);

  return (
    <div className="product-detail animate-fade-in">
      {/* Breadcrumb */}
      <button className="product-detail-back" onClick={() => navigate(-1)} id="back-to-products">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="15,18 9,12 15,6" />
        </svg>
        Back to Products
      </button>

      <div className="product-detail-layout">
        {/* Image Carousel */}
        <div className="product-carousel glass-card">
          <div className="carousel-viewport">
            <img
              src={images[currentImage]}
              alt={`${product.title} - Image ${currentImage + 1}`}
              className="carousel-image"
              key={currentImage}
            />

            {images.length > 1 && (
              <>
                <button className="carousel-btn carousel-btn-prev" onClick={handlePrevImage}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="15,18 9,12 15,6" />
                  </svg>
                </button>
                <button className="carousel-btn carousel-btn-next" onClick={handleNextImage}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Carousel Dots */}
          {images.length > 1 && (
            <div className="carousel-dots">
              {images.map((_, i) => (
                <button
                  key={i}
                  className={`carousel-dot ${i === currentImage ? 'active' : ''}`}
                  onClick={() => setCurrentImage(i)}
                />
              ))}
            </div>
          )}

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="carousel-thumbnails">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`carousel-thumb ${i === currentImage ? 'active' : ''}`}
                  onClick={() => setCurrentImage(i)}
                >
                  <img src={img} alt={`Thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          {/* Category Badge */}
          <div className="product-info-badges">
            <span className="badge badge-info">{product.category}</span>
            <span className={`badge ${stockBadge}`}>{stockText}</span>
            {!product.isPublished && (
              <span className="badge badge-warning">Unpublished</span>
            )}
          </div>

          <h1 className="product-info-title">{product.title}</h1>

          {product.brand && (
            <p className="product-info-brand">by {product.brand}</p>
          )}

          {/* Rating */}
          <div className="product-info-rating">
            <div className="stars" style={{ fontSize: '18px' }}>
              {renderStars(product.rating)}
            </div>
            <span className="product-info-rating-num">{product.rating.toFixed(1)}</span>
            <span className="product-info-reviews-count">
              ({product.reviews?.length || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="product-info-price-block">
            <span className="product-info-price">${discountedPrice.toFixed(2)}</span>
            {product.discountPercentage > 0 && (
              <>
                <span className="product-info-original-price">${product.price.toFixed(2)}</span>
                <span className="product-info-discount">
                  -{Math.round(product.discountPercentage)}% OFF
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="product-info-section">
            <h3 className="product-info-section-title">Description</h3>
            <p className="product-info-description">{product.description}</p>
          </div>

          {/* Details Grid */}
          <div className="product-info-section">
            <h3 className="product-info-section-title">Details</h3>
            <div className="product-details-grid">
              <div className="detail-item">
                <span className="detail-label">SKU</span>
                <span className="detail-value">{product.sku}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Weight</span>
                <span className="detail-value">{product.weight} kg</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Stock</span>
                <span className="detail-value">{product.stock} units</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Min Order</span>
                <span className="detail-value">{product.minimumOrderQuantity}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Warranty</span>
                <span className="detail-value">{product.warrantyInformation}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Shipping</span>
                <span className="detail-value">{product.shippingInformation}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Return</span>
                <span className="detail-value">{product.returnPolicy}</span>
              </div>
              {product.dimensions && (
                <div className="detail-item">
                  <span className="detail-label">Dimensions</span>
                  <span className="detail-value">
                    {product.dimensions.width} × {product.dimensions.height} × {product.dimensions.depth} cm
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="product-info-tags">
              {product.tags.map(tag => (
                <span key={tag} className="product-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews?.length > 0 && (
        <div className="product-reviews glass-card">
          <h3 className="product-reviews-title">
            Customer Reviews ({product.reviews.length})
          </h3>
          <div className="product-reviews-list">
            {product.reviews.map((review, i) => (
              <div key={i} className="review-item">
                <div className="review-header">
                  <div className="review-avatar">
                    {review.reviewerName.charAt(0)}
                  </div>
                  <div className="review-meta">
                    <span className="review-name">{review.reviewerName}</span>
                    <div className="stars" style={{ fontSize: '12px' }}>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="review-date">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
