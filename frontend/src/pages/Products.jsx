import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

const Products = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const endpoint = category 
          ? `/products/category/${category}` 
          : '/products';
        const response = await api.get(endpoint);
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

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

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="mb-4 p-4 bg-light rounded-3 shadow-sm text-center">
        <h2 className="fw-bold display-5 text-capitalize mb-2">
          {category ? `${category}` : 'All Products'}
        </h2>
        <span className="text-secondary">Discover the latest in men&apos;s fashion</span>
      </div>
      {products.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No products found.</p>
        </div>
      ) : (
        <div className="row g-4">
          {products.map((prod) => (
            <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={prod._id}>
              <Link to={`/products/${prod._id}`} className="text-decoration-none text-reset">
                <div className="card h-100 shadow border-0 product-card-hover">
                  <div className="position-relative">
                    <img 
                      src={getProductImage(prod)} 
                      className="card-img-top" 
                      alt={prod.name} 
                      style={{height: 220, objectFit: 'cover'}} 
                    />
                    {prod.availability === 0 && (
                      <span className="badge position-absolute top-0 start-0 m-2 bg-danger">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <div className="card-body">
                    <h5 className="card-title mb-2">{prod.name}</h5>
                    <div className="text-primary fw-bold mb-2">${prod.price}</div>
                    <div className="mb-2">
                      <span className="badge bg-secondary me-1 text-capitalize">{prod.category}</span>
                      {prod.type && (
                        <span className="badge bg-info text-capitalize">{prod.type}</span>
                      )}
                    </div>
                    {prod.description && (
                      <p className="card-text small text-muted">{prod.description}</p>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
