import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/mixupAndSee.css';

const MixupAndSee = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [previewItems, setPreviewItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [currentTopIndex, setCurrentTopIndex] = useState(0);
  const [currentBottomIndex, setCurrentBottomIndex] = useState(0);

  useEffect(() => {
    // Wait for auth to load before checking
    if (authLoading) {
      return;
    }

    // ProtectedRoute handles redirect, but we still need user for the API call
    if (!user) {
      return;
    }

    const fetchPreview = async () => {
      try {
        setLoading(true);
        const response = await api.get('/preview');
        setPreviewItems(response.data.items || []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load preview items');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [user, authLoading]);

  const handleRemoveFromPreview = async (itemId) => {
    try {
      await api.delete(`/preview/item/${itemId}`);
      setPreviewItems(prevItems => prevItems.filter(item => item._id !== itemId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove item from preview');
    }
  };

  useEffect(() => {
    const topItems = previewItems.filter(item => {
      if (!item) return false;
      const product = item.productId || item;
      return product && product.category && product.category !== 'pants';
    });
    const bottomItems = previewItems.filter(item => {
      if (!item) return false;
      const product = item.productId || item;
      return product && product.category && product.category === 'pants';
    });

    if (currentTopIndex >= topItems.length && topItems.length > 0) {
      setCurrentTopIndex(0);
    }
    if (currentBottomIndex >= bottomItems.length && bottomItems.length > 0) {
      setCurrentBottomIndex(0);
    }
  }, [previewItems, currentTopIndex, currentBottomIndex]);

  const handleAddToCart = async (product, itemId) => {
    if (!product.productId) return;

    const productData = product.productId;
    const defaultSize = productData.sizes && productData.sizes.length > 0 
      ? productData.sizes[0] 
      : 'M';

    if (productData.availability <= 0) {
      alert('Product is out of stock');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [itemId]: true }));
      await api.post('/cart/add', {
        productId: productData._id,
        quantity: 1,
        size: defaultSize
      });
      alert('Item added to cart successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const topItems = previewItems.filter(item => {
    if (!item) return false;
    const product = item.productId || item;
    return product && product.category && product.category !== 'pants';
  });
  const bottomItems = previewItems.filter(item => {
    if (!item) return false;
    const product = item.productId || item;
    return product && product.category && product.category === 'pants';
  });
  if (authLoading || loading) {
    return (
      <div className="mixup-container">
        <div className="container py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mixup-container">
        <div className="container py-5">
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const handleTopPrevious = () => {
    setCurrentTopIndex((prev) => (prev === 0 ? topItems.length - 1 : prev - 1));
  };

  const handleTopNext = () => {
    setCurrentTopIndex((prev) => (prev === topItems.length - 1 ? 0 : prev + 1));
  };

  const handleBottomPrevious = () => {
    setCurrentBottomIndex((prev) => (prev === 0 ? bottomItems.length - 1 : prev - 1));
  };

  const handleBottomNext = () => {
    setCurrentBottomIndex((prev) => (prev === bottomItems.length - 1 ? 0 : prev + 1));
  };

  const getProductImage = (product) => {
    if (!product) return 'https://via.placeholder.com/450x600?text=No+Image';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    if (product.imageUrl) {
      return product.imageUrl;
    }
    return 'https://via.placeholder.com/450x600?text=No+Image';
  };

  return (
    <div className="mixup-container">
      <div className="container-fluid px-0" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div className="mixup-section top-section">
          <div className="mixup-slideshow-container">
            {topItems.length > 0 ? (
              <>
                <button 
                  className="mixup-nav-btn mixup-nav-left" 
                  onClick={handleTopPrevious}
                  disabled={topItems.length <= 1}
                >
                  ‹
                </button>
                <div className="mixup-slideshow-content">
                  {(() => {
                    const item = topItems[currentTopIndex];
                    const product = item?.productId || item;
                    if (!product || !product.name) return null;
                    
                    return (
                      <div className="mixup-item-card">
                        <div className="mixup-item-image-container">
                          <img 
                            src={getProductImage(product)} 
                            alt={product.name}
                            className="mixup-item-image"
                          />
                        </div>
                        <div className="mixup-item-info">
                          <h4>{product.name}</h4>
                          <p className="mixup-item-price">${product.price}</p>
                          <div className="mixup-item-actions">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddToCart(item, item._id)}
                              disabled={addingToCart[item._id] || product.availability <= 0}
                            >
                              {addingToCart[item._id] ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleRemoveFromPreview(item._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <button 
                  className="mixup-nav-btn mixup-nav-right" 
                  onClick={handleTopNext}
                  disabled={topItems.length <= 1}
                >
                  ›
                </button>
              </>
            ) : (
              <div className="mixup-empty-state">
                <p>No top items in preview. Add items from product details page.</p>
              </div>
            )}
          </div>
        </div>

        <div className="mixup-section bottom-section">
          <div className="mixup-slideshow-container">
            {bottomItems.length > 0 ? (
              <>
                <button 
                  className="mixup-nav-btn mixup-nav-left" 
                  onClick={handleBottomPrevious}
                  disabled={bottomItems.length <= 1}
                >
                  ‹
                </button>
                <div className="mixup-slideshow-content">
                  {(() => {
                    const item = bottomItems[currentBottomIndex];
                    const product = item?.productId || item;
                    if (!product || !product.name) return null;
                    
                    return (
                      <div className="mixup-item-card">
                        <div className="mixup-item-image-container">
                          <img 
                            src={getProductImage(product)} 
                            alt={product.name}
                            className="mixup-item-image"
                          />
                        </div>
                        <div className="mixup-item-info">
                          <h4>{product.name}</h4>
                          <p className="mixup-item-price">${product.price}</p>
                          <div className="mixup-item-actions">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddToCart(item, item._id)}
                              disabled={addingToCart[item._id] || product.availability <= 0}
                            >
                              {addingToCart[item._id] ? 'Adding...' : 'Add to Cart'}
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleRemoveFromPreview(item._id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <button 
                  className="mixup-nav-btn mixup-nav-right" 
                  onClick={handleBottomNext}
                  disabled={bottomItems.length <= 1}
                >
                  ›
                </button>
              </>
            ) : (
              <div className="mixup-empty-state">
                <p>No bottom items in preview. Add items from product details page.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MixupAndSee;

