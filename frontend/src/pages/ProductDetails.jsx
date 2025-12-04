import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error || 'Product not found'}
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

  return (
    <div className="container py-5">
      <div className="row">
        {/* Image Gallery Section */}
        <div className="col-md-6 mb-4">
          {/* Main Image */}
          <div className="mb-3">
            <img 
              src={productImages[selectedImageIndex] || productImages[0]} 
              className="img-fluid rounded shadow" 
              alt={product.name}
              style={{ width: '100%', height: '500px', objectFit: 'cover' }}
            />
          </div>
          
          {/* Thumbnail Images */}
          {productImages && productImages.length > 1 && (
            <div className="d-flex gap-2 flex-wrap">
              {productImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className={`img-thumbnail ${selectedImageIndex === index ? 'border-primary border-3' : ''}`}
                  style={{ 
                    width: '100px', 
                    height: '100px', 
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedImageIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Information Section */}
        <div className="col-md-6">
          <h1 className="display-5 fw-bold mb-3">{product.name}</h1>
          
          {/* Price */}
          <div className="mb-3">
            <h2 className="text-primary fw-bold">${product.price}</h2>
          </div>

          {/* Availability Badge */}
          <div className="mb-3">
            <span className={`badge ${isAvailable ? 'bg-success' : 'bg-danger'} fs-6 px-3 py-2`}>
              {availabilityText}
            </span>
          </div>

          {/* Category and Type */}
          <div className="mb-3">
            <span className="badge bg-secondary me-2 text-capitalize">{product.category}</span>
            {product.type && (
              <span className="badge bg-info text-capitalize">{product.type}</span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-4">
              <h5 className="fw-bold mb-2">Description</h5>
              <p className="text-muted">{product.description}</p>
            </div>
          )}

          {/* Product Details */}
          <div className="card mb-4">
            <div className="card-header bg-light">
              <h5 className="mb-0 fw-bold">Product Details</h5>
            </div>
            <div className="card-body">
              <table className="table table-borderless mb-0">
                <tbody>
                  {product.fabricType && (
                    <tr>
                      <td className="fw-bold" style={{ width: '40%' }}>Fabric Type:</td>
                      <td>{product.fabricType}</td>
                    </tr>
                  )}
                  {product.gsm && (
                    <tr>
                      <td className="fw-bold">GSM:</td>
                      <td>{product.gsm} g/m²</td>
                    </tr>
                  )}
                  <tr>
                    <td className="fw-bold">Category:</td>
                    <td className="text-capitalize">{product.category}</td>
                  </tr>
                  {product.type && (
                    <tr>
                      <td className="fw-bold">Type:</td>
                      <td className="text-capitalize">{product.type}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="fw-bold">Stock:</td>
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
          <div className="d-grid gap-2">
            <button 
              className="btn btn-primary btn-lg" 
              disabled={!isAvailable}
            >
              {isAvailable ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button className="btn btn-outline-secondary btn-lg">
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
