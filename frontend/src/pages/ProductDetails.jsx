import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import '../styles/productDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="product-details-container">
        <div className="container product-loading">
          <div className="spinner-border spinner text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-container">
        <div className="container py-5">
          <div className="product-error" role="alert">
            {error || 'Product not found'}
          </div>
        </div>
      </div>
    );
  }

  const isAvailable = product.availability > 0;
  const availabilityText = isAvailable 
    ? `${product.availability} in stock` 
    : 'Out of stock';

  // Handle backward compatibility - if product has imageUrl instead of images array
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  // Fallback placeholder image if no images are available
  const fallbackImage = 'https://via.placeholder.com/600x500?text=No+Image+Available';
  const mainImageSrc = productImages.length > 0 
    ? (productImages[selectedImageIndex] || productImages[0])
    : fallbackImage;

  return (
    <div className="product-details-container">
      <div className="container py-5">
        <div className="row">
          {/* Image Gallery Section */}
          <div className="col-md-6 mb-4">
            <div className="product-image-gallery">
              {/* Main Image */}
              <img 
                src={mainImageSrc} 
                className="product-main-image" 
                alt={product.name}
              />
              
              {/* Thumbnail Images */}
              {productImages && productImages.length > 1 && (
                <div className="product-thumbnails">
                  {productImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className={`product-thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Information Section */}
          <div className="col-md-6 product-info-section">
            <h1 className="product-title">{product.name}</h1>
            
            {/* Price */}
            <div className="product-price">${product.price}</div>

            {/* Availability Badge */}
            <div className="product-badges">
              <span className={`product-badge availability ${isAvailable ? 'available' : 'out-of-stock'}`}>
                {availabilityText}
              </span>
            </div>

            {/* Category, Type, and Color */}
            <div className="product-badges">
              <span className="product-badge category">{product.category}</span>
              {product.type && (
                <span className="product-badge type">{product.type}</span>
              )}
              {product.color && (
                <span className="product-badge" style={{
                  background: '#3498db',
                  color: '#ffffff'
                }}>{product.color}</span>
              )}
            </div>

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="product-size-selection mt-3">
                <h5 className="mb-2">Select Size:</h5>
                <div className="size-buttons d-flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        minWidth: '50px',
                        padding: '0.5rem 1rem',
                        border: selectedSize === size ? '2px solid #9b59b6' : '1px solid #dee2e6',
                        background: selectedSize === size ? '#9b59b6' : '#ffffff',
                        color: selectedSize === size ? '#ffffff' : '#333',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <p className="text-success mt-2 mb-0">
                    <small>Selected: {selectedSize}</small>
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="product-description">
                <h5>Description</h5>
                <p>{product.description}</p>
              </div>
            )}

            {/* Product Details */}
            <div className="product-details-card">
              <div className="product-details-card-header">
                <h5>Product Details</h5>
              </div>
              <div className="product-details-card-body">
                <table className="product-details-table">
                  <tbody>
                    {product.fabricType && (
                      <tr>
                        <td>Fabric Type:</td>
                        <td>{product.fabricType}</td>
                      </tr>
                    )}
                    {product.gsm && (
                      <tr>
                        <td>GSM:</td>
                        <td>{product.gsm} g/m²</td>
                      </tr>
                    )}
                    <tr>
                      <td>Category:</td>
                      <td>{product.category}</td>
                    </tr>
                    {product.type && (
                      <tr>
                        <td>Type:</td>
                        <td>{product.type}</td>
                      </tr>
                    )}
                    {product.color && (
                      <tr>
                        <td>Color:</td>
                        <td>{product.color}</td>
                      </tr>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <tr>
                        <td>Available Sizes:</td>
                        <td>{product.sizes.join(', ')}</td>
                      </tr>
                    )}
                    <tr>
                      <td>Stock:</td>
                      <td>
                        <span className={isAvailable ? 'text-success' : 'text-danger'}>
                          {availabilityText}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="product-action-btn primary" 
                disabled={!isAvailable || (product.sizes && product.sizes.length > 0 && !selectedSize)}
                onClick={() => {
                  if (product.sizes && product.sizes.length > 0 && !selectedSize) {
                    alert('Please select a size');
                  } else {
                    // TODO: Implement add to cart functionality with selectedSize
                    console.log('Add to cart:', { productId: product._id, size: selectedSize });
                  }
                }}
              >
                {isAvailable 
                  ? (product.sizes && product.sizes.length > 0 && !selectedSize 
                      ? 'Select Size to Add to Cart' 
                      : 'Add to Cart')
                  : 'Out of Stock'}
              </button>
              <button className="product-action-btn secondary">
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
