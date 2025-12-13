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
      setError(err.response?.data?.message || 'Failed to load cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating({ ...updating, [itemId]: true });
      const response = await api.put(`/cart/item/${itemId}`, { quantity: newQuantity });
      setCart(response.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update quantity');
      console.error('Error updating quantity:', err);
    } finally {
      setUpdating({ ...updating, [itemId]: false });
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
      alert(err.response?.data?.message || 'Failed to remove item');
      console.error('Error removing item:', err);
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
      alert(err.response?.data?.message || 'Failed to clear cart');
      console.error('Error clearing cart:', err);
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
          {error}
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
                  return (
                    <div key={item._id} className="cart-item mb-3 p-3 border rounded">
                      <div className="row align-items-center">
                        <div className="col-md-2">
                          <div className="cart-item-image-container">
                            <img
                              src={product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/150'}
                              alt={product.name}
                              className="cart-item-image"
                            />
                          </div>
                        </div>
                        <div className="col-md-4">
                          <h5 className="mb-1">
                            <Link to={`/products/${product._id}`} className="text-decoration-none">
                              {product.name}
                            </Link>
                          </h5>
                          <p className="text-muted mb-1">
                            <small>Size: {item.size}</small>
                          </p>
                          <p className="text-muted mb-0">
                            <small>Color: {product.color}</small>
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
                                updateQuantity(item._id, val);
                              }}
                              min="1"
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
                          <p className="mb-0 fw-bold">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-muted mb-0">
                            <small>${item.price.toFixed(2)} each</small>
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
                  <span>${getTotalAmount().toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Total</strong>
                  <strong>${getTotalAmount().toFixed(2)}</strong>
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

