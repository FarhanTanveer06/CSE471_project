import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/wishlist.css';

const Wishlist = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removing, setRemoving] = useState({});
  const [discounts, setDiscounts] = useState([]);
  const [showDiscounts, setShowDiscounts] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchWishlist();
    fetchDiscounts();
  }, [user, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      setWishlist(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load wishlist');
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await api.get('/wishlist/discounts');
      setDiscounts(response.data.discounts || []);
    } catch (err) {
      console.error('Error fetching discounts:', err);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      setRemoving({ ...removing, [productId]: true });
      const response = await api.delete(`/wishlist/product/${productId}`);
      setWishlist(response.data);
      // Update discounts if this product was in discounts
      setDiscounts(discounts.filter(d => d.product._id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove from wishlist');
      console.error('Error removing from wishlist:', err);
    } finally {
      setRemoving({ ...removing, [productId]: false });
    }
  };

  const clearWishlist = async () => {
    if (!window.confirm('Are you sure you want to clear your entire wishlist?')) {
      return;
    }
    
    try {
      await api.delete('/wishlist/clear');
      setWishlist({ items: [] });
      setDiscounts([]);
      alert('Wishlist cleared successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear wishlist');
      console.error('Error clearing wishlist:', err);
    }
  };

  const handleAddToCart = async (product, size) => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !size) {
      alert('Please select a size');
      return;
    }

    if (product.availability <= 0) {
      alert('Product is out of stock');
      return;
    }

    try {
      await api.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        size: size || product.sizes?.[0] || 'M'
      });
      alert('Item added to cart successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
      console.error('Error adding to cart:', err);
    }
  };

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error && !wishlist) {
    return (
      <div className="wishlist-container">
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const wishlistItems = wishlist?.items || [];

  return (
    <div className="wishlist-container">
      <div className="container py-5">
        <div className="wishlist-header">
          <h2 className="wishlist-title">My Wishlist</h2>
          {discounts.length > 0 && (
            <button
              className="wishlist-discounts-btn"
              onClick={() => setShowDiscounts(!showDiscounts)}
            >
              {showDiscounts ? 'Hide' : 'Show'} Special Offers ({discounts.length})
            </button>
          )}
        </div>

        {/* Discounts Notification */}
        {showDiscounts && discounts.length > 0 && (
          <div className="wishlist-discounts-section">
            <h3 className="discounts-title">🎉 Special Offers on Your Wishlist Items!</h3>
            <div className="discounts-grid">
              {discounts.map((discount) => {
                const product = discount.product;
                const productImages = product.images && product.images.length > 0 
                  ? product.images 
                  : (product.imageUrl ? [product.imageUrl] : []);
                const imageSrc = productImages.length > 0 
                  ? productImages[0]
                  : 'https://via.placeholder.com/300x400?text=No+Image';

                return (
                  <div key={product._id} className="discount-card">
                    <div className="discount-badge">Featured</div>
                    <Link to={`/products/${product._id}`} className="discount-link">
                      <img src={imageSrc} alt={product.name} className="discount-image" />
                      <div className="discount-info">
                        <h5>{product.name}</h5>
                        <div className="discount-price">${product.price}</div>
                      </div>
                    </Link>
                    <div className="discount-actions">
                      <button
                        className="discount-action-btn primary"
                        onClick={() => handleAddToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">❤️</div>
            <h3>Your wishlist is empty</h3>
            <p>Start adding products you love to your wishlist!</p>
            <Link to="/products" className="wishlist-empty-btn">
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="wishlist-actions">
              <button
                className="wishlist-clear-btn"
                onClick={clearWishlist}
              >
                Clear Wishlist
              </button>
            </div>

            <div className="wishlist-grid">
              {wishlistItems.map((item) => {
                const product = item.productId;
                if (!product) return null;

                const productImages = product.images && product.images.length > 0 
                  ? product.images 
                  : (product.imageUrl ? [product.imageUrl] : []);
                const imageSrc = productImages.length > 0 
                  ? productImages[0]
                  : 'https://via.placeholder.com/300x400?text=No+Image';
                const isAvailable = product.availability > 0;

                return (
                  <div key={item._id || product._id} className="wishlist-item-card">
                    <button
                      className="wishlist-remove-btn"
                      onClick={() => removeFromWishlist(product._id)}
                      disabled={removing[product._id]}
                      title="Remove from wishlist"
                    >
                      {removing[product._id] ? '...' : '×'}
                    </button>

                    {product.featured && (
                      <div className="wishlist-featured-badge">Featured</div>
                    )}

                    <Link to={`/products/${product._id}`} className="wishlist-item-link">
                      <div className="wishlist-item-image-container">
                        <img 
                          src={imageSrc} 
                          alt={product.name}
                          className="wishlist-item-image"
                        />
                        {!isAvailable && (
                          <div className="wishlist-item-overlay">
                            <span className="wishlist-item-badge out-of-stock">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      <div className="wishlist-item-info">
                        <h5 className="wishlist-item-name">{product.name}</h5>
                        <div className="wishlist-item-details">
                          <span className="wishlist-item-category">{product.category}</span>
                          {product.type && (
                            <span className="wishlist-item-type">{product.type}</span>
                          )}
                        </div>
                        <div className="wishlist-item-price">${product.price}</div>
                        {product.averageRating && (
                          <div className="wishlist-item-rating">
                            ⭐ {product.averageRating.toFixed(1)} ({product.totalReviews || 0})
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="wishlist-item-actions">
                      <button
                        className="wishlist-action-btn"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        View Details
                      </button>
                      {isAvailable && (
                        <button
                          className="wishlist-action-btn primary"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

