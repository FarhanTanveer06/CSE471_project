import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/mixupAndSee.css';

const MixupAndSee = () => {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [previewItems, setPreviewItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [selectedSizes, setSelectedSizes] = useState({}); // Track selected size per item
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

  const handleClearPreview = async () => {
    if (previewItems.length === 0) return;
    
    if (!window.confirm('Are you sure you want to clear all items from preview?')) {
      return;
    }

    try {
      await api.delete('/preview/clear');
      setPreviewItems([]);
      setCurrentTopIndex(0);
      setCurrentBottomIndex(0);
      alert('All items cleared from preview successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear preview');
    }
  };

  // Filter items once using useMemo
  const topItems = useMemo(() => {
    return previewItems.filter(item => {
      if (!item) return false;
      const product = item.productId || item;
      return product && product.category && product.category !== 'pants';
    });
  }, [previewItems]);

  const bottomItems = useMemo(() => {
    return previewItems.filter(item => {
      if (!item) return false;
      const product = item.productId || item;
      return product && product.category && product.category === 'pants';
    });
  }, [previewItems]);

  // Reset indices if they exceed array length
  useEffect(() => {
    if (currentTopIndex >= topItems.length && topItems.length > 0) {
      setCurrentTopIndex(0);
    }
    if (currentBottomIndex >= bottomItems.length && bottomItems.length > 0) {
      setCurrentBottomIndex(0);
    }
  }, [previewItems, currentTopIndex, currentBottomIndex, topItems.length, bottomItems.length]);

  const handleAddToCart = async (product, itemId) => {
    if (!product.productId) return;

    const productData = product.productId;

    if (productData.availability <= 0) {
      alert('Product is out of stock');
      return;
    }

    const sizeToUse = selectedSizes[itemId];

    try {
      setAddingToCart(prev => ({ ...prev, [itemId]: true }));
      await api.post('/cart/add', {
        productId: productData._id,
        quantity: 1,
        size: sizeToUse
      });
      alert('Item added to cart successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add item to cart');
    } finally {
      setAddingToCart(prev => ({ ...prev, [itemId]: false }));
    }
  };

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
    // Clear selected size for current item before navigating
    if (topItems.length > 0 && topItems[currentTopIndex]) {
      const currentItem = topItems[currentTopIndex];
      setSelectedSizes(prev => {
        const updated = { ...prev };
        delete updated[currentItem._id];
        return updated;
      });
    }
    setCurrentTopIndex((prev) => (prev === 0 ? topItems.length - 1 : prev - 1));
  };

  const handleTopNext = () => {
    // Clear selected size for current item before navigating
    if (topItems.length > 0 && topItems[currentTopIndex]) {
      const currentItem = topItems[currentTopIndex];
      setSelectedSizes(prev => {
        const updated = { ...prev };
        delete updated[currentItem._id];
        return updated;
      });
    }
    setCurrentTopIndex((prev) => (prev === topItems.length - 1 ? 0 : prev + 1));
  };

  const handleBottomPrevious = () => {
    // Clear selected size for current item before navigating
    if (bottomItems.length > 0 && bottomItems[currentBottomIndex]) {
      const currentItem = bottomItems[currentBottomIndex];
      setSelectedSizes(prev => {
        const updated = { ...prev };
        delete updated[currentItem._id];
        return updated;
      });
    }
    setCurrentBottomIndex((prev) => (prev === 0 ? bottomItems.length - 1 : prev - 1));
  };

  const handleBottomNext = () => {
    // Clear selected size for current item before navigating
    if (bottomItems.length > 0 && bottomItems[currentBottomIndex]) {
      const currentItem = bottomItems[currentBottomIndex];
      setSelectedSizes(prev => {
        const updated = { ...prev };
        delete updated[currentItem._id];
        return updated;
      });
    }
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
      <div className="container-fluid px-0 mixup-container-fluid">
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
                          <p className="mixup-item-price">BDT {product.price}</p>
                          
                          {/* Size Selection */}
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="mixup-size-selection">
                              <h6>Select Size:</h6>
                              <div className="d-flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                  <button
                                    key={size}
                                    type="button"
                                    className={`mixup-size-button ${selectedSizes[item._id] === size ? 'selected' : ''}`}
                                    onClick={() => setSelectedSizes(prev => ({ ...prev, [item._id]: size }))}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                              {selectedSizes[item._id] && (
                                <p className="text-success mt-1 mb-0 mixup-size-selected-text">
                                  <small>Selected: {selectedSizes[item._id]}</small>
                                </p>
                              )}
                            </div>
                          )}

                          <div className="mixup-item-actions">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddToCart(item, item._id)}
                              disabled={
                                addingToCart[item._id] || 
                                product.availability <= 0 ||
                                (product.sizes && product.sizes.length > 0 && !selectedSizes[item._id])
                              }
                            >
                              {addingToCart[item._id] 
                                ? 'Adding...' 
                                : (product.sizes && product.sizes.length > 0 && !selectedSizes[item._id])
                                  ? 'Select Size'
                                  : 'Add to Cart'}
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
                          <p className="mixup-item-price">BDT {product.price}</p>
                          
                          {/* Size Selection */}
                          {product.sizes && product.sizes.length > 0 && (
                            <div className="mixup-size-selection">
                              <h6>Select Size:</h6>
                              <div className="d-flex flex-wrap gap-2">
                                {product.sizes.map((size) => (
                                  <button
                                    key={size}
                                    type="button"
                                    className={`mixup-size-button ${selectedSizes[item._id] === size ? 'selected' : ''}`}
                                    onClick={() => setSelectedSizes(prev => ({ ...prev, [item._id]: size }))}
                                  >
                                    {size}
                                  </button>
                                ))}
                              </div>
                              {selectedSizes[item._id] && (
                                <p className="text-success mt-1 mb-0 mixup-size-selected-text">
                                  <small>Selected: {selectedSizes[item._id]}</small>
                                </p>
                              )}
                            </div>
                          )}

                          <div className="mixup-item-actions">
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleAddToCart(item, item._id)}
                              disabled={
                                addingToCart[item._id] || 
                                product.availability <= 0 ||
                                (product.sizes && product.sizes.length > 0 && !selectedSizes[item._id])
                              }
                            >
                              {addingToCart[item._id] 
                                ? 'Adding...' 
                                : (product.sizes && product.sizes.length > 0 && !selectedSizes[item._id])
                                  ? 'Select Size'
                                  : 'Add to Cart'}
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

        {/* Clear All Button - Only shows when there are items */}
        {previewItems.length > 0 && (
          <div className="mixup-clear-all-container">
            <button
              className="btn btn-danger btn-sm mixup-clear-all-button"
              onClick={handleClearPreview}
            >
              Clear All Items
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MixupAndSee;

