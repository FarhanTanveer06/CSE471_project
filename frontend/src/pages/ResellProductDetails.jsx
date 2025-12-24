import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/productDetails.css';

const ResellProductDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/resell/${id}`);
        setProduct(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      alert('Please login to purchase items');
      navigate('/login');
      return;
    }

    if (product.sellerId._id === user.id) {
      alert('You cannot purchase your own item');
      return;
    }

    if (product.status !== 'available') {
      alert('This item is no longer available');
      return;
    }

    if (!window.confirm(`Are you sure you want to purchase "${product.name}" for BDT${product.price}?`)) {
      return;
    }

    try {
      setPurchasing(true);
      await api.post(`/resell/${id}/purchase`);
      alert('Purchase successful! The seller will be notified.');
      navigate('/resell');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to purchase item');
    } finally {
      setPurchasing(false);
    }
  };

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

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  const fallbackImage = 'https://via.placeholder.com/600x500?text=No+Image+Available';
  const mainImageSrc = productImages.length > 0 
    ? (productImages[selectedImageIndex] || productImages[0])
    : fallbackImage;

  const isAvailable = product.status === 'available';
  const isOwner = user && product.sellerId._id === user.id;

  return (
    <div className="product-details-container">
      <div className="container py-5">
        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="product-image-gallery">
              <div className="product-main-image-container">
                <img 
                  src={mainImageSrc} 
                  className="product-main-image" 
                  alt={product.name}
                />
              </div>
              
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

          <div className="col-md-6 product-info-section">
            <div className="mb-3">
              <span className="badge bg-info">Preowned Item</span>
              {!isAvailable && (
                <span className="badge bg-danger ms-2">Sold</span>
              )}
            </div>

            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-price">BDT {product.price}</div>
            {product.originalPrice && (
              <p className="text-muted">
                <small>Original Price: BDT {product.originalPrice}</small>
              </p>
            )}

            <div className="product-badges mb-3">
              <span className="product-badge category">{product.category}</span>
              {product.type && (
                <span className="product-badge type">{product.type}</span>
              )}
              <span className="product-badge" style={{
                background: '#636668ff',
                color: '#ffffff'
              }}>{product.color}</span>
              <span className="badge bg-warning text-dark">{product.condition}</span>
            </div>

            <div className="mb-3">
              <p className="mb-1"><strong>Seller:</strong> {product.sellerId?.name || 'Unknown'}</p>
              {product.sellerId?.username && (
                <p className="text-muted mb-0"><small>@{product.sellerId.username}</small></p>
              )}
            </div>

            {product.description && (
              <div className="product-description mb-3">
                <h5>Description</h5>
                <p>{product.description}</p>
              </div>
            )}

            <div className="product-details-card mb-3">
              <div className="product-details-card-header">
                <h5>Item Details</h5>
              </div>
              <div className="product-details-card-body">
                <table className="product-details-table">
                  <tbody>
                    <tr>
                      <td>Size:</td>
                      <td>{product.size}</td>
                    </tr>
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
                    <tr>
                      <td>Color:</td>
                      <td>{product.color}</td>
                    </tr>
                    <tr>
                      <td>Condition:</td>
                      <td>{product.condition}</td>
                    </tr>
                    {product.fabricType && (
                      <tr>
                        <td>Fabric Type:</td>
                        <td>{product.fabricType}</td>
                      </tr>
                    )}
                    {product.purchaseDate && (
                      <tr>
                        <td>Purchase Date:</td>
                        <td>{new Date(product.purchaseDate).toLocaleDateString()}</td>
                      </tr>
                    )}
                    <tr>
                      <td>Listed On:</td>
                      <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="product-actions">
              {isOwner ? (
                <>
                  <Link 
                    to="/resell/my-items" 
                    className="product-action-btn secondary"
                  >
                    View My Items
                  </Link>
                  {isAvailable && (
                    <button 
                      className="product-action-btn secondary"
                      onClick={async () => {
                        if (window.confirm('Mark this item as sold?')) {
                          try {
                            await api.post(`/resell/${id}/sold`);
                            alert('Item marked as sold');
                            window.location.reload();
                          } catch (err) {
                            alert(err.response?.data?.message || 'Failed to update status');
                          }
                        }
                      }}
                    >
                      Mark as Sold
                    </button>
                  )}
                </>
              ) : (
                <button 
                  className="product-action-btn primary" 
                  disabled={!isAvailable || purchasing}
                  onClick={handlePurchase}
                >
                  {purchasing ? 'Processing...' : isAvailable ? 'Purchase Item' : 'Sold Out'}
                </button>
              )}
              <Link 
                to="/resell" 
                className="product-action-btn secondary"
              >
                Back to Thrift Items
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResellProductDetails;

