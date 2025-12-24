import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/cultureEvents.css';

const CultureEvents = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [error, setError] = useState(null);

  const events = [
    {
      id: 'pahela-baishakh',
      name: 'Pahela Baishakh',
      description: 'Bengali New Year Celebration',
      colors: ['Red', 'White', 'Maroon'],
      backgroundImage: 'https://api.houseofahmed.com/storage/products/68/images/h0hOayE1POzRuKkmeblPAue0q59lFlWWK5Ut0oiB.jpg?w=800&h=600&fit=crop'
    },
    {
      id: 'language-martyrs-day',
      name: 'Language Martyrs Day',
      description: 'Ekushey February',
      colors: ['Black', 'White'],
      backgroundImage: 'https://www.ismailfarid.com/cdn/shop/files/SHK2504_1.jpg?v=1757931876&w=800&h=600&fit=crop'
    },
    {
      id: 'wedding',
      name: 'Wedding',
      description: 'Special Occasion',
      colors: ['Various'],
      backgroundImage: 'https://www.ismailfarid.com/cdn/shop/files/JKT223_1.jpg?v=1686655187&w=800&h=600&fit=crop'
    },
    {
      id: 'eid',
      name: 'Eid',
      description: 'Eid Celebration',
      colors: ['Various'],
      backgroundImage: 'https://api.houseofahmed.com/storage/category_media/IMG%201600_JPEG_v01_2000x1333_2000x1333.webp?w=800&h=600&fit=crop'
    },
    {
      id: 'puja',
      name: 'Puja',
      description: 'Religious Festival',
      colors: ['Various'],
      backgroundImage: 'https://api.houseofahmed.com/storage/products/338/thumbnail/IMG%202076_JPEG_v01_1333x2000.webp?w=800&h=600&fit=crop'
    },
    {
      id: 'victory-day',
      name: 'Victory Day',
      description: 'Independence Day',
      colors: ['Green', 'Red', 'Maroon'],
      backgroundImage: 'https://www.ismailfarid.com/cdn/shop/files/1_1ce5b6b6-7139-4939-8989-a6cda3cfdc19.jpg?v=1758100073&w=800&h=600&fit=crop'
    }
  ];

  const handleEventSelect = async (eventId) => {
    setSelectedEvent(eventId);
    setError(null);
    setLoading(true);
    setSuggestions(null);

    try {
      const response = await api.get(`/products/event-suggestions?event=${eventId}`);
      setSuggestions(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load outfit suggestions');
      console.error('Error fetching suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0] || 'M'
      });
      alert('Item added to cart successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return 'https://via.placeholder.com/300x400?text=No+Image';
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-5">
        <h1 className="display-4 mb-3">Bangladeshi Culture & Events</h1>
        <p className="lead">Select an event to get personalized outfit suggestions</p>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Event Selection Cards */}
      <div className="row g-4 mb-5">
        {events.map((event) => (
          <div key={event.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <div
              className={`event-card ${selectedEvent === event.id ? 'selected' : ''} ${loading && selectedEvent === event.id ? 'loading' : ''}`}
              style={{ backgroundImage: `url(${event.backgroundImage})` }}
              onClick={() => handleEventSelect(event.id)}
            >
              <div className="event-overlay"></div>
              <div className="event-content">
                <h5 className="event-name">{event.name}</h5>
                <p className="event-description">{event.description}</p>
                {loading && selectedEvent === event.id && (
                  <div className="spinner-border spinner-border-sm text-white mt-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions Display */}
      {suggestions && (
        <div className="suggestions-section">
          <div className="suggestion-header mb-4">
            <h2 className="mb-2">
              Outfit Suggestions for {events.find(e => e.id === suggestions.event)?.name}
            </h2>
            <p className="lead">{suggestions.description}</p>
          </div>

          {suggestions.allProducts && suggestions.allProducts.length > 0 ? (
            <>
              <div className="row g-4">
                {suggestions.allProducts.map((product) => {
                  const imageSrc = getProductImage(product);
                  const isAvailable = product.availability > 0;
                  return (
                    <div key={product._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                      <div className="card h-100 product-card">
                        <Link to={`/products/${product._id}`} className="text-decoration-none">
                          <img 
                            src={imageSrc} 
                            className="card-img-top" 
                            alt={product.name}
                          />
                        </Link>
                        <div className="card-body d-flex flex-column">
                          <Link 
                            to={`/products/${product._id}`} 
                            className="text-decoration-none text-dark"
                          >
                            <h6 className="card-title">{product.name}</h6>
                          </Link>
                          <div className="mb-2">
                            <span className="badge bg-primary me-1 text-capitalize">
                              {product.category}
                            </span>
                            <span className="badge bg-secondary text-capitalize">
                              {product.color}
                            </span>
                          </div>
                          <div className="mb-2">
                            <strong className="text-primary">BDT {product.price}</strong>
                          </div>
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-2">
                              <small className="text-muted">
                                Sizes: {product.sizes.join(', ')}
                              </small>
                            </div>
                          )}
                          <div className="mt-auto d-flex gap-2 mt-3">
                            <Link 
                              to={`/products/${product._id}`} 
                              className="btn btn-outline-primary btn-sm flex-grow-1"
                            >
                              View Details
                            </Link>
                            {isAvailable && user && (
                              <button 
                                className="btn btn-primary btn-sm flex-grow-1"
                                onClick={() => handleAddToCart(product)}
                              >
                                Add to Cart
                              </button>
                            )}
                            {!user && (
                              <button 
                                className="btn btn-primary btn-sm flex-grow-1"
                                onClick={() => navigate('/login')}
                              >
                                Login to Cart
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center mt-4">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => {
                    setSuggestions(null);
                    setSelectedEvent(null);
                  }}
                >
                  Select Another Event
                </button>
              </div>
            </>
          ) : (
            <div className="alert alert-info">
              <h5>No products found</h5>
              <p>We couldn't find matching products for this event. Please check back later or browse our <Link to="/products">full product collection</Link>.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CultureEvents;

