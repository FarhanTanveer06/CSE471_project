import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/products.css';

const MyResellItems = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/resell/my-items');
        setProducts(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load your items');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, navigate]);

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await api.delete(`/resell/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      alert('Item deleted successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete item');
    }
  };

  const handleMarkAsSold = async (productId) => {
    if (!window.confirm('Mark this item as sold?')) {
      return;
    }

    try {
      const response = await api.post(`/resell/${productId}/sold`);
      setProducts(products.map(p => p._id === productId ? response.data : p));
      alert('Item marked as sold');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
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

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Resell Items</h2>
        <Link to="/resell/sell" className="btn btn-primary">
          Sell New Item
        </Link>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-4">You haven't listed any items yet.</p>
          <Link to="/resell/sell" className="btn btn-primary">
            Sell Your First Item
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
                    style={{ height: '250px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="h5 mb-0 text-primary">${product.price}</span>
                      <span className={`badge ${product.status === 'available' ? 'bg-success' : product.status === 'sold' ? 'bg-danger' : 'bg-warning'}`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="card-text">
                      <small className="text-muted">
                        {product.category} • {product.size} • {product.color}
                      </small>
                    </p>
                    <p className="card-text">
                      <small className="text-muted">Condition: {product.condition}</small>
                    </p>
                  </div>
                </Link>
                <div className="card-footer bg-transparent">
                  <div className="d-flex gap-2">
                    <Link
                      to={`/resell/${product._id}`}
                      className="btn btn-sm btn-outline-primary flex-fill"
                    >
                      View
                    </Link>
                    {product.status === 'available' && (
                      <button
                        className="btn btn-sm btn-outline-warning flex-fill"
                        onClick={() => handleMarkAsSold(product._id)}
                      >
                        Mark Sold
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-danger flex-fill"
                      onClick={() => handleDelete(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyResellItems;

