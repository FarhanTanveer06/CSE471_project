import React, { useState, useEffect, useRef, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/products.css';

const Products = () => {
  const { category } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistStatus, setWishlistStatus] = useState({});
  const [updatingWishlist, setUpdatingWishlist] = useState({});
  const searchInputRef = useRef(null);

  // Filter and search states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newArrival');

  // Get unique colors from products
  const availableColors = [...new Set(products.map(p => p.color).filter(Boolean))];
  
  // Available sizes
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];

  // Update selectedCategory when route category param changes
  useEffect(() => {
    setSelectedCategory(category || '');
  }, [category]);

  // Debounce search term - update debouncedSearchTerm after user stops typing for 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products when filters change (using debouncedSearchTerm instead of searchTerm)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (selectedCategory) params.append('category', selectedCategory);
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (selectedColor) params.append('color', selectedColor);
        if (selectedSize) params.append('size', selectedSize);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sortBy) params.append('sortBy', sortBy);

        const endpoint = `/products?${params.toString()}`;
        const response = await api.get(endpoint);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        // Provide more detailed error messages
        let errorMessage = 'Failed to load products';
        
        if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          errorMessage = 'Unable to connect to the server. Please make sure the backend server is running on http://localhost:5000';
        } else if (err.response) {
          // Server responded with error status
          errorMessage = err.response.data?.message || `Server error: ${err.response.status} ${err.response.statusText}`;
        } else if (err.request) {
          // Request made but no response received
          errorMessage = 'No response from server. Please check if the backend is running.';
        } else {
          errorMessage = err.message || 'An unexpected error occurred';
        }
        
        setError(errorMessage);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, debouncedSearchTerm, selectedColor, selectedSize, minPrice, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory(category || '');
    setSelectedColor('');
    setSelectedSize('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newArrival');
  };

  // Check wishlist status for all products
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || products.length === 0) return;
      
      const status = {};
      for (const product of products) {
        try {
          const response = await api.get(`/wishlist/check/${product._id}`);
          status[product._id] = response.data.inWishlist;
        } catch (err) {
          status[product._id] = false;
        }
      }
      setWishlistStatus(status);
    };

    checkWishlistStatus();
  }, [user, products]);

  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      alert('Please login to add items to wishlist');
      navigate('/login');
      return;
    }

    try {
      setUpdatingWishlist({ ...updatingWishlist, [productId]: true });
      if (wishlistStatus[productId]) {
        await api.delete(`/wishlist/product/${productId}`);
        setWishlistStatus({ ...wishlistStatus, [productId]: false });
      } else {
        await api.post('/wishlist', { productId });
        setWishlistStatus({ ...wishlistStatus, [productId]: true });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update wishlist');
      console.error('Error updating wishlist:', err);
    } finally {
      setUpdatingWishlist({ ...updatingWishlist, [productId]: false });
    }
  };

  // Helper function to get product image
  const getProductImage = (product) => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    // Backward compatibility
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  if (error && !products.length) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          <h5 className="alert-heading">Error Loading Products</h5>
          <p className="mb-3">{error}</p>
          <hr />
          <p className="mb-2"><strong>Troubleshooting:</strong></p>
          <ul className="mb-3">
            <li>Make sure the backend server is running on port 5000</li>
            <li>Check that MongoDB is connected and running</li>
            <li>Verify the API URL in your environment variables</li>
            <li>Check the browser console for more details</li>
          </ul>
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setError(null);
              setLoading(true);
              // Trigger a refetch by updating a dependency
              const fetchProducts = async () => {
                try {
                  const params = new URLSearchParams();
                  
                  if (selectedCategory) params.append('category', selectedCategory);
                  if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
                  if (selectedColor) params.append('color', selectedColor);
                  if (selectedSize) params.append('size', selectedSize);
                  if (minPrice) params.append('minPrice', minPrice);
                  if (maxPrice) params.append('maxPrice', maxPrice);
                  if (sortBy) params.append('sortBy', sortBy);

                  const endpoint = `/products?${params.toString()}`;
                  const response = await api.get(endpoint);
                  setProducts(response.data);
                  setError(null);
                } catch (err) {
                  let errorMessage = 'Failed to load products';
                  
                  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
                    errorMessage = 'Unable to connect to the server. Please make sure the backend server is running on http://localhost:5000';
                  } else if (err.response) {
                    errorMessage = err.response.data?.message || `Server error: ${err.response.status} ${err.response.statusText}`;
                  } else if (err.request) {
                    errorMessage = 'No response from server. Please check if the backend is running.';
                  } else {
                    errorMessage = err.message || 'An unexpected error occurred';
                  }
                  
                  setError(errorMessage);
                  console.error('Error fetching products:', err);
                } finally {
                  setLoading(false);
                }
              };
              fetchProducts();
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="premium-section-header mb-5">
        <h2 className="text-capitalize">
          {selectedCategory ? `${selectedCategory}` : 'All Products'}
        </h2>
        <p>Discover the latest in men&apos;s fashion</p>
      </div>

      {/* Search and Sort Section */}
      <div className="products-top-bar mb-4">
        <div className="row g-3 align-items-center">
          {/* Search Bar */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="position-relative">
              <input
                ref={searchInputRef}
                type="text"
                className="form-control"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoComplete="off"
              />
              {loading && searchTerm && (
                <div className="position-absolute top-50 end-0 translate-middle-y pe-3">
                  <div className="spinner-border spinner-border-sm text-primary" role="status" style={{ width: '1rem', height: '1rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Filter Button */}
          <div className="col-12 col-md-3 col-lg-2">
            <button
              className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <span>Filters</span>
              <span>{showFilters ? '▲' : '▼'}</span>
            </button>
          </div>

          {/* Sort Options */}
          <div className="col-12 col-md-6 col-lg-4">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newArrival">New Arrival</option>
              <option value="featured">Featured</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="col-12 col-md-6 col-lg-2 text-end">
            <p className="mb-0 text-muted">
              {products.length} item{products.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Dropdown */}
      {showFilters && (
        <div className="products-filters mb-4">
          <div className="row g-3">
            {/* Category Filter */}
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-bold">Category</label>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="shirts">Shirts</option>
                <option value="pants">Pants</option>
                <option value="blazers">Blazers</option>
                <option value="panjabi">Panjabi</option>
              </select>
            </div>

            {/* Color Filter */}
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-bold">Color</label>
              <select
                className="form-select"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                <option value="">All Colors</option>
                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-bold">Size</label>
              <select
                className="form-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">All Sizes</option>
                {availableSizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-bold">Price Range</label>
              <div className="d-flex gap-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                />
                <span className="align-self-center">-</span>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <div className="row mt-3">
            <div className="col-12">
              <button
                className="btn btn-outline-secondary"
                onClick={handleResetFilters}
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator for initial load */}
      {loading && products.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-5">
          <p style={{color: '#6c757d', fontSize: '1.125rem'}}>No products found.</p>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((prod) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={prod._id}>
              <div className="premium-product-card position-relative">
                {/* Wishlist Button */}
                {user && (
                  <button
                    className="product-wishlist-btn"
                    onClick={(e) => handleWishlistToggle(e, prod._id)}
                    disabled={updatingWishlist[prod._id]}
                    title={wishlistStatus[prod._id] ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    {updatingWishlist[prod._id] ? (
                      '...'
                    ) : wishlistStatus[prod._id] ? (
                      '❤️'
                    ) : (
                      '🤍'
                    )}
                  </button>
                )}
                
                <Link to={`/products/${prod._id}`} className="text-decoration-none text-reset">
                  <div className="product-image-container">
                    <img 
                      src={getProductImage(prod)} 
                      alt={prod.name} 
                      className="product-image"
                    />
                    {prod.availability === 0 && (
                      <span className="premium-badge position-absolute top-0 start-0 m-2" style={{
                        background: '#e74c3c',
                        color: '#ffffff'
                      }}>
                        Out of Stock
                      </span>
                    )}
                    {prod.featured && (
                      <span className="premium-badge position-absolute top-0 end-0 m-2" style={{
                        background: '#2c3e50',
                        color: '#ffffff'
                      }}>
                        Featured
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{prod.name}</h5>
                    <div className="card-price">BDT {prod.price}</div>
                    <div className="mb-2">
                      <span className="premium-badge premium-badge-secondary me-1">{prod.category}</span>
                      {prod.type && (
                        <span className="premium-badge premium-badge-accent">{prod.type}</span>
                      )}
                      {prod.color && (
                        <span className="premium-badge" style={{
                          background: '#3498db',
                          color: '#ffffff'
                        }}>{prod.color}</span>
                      )}
                    </div>
                    {prod.sizes && prod.sizes.length > 0 && (
                      <div className="mb-2">
                        <small className="text-muted d-block mb-1">Available Sizes:</small>
                        <div className="d-flex flex-wrap gap-1">
                          {prod.sizes.map((size) => (
                            <span 
                              key={size} 
                              className="premium-badge" 
                              style={{
                                background: '#9b59b6',
                                color: '#ffffff',
                                fontSize: '0.7rem'
                              }}
                            >
                              {size}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {prod.description && (
                      <p className="small" style={{color: '#6c757d', marginTop: 'auto'}}>{prod.description}</p>
                    )}
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
