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
  const [inputQuantities, setInputQuantities] = useState({});
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const cleanErrorMessage = (message) => {
    return message.replace(/http:\/\/localhost:\d+/gi, '').replace(/localhost/gi, '').trim() || message;
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  // Handle ESC key to close modals and prevent body scroll
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (showRemoveModal) {
          setShowRemoveModal(false);
          setItemToRemove(null);
        }
        if (showErrorModal) {
          setShowErrorModal(false);
          setErrorMessage('');
        }
      }
    };

    if (showRemoveModal || showErrorModal) {
      document.addEventListener('keydown', handleEsc);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showRemoveModal, showErrorModal]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to load cart';
      setError(cleanErrorMessage(errorMessage));
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setAttemptedQuantities(prev => {
      if (prev[itemId] === undefined) {
        return { ...prev, [itemId]: newQuantity };
      }
      return prev;
    });
    
    try {
      setUpdating(prev => ({ ...prev, [itemId]: true }));
      const response = await api.put(`/cart/item/${itemId}`, { quantity: newQuantity });
      setCart(response.data);
      setAttemptedQuantities(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
      setInputQuantities(prev => {
        const newState = { ...prev };
        delete newState[itemId];
        return newState;
      });
    } catch (err) {
      console.error('Error updating quantity:', err);
      await fetchCart();
    } finally {
      setUpdating(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleRemoveClick = (itemId) => {
    setItemToRemove(itemId);
    setShowRemoveModal(true);
  };

  const confirmRemoveItem = async () => {
    if (!itemToRemove) return;
    
    setShowRemoveModal(false);
    
    try {
      const response = await api.delete(`/cart/item/${itemToRemove}`);
      setCart(response.data);
      setItemToRemove(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to remove item';
      setErrorMessage(cleanErrorMessage(errorMsg));
      setShowErrorModal(true);
      console.error('Error removing item:', err);
      fetchCart();
      setItemToRemove(null);
    }
  };

  const closeRemoveModal = () => {
    setShowRemoveModal(false);
    setItemToRemove(null);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
  };

  const clearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your entire cart?')) {
      return;
    }
    
    try {
      await api.delete('/cart/clear');
      setCart({ items: [] });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to clear cart';
      alert(cleanErrorMessage(errorMessage));
      console.error('Error clearing cart:', err);
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
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error Loading Cart</h5>
          <p>{error || 'Failed to load cart. Please try again.'}</p>
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
                  if (!product || !product._id) {
                    return null;
                  }
                  
                  const isResellProduct = item.productType === 'ResellProduct';
                  
                  let productAvailability = 0;
                  if (!isResellProduct && product.availability !== undefined && product.availability !== null) {
                    productAvailability = Number(product.availability);
                    if (isNaN(productAvailability)) {
                      productAvailability = 0;
                    }
                  } else if (isResellProduct) {
                    // For resell products, check status
                    productAvailability = product.status === 'available' ? 1 : 0;
                  }
                  
                  const itemQuantity = Number(item.quantity) || 1;
                  const attemptedQuantity = attemptedQuantities[item._id];
                  const inputQuantity = inputQuantities[item._id];
                  // Check inputQuantity first (user is typing), then attemptedQuantity, then current quantity
                  // If inputQuantity is empty string or invalid, ignore it and use fallback
                  let quantityToCheck = itemQuantity;
                  if (inputQuantity !== undefined && inputQuantity !== '') {
                    const numInputQty = Number(inputQuantity);
                    if (!isNaN(numInputQty) && numInputQty >= 1) {
                      quantityToCheck = numInputQty;
                    }
                  } else if (attemptedQuantity !== undefined) {
                    quantityToCheck = attemptedQuantity;
                  }
                  const isStockInsufficient = !isResellProduct && productAvailability > 0 && quantityToCheck > productAvailability;
                  const isResellUnavailable = isResellProduct && product.status !== 'available';
                  
                  return (
                    <div key={item._id} className="cart-item mb-3 p-3 border rounded">
                      {isResellProduct && (
                        <span className="badge bg-info mb-2">Preowned Item</span>
                      )}
                      {isStockInsufficient && (
                        <div className="alert alert-warning mb-2 py-2" role="alert">
                          <strong style={{ color: '#856404' }}>Insufficient stock available</strong>
                        </div>
                      )}
                      {isResellUnavailable && (
                        <div className="alert alert-danger mb-2 py-2" role="alert">
                          <strong>This item is no longer available</strong>
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
                            <Link 
                              to={isResellProduct ? `/resell/${product._id}` : `/products/${product._id}`} 
                              className="text-decoration-none"
                            >
                              {product.name || 'Product'}
                            </Link>
                          </h5>
                          {isResellProduct && item.sellerId && (
                            <p className="text-muted mb-1">
                              <small>Seller: {item.sellerId.name || 'Unknown'}</small>
                            </p>
                          )}
                          <p className="text-muted mb-1">
                            <small>Size: {item.size}</small>
                          </p>
                          <p className="text-muted mb-0">
                            <small>Color: {product.color || 'N/A'}</small>
                          </p>
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Quantity</label>
                          {isResellProduct ? (
                            <div className="input-group">
                              <input
                                type="number"
                                className="form-control text-center quantity-input"
                                value="1"
                                disabled
                                style={{ maxWidth: '80px' }}
                              />
                            </div>
                          ) : (
                            <>
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
                                  className="form-control text-center quantity-input"
                                  value={inputQuantities[item._id] !== undefined ? inputQuantities[item._id] : item.quantity}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '') {
                                      setInputQuantities(prev => ({ ...prev, [item._id]: '' }));
                                      return;
                                    }
                                    const numVal = parseInt(val);
                                    if (!isNaN(numVal) && numVal >= 1) {
                                      setInputQuantities(prev => ({ ...prev, [item._id]: numVal }));
                                    }
                                  }}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    const maxQuantity = productAvailability > 0 ? productAvailability : 999;
                                    // Automatically cap to stock number if exceeds
                                    const finalVal = Math.min(Math.max(1, val), maxQuantity);
                                    setInputQuantities(prev => {
                                      const newState = { ...prev };
                                      delete newState[item._id];
                                      return newState;
                                    });
                                    // Update quantity to capped value (stock number if exceeds stock)
                                    if (finalVal !== item.quantity) {
                                      updateQuantity(item._id, finalVal);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur();
                                    }
                                  }}
                                  min="1"
                                  max={productAvailability > 0 ? productAvailability : 999}
                                  style={{ maxWidth: '80px' }}
                                />
                                <button
                                  className="btn btn-outline-secondary"
                                  type="button"
                                  onClick={() => {
                                    const newQuantity = item.quantity + 1;
                                    setAttemptedQuantities(prev => ({ ...prev, [item._id]: newQuantity }));
                                    updateQuantity(item._id, newQuantity);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                              <small className="text-muted d-block mt-1">Type quantity and press Enter</small>
                            </>
                          )}
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
                            onClick={() => handleRemoveClick(item._id)}
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

      {/* Remove Confirmation Modal */}
      <div className={`modal fade ${showRemoveModal ? 'show' : ''}`} style={{ display: showRemoveModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Remove Item</h5>
              <button type="button" className="btn-close" onClick={closeRemoveModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this item from cart?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeRemoveModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmRemoveItem}>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
      {showRemoveModal && <div className="modal-backdrop fade show" onClick={closeRemoveModal}></div>}

      {/* Error Modal */}
      <div className={`modal fade ${showErrorModal ? 'show' : ''}`} style={{ display: showErrorModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Error</h5>
              <button type="button" className="btn-close" onClick={closeErrorModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>{errorMessage || 'An error occurred'}</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={closeErrorModal}>
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
      {showErrorModal && <div className="modal-backdrop fade show" onClick={closeErrorModal}></div>}
    </div>
  );
};

export default Cart;

