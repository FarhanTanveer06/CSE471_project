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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToAction, setProductToAction] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  // Handle ESC key to close modals and prevent body scroll
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (showDeleteModal) {
          setShowDeleteModal(false);
          setProductToAction(null);
        }
        if (showErrorModal) {
          setShowErrorModal(false);
          setErrorMessage('');
        }
      }
    };

    if (showDeleteModal || showErrorModal) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [showDeleteModal, showErrorModal]);

  const cleanErrorMessage = (message) => {
    return message.replace(/http:\/\/localhost:\d+/gi, '').replace(/localhost/gi, '').trim() || message;
  };

  const handleDeleteClick = (productId) => {
    setProductToAction(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToAction) return;
    
    setShowDeleteModal(false);
    const productId = productToAction;
    setProductToAction(null);
    
    try {
      await api.delete(`/resell/${productId}`);
      setProducts(products.filter(p => p._id !== productId));
      setSuccessMessage('Item deleted successfully!');
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to delete item';
      setErrorMessage(cleanErrorMessage(errorMsg));
      setShowErrorModal(true);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToAction(null);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setErrorMessage('');
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

      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setSuccessMessage('')}
            aria-label="Close"
          ></button>
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
                    style={{ height: '250px', objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="h5 mb-0 text-primary">BDT {product.price}</span>
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
                    <button
                      className="btn btn-sm btn-outline-danger flex-fill"
                      onClick={() => handleDeleteClick(product._id)}
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

      {/* Delete Confirmation Modal */}
      <div className={`modal fade ${showDeleteModal ? 'show' : ''}`} style={{ display: showDeleteModal ? 'block' : 'none' }} tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Delete Item</h5>
              <button type="button" className="btn-close" onClick={closeDeleteModal} aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={closeDeleteModal}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal && <div className="modal-backdrop fade show" onClick={closeDeleteModal}></div>}

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

export default MyResellItems;

