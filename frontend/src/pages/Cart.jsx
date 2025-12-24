import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/cart.css';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState({});
  const [attemptedQuantities, setAttemptedQuantities] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user, navigate]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
      setError(null);
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to load cart';
      // Remove localhost references from error message
      errorMessage = errorMessage.replace(/http:\/\/localhost:\d+/gi, '').replace(/localhost/gi, '').trim();
      setError(errorMessage || 'Failed to load cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Store attempted quantity to show warning even if backend rejects
    setAttemptedQuantities(prev => ({ ...prev, [itemId]: newQuantity }));
    
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      const response = await api.put(`/cart/item/${itemId}`, { quantity: newQuantity });
      setCart(response.data);
      // Clear attempted quantity on success
      setAttemptedQuantities(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to update quantity';
      // Remove localhost references from error message
      errorMessage = errorMessage.replace(/http:\/\/localhost:\d+/gi, '').replace(/localhost/gi, '').trim();
      alert(errorMessage || 'Failed to update quantity');
      console.error('Error updating quantity:', err);
      // Refresh cart on error
      await fetchCart();
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to remove this item from cart?')) {
      return;
    }
    
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      setCart(response.data);
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to remove item';
      // Remove localhost references from error message
      errorMessage = errorMessage.replace(/http:\/\/localhost:\d+/gi, '').replace(/localhost/gi, '').trim();
      alert(errorMessage || 'Failed to remove item');
      console.error('Error removing item:', err);
      // Refresh cart on error
      fetchCart();
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }
    
    try {
      await api.delete('/cart/clear');
      setCart({ items: [] });
    } catch (err) {
      let errorMessage = err.response?.data?.message || 'Failed to clear cart';
      // Remove localhost references from error message
      errorMessage = errorMessage.replace(/http:\/\/localhost:\d+/gi, '').replace(/localhost/gi, '').trim();
      alert(errorMessage || 'Failed to clear cart');
      console.error('Error clearing cart:', err);
      // Refresh cart on error
      fetchCart();
    }
  };

  const getTotalAmount = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const getTotalItems = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error && !cart) {
    // Remove localhost references from error message
    const cleanError = error.replace(/http:\/\/localhost:\d+/gi, '').replace(/localhost/gi, '').trim();
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error Loading Cart</h5>
          <p>{cleanError || 'Failed to load cart. Please try again.'}</p>
          <hr />
          <button className="btn btn-primary" onClick={fetchCart}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="mb-4">Shopping Cart</h2>
      
      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-4">Your cart is empty</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-lg-8">
              <div className="cart-items">
                {cart.items.map((item) => {
                  const product = item.productId;
                  // Skip rendering if product is not populated or missing
                  if (!product || !product._id) {
                    return null;
                  }
                  // Check if stock is insufficient
                  // Get product availability - handle various data types
                  let productAvailability = 0;
                  if (product.availability !== undefined && product.availability !== null) {
                    productAvailability = Number(product.availability);
                    if (isNaN(productAvailability)) {
                      productAvailability = 0;
                    }
                  }
                  
                  const itemQuantity = Number(item.quantity) || 1;
                  // Check if user attempted to set a higher quantity
                  const attemptedQuantity = attemptedQuantities[item._id];
                  const quantityToCheck = attemptedQuantity !== undefined ? attemptedQuantity : itemQuantity;
                  
                  // Show warning if requested quantity exceeds available stock
                  // Show warning if we have valid availability data and quantity exceeds it
                  const isStockInsufficient = productAvailability > 0 && quantityToCheck > productAvailability;
                  
                  return (
                    <div key={item._id} className="cart-item mb-3 p-3 border rounded">
                      {isStockInsufficient && (
                        <div className="alert alert-warning mb-2 py-2" role="alert" style={{ display: 'block' }}>
                          <strong style={{ color: '#856404' }}>Insufficient stock available</strong>
                        </div>
                      )}
                      <div className="row align-items-center">
                        <div className="col-md-2">
                          <div className="cart-item-image-container">
                            <img
                              src={product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/150'}
                              alt={product.name || 'Product'}
                              className="cart-item-image"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/150';
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <h5 className="mb-1">
                            <Link to={`/products/${product._id}`} className="text-decoration-none">
                              {product.name || 'Product'}
                            </Link>
                          </h5>
                          <p className="text-muted mb-1">
                            <small>Size: {item.size}</small>
                          </p>
                          <p className="text-muted mb-0">
                            <small>Color: {product.color || 'N/A'}</small>
                          </p>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Quantity</label>
                          <div className="input-group">
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              disabled={updating[item._id] || item.quantity <= 1}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              className="form-control text-center"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 1;
                                const maxQuantity = productAvailability > 0 ? productAvailability : 999;
                                const finalVal = val > maxQuantity ? maxQuantity : val;
                                updateQuantity(item._id, finalVal);
                              }}
                              min="1"
                              max={productAvailability > 0 ? productAvailability : 999}
                              style={{ maxWidth: '60px' }}
                            />
                            <button
                              className="btn btn-outline-secondary"
                              type="button"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              disabled={updating[item._id]}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="col-md-2 text-center">
                          <p className="mb-0 fw-bold">BDT {(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-muted mb-0">
                            <small>BDT {item.price.toFixed(2)} each</small>
                          </p>
                        </div>
                        <div className="col-md-2 text-end">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeItem(item._id)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-3">
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearCart}
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="cart-summary p-4 border rounded">
                <h5 className="mb-3">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>Items ({getTotalItems()})</span>
                  <span>BDT {getTotalAmount().toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total</strong>
                  <strong>BDT {getTotalAmount().toFixed(2)}</strong>
                </div>
                <button
                  className="btn btn-primary w-100 mb-2"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
                <Link to="/products" className="btn btn-outline-secondary w-100">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;

