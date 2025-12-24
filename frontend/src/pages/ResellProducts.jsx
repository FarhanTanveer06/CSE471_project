import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/products.css';

const ResellProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);

  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newArrival');

  const availableColors = [...new Set(products.map(p => p.color).filter(Boolean))];
  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL'];
  const availableConditions = ['Like New', 'Excellent', 'Good', 'Fair'];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (selectedCategory) params.append('category', selectedCategory);
        if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
        if (selectedColor) params.append('color', selectedColor);
        if (selectedSize) params.append('size', selectedSize);
        if (selectedCondition) params.append('condition', selectedCondition);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (sortBy) params.append('sortBy', sortBy);

        const endpoint = `/resell?${params.toString()}`;
        const response = await api.get(endpoint);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, debouncedSearchTerm, selectedColor, selectedSize, selectedCondition, minPrice, maxPrice, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedColor('');
    setSelectedSize('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newArrival');
  };

  if (loading && products.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Thrift Items - Preowned Outfits</h2>
        <Link to="/resell/sell" className="btn btn-primary">
          Sell Your Item
        </Link>
      </div>

      <div className="products-controls mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <input
              ref={searchInputRef}
              type="text"
              className="form-control"
              placeholder="Search thrift items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoComplete="off"
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newArrival">New Arrival</option>
              <option value="priceLowToHigh">Price: Low to High</option>
              <option value="priceHighToLow">Price: High to Low</option>
            </select>
          </div>
          <div className="col-md-3">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="filters-panel mt-3 p-3 border rounded">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="shirts">Shirts</option>
                  <option value="pants">Pants</option>
                  <option value="blazers">Blazers</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Color</label>
                <select
                  className="form-select"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  <option value="">All Colors</option>
                  {availableColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Size</label>
                <select
                  className="form-select"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="">All Sizes</option>
                  {availableSizes.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Condition</label>
                <select
                  className="form-select"
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                >
                  <option value="">All Conditions</option>
                  {availableConditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Min Price (BDT)</label>
                <input
                  type="number"
                  className="form-control"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Max Price (BDT)</label>
                <input
                  type="number"
                  className="form-control"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="col-12">
                <button
                  className="btn btn-outline-secondary"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {products.length === 0 && !loading ? (
        <div className="text-center py-5">
          <p className="text-muted">No thrift items found. Be the first to list an item!</p>
          <Link to="/resell/sell" className="btn btn-primary">
            Sell Your Item
          </Link>
        </div>
      ) : (
        <div className="row">
          {products.map((product) => (
            <div key={product._id} className="col-md-4 col-lg-3 mb-4">
              <div className="card product-card h-100">
                <Link to={`/resell/${product._id}`} className="text-decoration-none">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/300'}
                    className="card-img-top"
                    alt={product.name}
                    style={{ height: '250px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text text-muted mb-2">
                      <small>By {product.sellerId?.name || 'Seller'}</small>
                    </p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="h5 mb-0 text-primary">BDT {product.price}</span>
                      <span className="badge bg-secondary">{product.condition}</span>
                    </div>
                    <p className="card-text mt-2">
                      <small className="text-muted">
                        {product.category} • {product.size} • {product.color}
                      </small>
                    </p>
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

export default ResellProducts;

