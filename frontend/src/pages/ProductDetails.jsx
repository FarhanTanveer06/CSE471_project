import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/productDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToPreview, setAddingToPreview] = useState(false);
  const [complementaryProducts, setComplementaryProducts] = useState([]);
  const [loadingComplementary, setLoadingComplementary] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [weather, setWeather] = useState(null);
  const [cartSuccessMessage, setCartSuccessMessage] = useState('');
  const [cartErrorMessage, setCartErrorMessage] = useState('');
  const [previewSuccessMessage, setPreviewSuccessMessage] = useState('');
  const [previewErrorMessage, setPreviewErrorMessage] = useState('');

  // Scroll to top when component mounts or product ID changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

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

  // Fetch complementary products when product is loaded
  useEffect(() => {
    const fetchComplementaryProducts = async () => {
      if (!product || !id) return;
      
      try {
        setLoadingComplementary(true);
        const response = await api.get(`/products/${id}/complementary`);
        setComplementaryProducts(response.data);
      } catch (err) {
        console.error('Error fetching complementary products:', err);
        // Don't show error to user, just log it
      } finally {
        setLoadingComplementary(false);
      }
    };

    fetchComplementaryProducts();
  }, [product, id]);

  // Fetch reviews when product is loaded
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        setLoadingReviews(true);
        const response = await api.get(`/reviews/product/${id}`);
        setReviews(response.data);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Fetch user's review if logged in
  useEffect(() => {
    const fetchUserReview = async () => {
      if (!user || !id) return;
      
      try {
        const response = await api.get(`/reviews/product/${id}/user`);
        setUserReview(response.data);
        setReviewRating(response.data.rating);
        setReviewComment(response.data.comment);
      } catch (err) {
        // User hasn't reviewed yet, which is fine
        if (err.response?.status !== 404) {
          console.error('Error fetching user review:', err);
        }
      }
    };

    fetchUserReview();
  }, [user, id]);

  // Fetch weather for Dhaka
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await api.get('/weather?city=Dhaka');
        setWeather(response.data);
      } catch (err) {
        // Silently fail
      }
    };

    fetchWeather();
  }, []);

  // Check if product is in wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !id) return;
      
      try {
        const response = await api.get(`/wishlist/check/${id}`);
        setInWishlist(response.data.inWishlist);
      } catch (err) {
        // Not in wishlist or error
        setInWishlist(false);
      }
    };

    checkWishlist();
  }, [user, id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to submit a review');
      navigate('/login');
      return;
    }

    if (reviewRating === 0) {
      alert('Please select a rating');
      return;
    }

    if (!reviewComment.trim()) {
      alert('Please write a review comment');
      return;
    }

    try {
      setSubmittingReview(true);
      
      if (userReview) {
        // Update existing review
        await api.put(`/reviews/${userReview._id}`, {
          rating: reviewRating,
          comment: reviewComment
        });
        alert('Review updated successfully!');
      } else {
        // Create new review
        const response = await api.post(`/reviews/product/${id}`, {
          rating: reviewRating,
          comment: reviewComment
        });
        setUserReview(response.data);
        alert('Review submitted successfully!');
      }

      // Refresh reviews and product
      const reviewsResponse = await api.get(`/reviews/product/${id}`);
      setReviews(reviewsResponse.data);
      
      const productResponse = await api.get(`/products/${id}`);
      setProduct(productResponse.data);
      
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      await api.delete(`/reviews/${userReview._id}`);
      setUserReview(null);
      setReviewRating(0);
      setReviewComment('');
      
      // Refresh reviews and product
      const reviewsResponse = await api.get(`/reviews/product/${id}`);
      setReviews(reviewsResponse.data);
      
      const productResponse = await api.get(`/products/${id}`);
      setProduct(productResponse.data);
      
      alert('Review deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
      console.error('Error deleting review:', err);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      alert('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      setAddingToWishlist(true);
      if (inWishlist) {
        await api.delete(`/wishlist/product/${id}`);
        setInWishlist(false);
        alert('Removed from wishlist');
      } else {
        await api.post('/wishlist', { productId: id });
        setInWishlist(true);
        alert('Added to wishlist!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update wishlist');
      console.error('Error updating wishlist:', err);
    } finally {
      setAddingToWishlist(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, interactive = false }) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            onMouseEnter={() => interactive && onRatingChange && onRatingChange(star)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            ★
          </span>
        ))}
      </div>
    );
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

  const isAvailable = product.availability > 0;
  const availabilityText = isAvailable 
    ? `${product.availability} in stock` 
    : 'Out of stock';

  // Function to determine GSM suitability 
  const getGSMSuitability = (gsm, temperature) => {
    if (!gsm || !temperature) return null;

    

    if (temperature >= 35) {
      // Very Hot (Above 35°C) - Heatwaves
      if (gsm < 120) {
        return { message: 'Perfect with your weather', status: 'perfect' };
      } else if (gsm < 150) {
        return { message: 'Too heavy for your weather', status: 'too-heavy' };
      } else {
        return { message: 'Too heavy for your weather', status: 'too-heavy' };
      }
    } else if (temperature >= 30) {
      // Hot (30-35°C) - Peak summer
      if (gsm < 150) {
        return { message: 'Perfect with your weather', status: 'perfect' };
      } else if (gsm < 200) {
        return { message: 'Too heavy for your weather', status: 'too-heavy' };
      } else {
        return { message: 'Too heavy for your weather', status: 'too-heavy' };
      }
    } else if (temperature >= 25) {
      // Warm (25-30°C) - Spring/early summer
      if (gsm >= 100 && gsm < 150) {
        return { message: 'Perfect with your weather', status: 'perfect' };
      } else if (gsm < 100) {
        return { message: 'Too light for your weather', status: 'too-light' };
      } else {
        return { message: 'Too heavy for your weather', status: 'too-heavy' };
      }
    } else if (temperature >= 20) {
      // Mild/Pleasant (20-25°C) - Late winter/early spring
      if (gsm >= 181 && gsm < 251) {
        return { message: 'Perfect with your weather', status: 'perfect' };
      } else if (gsm <= 180) {
        return { message: 'Too light for your weather', status: 'too-light' };
      } else {
        return { message: 'Too heavy for your weather', status: 'too-heavy' };
      }
    } else {
      // Cold (Below 20°C) - Winter
      if (gsm >= 251) {
        return { message: 'Perfect with your weather', status: 'perfect' };
      }  else {
        return { message: 'Too light for your weather', status: 'too-light' };
      }
    }
  };

  const gsmSuitability = weather && product.gsm 
    ? getGSMSuitability(product.gsm, weather.temperature)
    : null;

  // Handle backward compatibility - if product has imageUrl instead of images array
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : (product.imageUrl ? [product.imageUrl] : []);

  // Fallback placeholder image if no images are available
  const fallbackImage = 'https://via.placeholder.com/600x500?text=No+Image+Available';
  const mainImageSrc = productImages.length > 0 
    ? (productImages[selectedImageIndex] || productImages[0])
    : fallbackImage;

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert('Please select a size');
      return;
    }

    if (!isAvailable) {
      alert('Product is out of stock');
      return;
    }

    try {
      setAddingToCart(true);
      setCartErrorMessage(''); // Clear any previous error
      await api.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        size: selectedSize || product.sizes?.[0] || 'M'
      });
      setCartSuccessMessage('Item added to cart successfully!');
      // Auto-hide the message after 3 seconds
      setTimeout(() => {
        setCartSuccessMessage('');
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to add item to cart';
      // Clean localhost URLs from error message
      const cleanErrorMsg = errorMsg.replace(/http:\/\/localhost:\d+/gi, '').replace(/localhost/gi, '').trim() || errorMsg;
      setCartErrorMessage(cleanErrorMsg);
      // Auto-hide the error message after 5 seconds
      setTimeout(() => {
        setCartErrorMessage('');
      }, 5000);
      console.error('Error adding to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToPreview = async () => {
    if (!user) {
      alert('Please login to add items to preview');
      navigate('/login');
      return;
    }

    try {
      setAddingToPreview(true);
      setPreviewErrorMessage(''); // Clear any previous error
      await api.post('/preview/add', {
        productId: product._id
      });
      setPreviewSuccessMessage('Item added to preview successfully!');
      // Auto-hide the message after 3 seconds
      setTimeout(() => {
        setPreviewSuccessMessage('');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add item to preview';
      setPreviewErrorMessage(errorMessage);
      // Auto-hide the error message after 5 seconds
      setTimeout(() => {
        setPreviewErrorMessage('');
      }, 5000);
      console.error('Error adding to preview:', err);
    } finally {
      setAddingToPreview(false);
    }
  };

  return (
    <div className="product-details-container">
      <div className="container py-5">
        <div className="row">
          {/* Image Gallery Section */}
          <div className="col-md-6 mb-4">
            <div className="product-image-gallery">
              {/* Main Image */}
              <div className="product-main-image-container">
                <img 
                  src={mainImageSrc} 
                  className="product-main-image" 
                  alt={product.name}
                />
              </div>
              
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
            <div className="product-price">BDT {product.price}</div>

            {/* Rating Display */}
            {product.averageRating && (
              <div className="product-rating-display mb-3">
                <StarRating rating={Math.round(product.averageRating)} />
                <span className="rating-text ms-2">
                  {product.averageRating.toFixed(1)} ({product.totalReviews || 0} {product.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}

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
                  background: '#636668ff',
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
                        border: selectedSize === size ? '2px solid #2b2f5dff' : '1px solid #dee2e6',
                        background: selectedSize === size ? '#211942ff' : '#ffffff',
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
                        <td>
                          {product.gsm} g/m²
                          {gsmSuitability && (
                            <span className={`gsm-suitability ms-2 ${gsmSuitability.status}`}>
                              {gsmSuitability.message}
                            </span>
                          )}
                        </td>
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

            {/* Cart Success Message */}
            {cartSuccessMessage && (
              <div className="alert alert-success mt-3 mb-3" role="alert">
                {cartSuccessMessage}
              </div>
            )}

            {/* Cart Error Message */}
            {cartErrorMessage && (
              <div className="alert alert-warning mt-3 mb-3" role="alert">
                {cartErrorMessage}
              </div>
            )}

            {/* Preview Success Message */}
            {previewSuccessMessage && (
              <div className="alert alert-success mt-3 mb-3" role="alert">
                {previewSuccessMessage}
              </div>
            )}

            {/* Preview Error Message */}
            {previewErrorMessage && (
              <div className="alert alert-danger mt-3 mb-3" role="alert">
                {previewErrorMessage}
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              <button 
                className="product-action-btn primary" 
                disabled={!isAvailable || (product.sizes && product.sizes.length > 0 && !selectedSize) || addingToCart}
                onClick={handleAddToCart}
              >
                {addingToCart 
                  ? 'Adding...' 
                  : isAvailable 
                    ? (product.sizes && product.sizes.length > 0 && !selectedSize 
                        ? 'Select Size to Add to Cart' 
                        : 'Add to Cart')
                    : 'Out of Stock'}
              </button>
              {product.category?.toLowerCase() !== 'panjabi' && (
                <button 
                  className="product-action-btn secondary"
                  disabled={addingToPreview}
                  onClick={handleAddToPreview}
                >
                  {addingToPreview ? 'Adding...' : 'Add to Preview'}
                </button>
              )}
              <button 
                className={`product-action-btn secondary ${inWishlist ? 'in-wishlist' : ''}`}
                disabled={addingToWishlist}
                onClick={handleWishlistToggle}
              >
                {addingToWishlist 
                  ? 'Updating...' 
                  : inWishlist 
                    ? '❤️ In Wishlist' 
                    : '🤍 Add to Wishlist'}
              </button>
            </div>
          </div>
        </div>

        {/* Outfit Suggestions Section */}
        {(loadingComplementary || complementaryProducts.length > 0) && (
          <div className="outfit-suggestions-section mt-5">
            <div className="outfit-suggestions-header">
              <h2 className="outfit-suggestions-title">Complete Your Outfit</h2>
              <p className="outfit-suggestions-subtitle">
                These items go well with {product.name}
              </p>
            </div>
            
            {loadingComplementary ? (
              <div className="outfit-suggestions-loading">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading suggestions...</span>
                </div>
              </div>
            ) : complementaryProducts.length > 0 ? (
              <div className="outfit-suggestions-grid">
              {complementaryProducts.map((suggestedProduct) => {
                const suggestedImages = suggestedProduct.images && suggestedProduct.images.length > 0 
                  ? suggestedProduct.images 
                  : (suggestedProduct.imageUrl ? [suggestedProduct.imageUrl] : []);
                const suggestedImageSrc = suggestedImages.length > 0 
                  ? suggestedImages[0]
                  : 'https://via.placeholder.com/300x400?text=No+Image';
                const isSuggestedAvailable = suggestedProduct.availability > 0;

                return (
                  <div key={suggestedProduct._id} className="outfit-suggestion-card">
                    <Link 
                      to={`/products/${suggestedProduct._id}`}
                      className="outfit-suggestion-link"
                    >
                      <div className="outfit-suggestion-image-container">
                        <img 
                          src={suggestedImageSrc} 
                          alt={suggestedProduct.name}
                          className="outfit-suggestion-image"
                        />
                        {!isSuggestedAvailable && (
                          <div className="outfit-suggestion-overlay">
                            <span className="outfit-suggestion-badge out-of-stock">Out of Stock</span>
                          </div>
                        )}
                        {suggestedProduct.featured && (
                          <div className="outfit-suggestion-featured-badge">Featured</div>
                        )}
                      </div>
                      <div className="outfit-suggestion-info">
                        <h5 className="outfit-suggestion-name">{suggestedProduct.name}</h5>
                        <div className="outfit-suggestion-details">
                          <span className="outfit-suggestion-category">{suggestedProduct.category}</span>
                          {suggestedProduct.type && (
                            <span className="outfit-suggestion-type">{suggestedProduct.type}</span>
                          )}
                        </div>
                        <div className="outfit-suggestion-price">BDT {suggestedProduct.price}</div>
                      </div>
                    </Link>
                    <div className="outfit-suggestion-actions">
                      <button
                        className="outfit-suggestion-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(`/products/${suggestedProduct._id}`);
                        }}
                      >
                        View Details
                      </button>
                      {isSuggestedAvailable && user && (
                        <button
                          className="outfit-suggestion-btn primary"
                          onClick={async (e) => {
                            e.preventDefault();
                            try {
                              await api.post('/cart/add', {
                                productId: suggestedProduct._id,
                                quantity: 1,
                                size: suggestedProduct.sizes?.[0] || 'M'
                              });
                              alert('Item added to cart successfully!');
                            } catch (err) {
                              alert(err.response?.data?.message || 'Failed to add item to cart');
                            }
                          }}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            ) : null}
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section mt-5">
          <div className="reviews-header">
            <h2 className="reviews-title">Customer Reviews</h2>
            {product.averageRating && (
              <div className="reviews-summary">
                <StarRating rating={Math.round(product.averageRating)} />
                <span className="reviews-summary-text">
                  {product.averageRating.toFixed(1)} out of 5 ({product.totalReviews || 0} {product.totalReviews === 1 ? 'review' : 'reviews'})
                </span>
              </div>
            )}
          </div>

          {/* Review Form */}
          {user && (
            <div className="review-form-section">
              {!userReview && !showReviewForm ? (
                <button 
                  className="review-form-toggle-btn"
                  onClick={() => setShowReviewForm(true)}
                >
                  Write a Review
                </button>
              ) : (
                <div className="review-form-card">
                  <h4 className="review-form-title">
                    {userReview ? 'Edit Your Review' : 'Write a Review'}
                  </h4>
                  <form onSubmit={handleSubmitReview}>
                    <div className="review-form-group">
                      <label className="review-form-label">Rating</label>
                      <StarRating 
                        rating={reviewRating} 
                        onRatingChange={setReviewRating}
                        interactive={true}
                      />
                    </div>
                    <div className="review-form-group">
                      <label className="review-form-label">Your Review</label>
                      <textarea
                        className="review-form-textarea"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience with this product..."
                        rows={5}
                        maxLength={1000}
                        required
                      />
                      <small className="review-form-char-count">
                        {reviewComment.length}/1000 characters
                      </small>
                    </div>
                    <div className="review-form-actions">
                      <button 
                        type="submit" 
                        className="review-form-submit-btn"
                        disabled={submittingReview || reviewRating === 0}
                      >
                        {submittingReview ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
                      </button>
                      {userReview && (
                        <button
                          type="button"
                          className="review-form-delete-btn"
                          onClick={handleDeleteReview}
                        >
                          Delete Review
                        </button>
                      )}
                      <button
                        type="button"
                        className="review-form-cancel-btn"
                        onClick={() => {
                          setShowReviewForm(false);
                          if (!userReview) {
                            setReviewRating(0);
                            setReviewComment('');
                          }
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Reviews List */}
          <div className="reviews-list">
            {loadingReviews ? (
              <div className="reviews-loading">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading reviews...</span>
                </div>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-user-info">
                      <div className="review-user-name">{review.userName}</div>
                      <div className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    <StarRating rating={review.rating} />
                  </div>
                  <div className="review-comment">{review.comment}</div>
                  {user && userReview && userReview._id === review._id && (
                    <div className="review-actions">
                      <button
                        className="review-edit-btn"
                        onClick={() => {
                          setShowReviewForm(true);
                          setReviewRating(review.rating);
                          setReviewComment(review.comment);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="reviews-empty">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
