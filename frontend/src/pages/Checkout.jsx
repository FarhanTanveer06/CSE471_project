import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/checkout.css';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh'
  });
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [transactionId, setTransactionId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  const [notes, setNotes] = useState('');

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
      
      // Pre-fill shipping address with user info
      if (response.data && user) {
        setShippingAddress(prev => ({
          ...prev,
          fullName: user.name || prev.fullName,
          phone: user.phone || prev.phone
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate shipping address
    if (!shippingAddress.fullName || !shippingAddress.phone || 
        !shippingAddress.address || !shippingAddress.city) {
      setError('Please fill in all required shipping address fields');
      return;
    }

    // Validate payment method
    if (paymentMethod === 'Bkash' || paymentMethod === 'Nagad') {
      if (!transactionId.trim()) {
        setError('Please enter your transaction ID for mobile banking payment');
        return;
      }
    }
    
    if (paymentMethod === 'Card') {
      if (!cardDetails.cardNumber.trim() || !cardDetails.cardHolderName.trim() ||
          !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv.trim()) {
        setError('Please fill in all card details');
        return;
      }
      
      // Validate card number (basic validation)
      const cardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      if (cardNumber.length < 13 || cardNumber.length > 19 || !/^\d+$/.test(cardNumber)) {
        setError('Please enter a valid card number');
        return;
      }
      
      // Validate CVV
      if (cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4 || !/^\d+$/.test(cardDetails.cvv)) {
        setError('Please enter a valid CVV');
        return;
      }
      
      // Validate expiry date
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(cardDetails.expiryYear);
      const expiryMonth = parseInt(cardDetails.expiryMonth);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        setError('Card has expired');
        return;
      }
    }

    // Validate phone number format (Bangladesh)
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(shippingAddress.phone)) {
      setError('Please enter a valid Bangladesh phone number (e.g., 01712345678)');
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post('/orders', {
        shippingAddress,
        paymentMethod,
        transactionId: transactionId.trim() || null,
        cardDetails: paymentMethod === 'Card' ? cardDetails : null,
        notes: notes.trim() || null
      });

      // Order created successfully
      alert(`Order placed successfully! Order Number: ${response.data.orderNumber}`);
      navigate(`/orders/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
      console.error('Error placing order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getSubtotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    const subtotal = getSubtotal();
    return subtotal >= 100 ? 0 : 10; // Free shipping for orders above $100
  };

  const getTotal = () => {
    return getSubtotal() + getShippingCost();
  };

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="container py-5">
          <div className="alert alert-warning text-center">
            <h4>Your cart is empty</h4>
            <p>Please add items to your cart before checkout.</p>
            <button className="btn btn-primary" onClick={() => navigate('/products')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="container py-5">
        <h2 className="checkout-title mb-4">Checkout</h2>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Left Column - Shipping & Payment */}
            <div className="col-lg-8">
              {/* Shipping Address Section */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">Shipping Address</h3>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="checkout-label">Full Name *</label>
                    <input
                      type="text"
                      className="checkout-input"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="checkout-label">Phone Number *</label>
                    <input
                      type="tel"
                      className="checkout-input"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      placeholder="01712345678"
                      required
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="checkout-label">Address *</label>
                    <textarea
                      className="checkout-input"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="House/Flat No., Road, Area"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="checkout-label">City *</label>
                    <input
                      type="text"
                      className="checkout-input"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      placeholder="Dhaka"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="checkout-label">Postal Code</label>
                    <input
                      type="text"
                      className="checkout-input"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      placeholder="1200"
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="checkout-label">Country</label>
                    <input
                      type="text"
                      className="checkout-input"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method Section */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">Payment Method</h3>
                <div className="payment-methods">
                  <div className="payment-method-option">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setTransactionId('');
                        setCardDetails({
                          cardNumber: '',
                          cardHolderName: '',
                          expiryMonth: '',
                          expiryYear: '',
                          cvv: ''
                        });
                      }}
                    />
                    <label htmlFor="cod" className="payment-method-label">
                      <div className="payment-method-info">
                        <span className="payment-method-name">Cash on Delivery (COD)</span>
                        <span className="payment-method-desc">Pay in cash when you receive your order</span>
                      </div>
                    </label>
                  </div>

                  <div className="payment-method-option">
                    <input
                      type="radio"
                      id="bkash"
                      name="paymentMethod"
                      value="Bkash"
                      checked={paymentMethod === 'Bkash'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setTransactionId('');
                        setCardDetails({
                          cardNumber: '',
                          cardHolderName: '',
                          expiryMonth: '',
                          expiryYear: '',
                          cvv: ''
                        });
                      }}
                    />
                    <label htmlFor="bkash" className="payment-method-label">
                      <div className="payment-method-info">
                        <span className="payment-method-name">Bkash</span>
                        <span className="payment-method-desc">Pay via Bkash mobile banking</span>
                      </div>
                    </label>
                  </div>

                  <div className="payment-method-option">
                    <input
                      type="radio"
                      id="nagad"
                      name="paymentMethod"
                      value="Nagad"
                      checked={paymentMethod === 'Nagad'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setTransactionId('');
                        setCardDetails({
                          cardNumber: '',
                          cardHolderName: '',
                          expiryMonth: '',
                          expiryYear: '',
                          cvv: ''
                        });
                      }}
                    />
                    <label htmlFor="nagad" className="payment-method-label">
                      <div className="payment-method-info">
                        <span className="payment-method-name">Nagad</span>
                        <span className="payment-method-desc">Pay via Nagad mobile banking</span>
                      </div>
                    </label>
                  </div>

                  <div className="payment-method-option">
                    <input
                      type="radio"
                      id="card"
                      name="paymentMethod"
                      value="Card"
                      checked={paymentMethod === 'Card'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setTransactionId('');
                        setCardDetails({
                          cardNumber: '',
                          cardHolderName: '',
                          expiryMonth: '',
                          expiryYear: '',
                          cvv: ''
                        });
                      }}
                    />
                    <label htmlFor="card" className="payment-method-label">
                      <div className="payment-method-info">
                        <span className="payment-method-name">Debit/Credit Card</span>
                        <span className="payment-method-desc">Pay securely with your card</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Transaction ID for mobile banking payments */}
                {(paymentMethod === 'Bkash' || paymentMethod === 'Nagad') && (
                  <div className="transaction-id-section">
                    <label className="checkout-label">
                      Transaction ID *
                      <small className="text-muted ms-2">
                        (Enter the transaction ID from your {paymentMethod} payment)
                      </small>
                    </label>
                    <input
                      type="text"
                      className="checkout-input"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder={`Enter your ${paymentMethod} transaction ID`}
                      required
                    />
                    <small className="checkout-help-text">
                      Please make the payment first, then enter the transaction ID here.
                      {paymentMethod === 'Bkash' && ' Send money to: 01712345678'}
                      {paymentMethod === 'Nagad' && ' Send money to: 01712345678'}
                    </small>
                  </div>
                )}

                {/* Card Details for Card Payment */}
                {paymentMethod === 'Card' && (
                  <div className="card-details-section">
                    <label className="checkout-label">Card Number *</label>
                    <input
                      type="text"
                      className="checkout-input"
                      value={cardDetails.cardNumber}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\s/g, '');
                        // Format card number with spaces every 4 digits
                        value = value.match(/.{1,4}/g)?.join(' ') || value;
                        if (value.length <= 23) { // Max 19 digits + 4 spaces
                          setCardDetails({ ...cardDetails, cardNumber: value });
                        }
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                    
                    <label className="checkout-label mt-3">Cardholder Name *</label>
                    <input
                      type="text"
                      className="checkout-input"
                      value={cardDetails.cardHolderName}
                      onChange={(e) => setCardDetails({ ...cardDetails, cardHolderName: e.target.value.toUpperCase() })}
                      placeholder="JOHN DOE"
                      required
                    />
                    
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <label className="checkout-label">Expiry Date *</label>
                        <div className="row">
                          <div className="col-6">
                            <select
                              className="checkout-input"
                              value={cardDetails.expiryMonth}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiryMonth: e.target.value })}
                              required
                            >
                              <option value="">Month</option>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                <option key={month} value={month.toString().padStart(2, '0')}>
                                  {month.toString().padStart(2, '0')}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-6">
                            <select
                              className="checkout-input"
                              value={cardDetails.expiryYear}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiryYear: e.target.value })}
                              required
                            >
                              <option value="">Year</option>
                              {Array.from({ length: 15 }, (_, i) => {
                                const year = new Date().getFullYear() + i;
                                return (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="checkout-label">CVV *</label>
                        <input
                          type="text"
                          className="checkout-input"
                          value={cardDetails.cvv}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            if (value.length <= 4) {
                              setCardDetails({ ...cardDetails, cvv: value });
                            }
                          }}
                          placeholder="123"
                          maxLength="4"
                          required
                        />
                        <small className="checkout-help-text">3 or 4 digits on the back of your card</small>
                      </div>
                    </div>
                    
                    <div className="card-security-note mt-3">
                      <small className="text-muted">
                        🔒 Your card details are secure. We use industry-standard encryption to protect your information.
                      </small>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              <div className="checkout-section">
                <h3 className="checkout-section-title">Additional Notes (Optional)</h3>
                <textarea
                  className="checkout-input"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Any special instructions for delivery..."
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="col-lg-4">
              <div className="checkout-summary">
                <h3 className="checkout-summary-title">Order Summary</h3>
                
                <div className="checkout-items">
                  {cart.items.map((item) => {
                    const product = item.productId;
                    return (
                      <div key={item._id} className="checkout-item">
                        <div className="checkout-item-image">
                          <img
                            src={product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/80'}
                            alt={product.name}
                          />
                        </div>
                        <div className="checkout-item-details">
                          <div className="checkout-item-name">{product.name}</div>
                          <div className="checkout-item-meta">
                            Size: {item.size} | Qty: {item.quantity}
                          </div>
                          <div className="checkout-item-price">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="checkout-summary-breakdown">
                  <div className="checkout-summary-row">
                    <span>Subtotal</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="checkout-summary-row">
                    <span>Shipping</span>
                    <span>
                      {getShippingCost() === 0 ? (
                        <span className="text-success">Free</span>
                      ) : (
                        `$${getShippingCost().toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {getSubtotal() < 100 && (
                    <div className="checkout-summary-note">
                      <small className="text-muted">
                        Add ${(100 - getSubtotal()).toFixed(2)} more for free shipping!
                      </small>
                    </div>
                  )}
                  <div className="checkout-summary-total">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="checkout-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Placing Order...' : 'Place Order'}
                </button>

                <button
                  type="button"
                  className="checkout-back-btn"
                  onClick={() => navigate('/cart')}
                >
                  Back to Cart
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;

