import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/skinToneAnalysis.css';

const SkinToneAnalysis = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setError(null);
    setAnalysis(null);
    setRecommendedProducts([]);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    if (!user) {
      alert('Please login to use this feature');
      navigate('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await api.post('/skin-tone/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setAnalysis(response.data);
      await fetchRecommendedProducts(response.data.recommendedColors.best);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedProducts = async (colors) => {
    setLoadingProducts(true);
    try {
      const response = await api.get('/products');
      
      const filtered = response.data.filter(product => 
        colors.some(color => 
          product.color.toLowerCase().includes(color.toLowerCase())
        )
      );

      setRecommendedProducts(filtered);
    } catch (err) {
      // Failed to fetch products
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="skin-tone-analysis-container">
      <div className="container py-5">
        <h1 className="text-center mb-4">Find Your Perfect Colors</h1>
        <p className="text-center text-muted mb-5">
          Upload a clear photo of your face to discover which colors will brighten up your complexion
        </p>

        <div className="row justify-content-center">
          <div className="col-md-6 mb-4">
            <div className="upload-section">
              <div className="upload-area">
                {preview ? (
                  <div className="image-preview">
                    <img src={preview} alt="Preview" />
                    <button 
                      className="btn btn-sm btn-outline-danger mt-2"
                      onClick={() => {
                        setSelectedImage(null);
                        setPreview(null);
                        setAnalysis(null);
                        setRecommendedProducts([]);
                      }}
                    >
                      Remove Image
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="d-none"
                    />
                    <div className="upload-placeholder">
                      <i className="bi bi-camera-fill" style={{ fontSize: '3rem', color: '#667eea' }}></i>
                      <p>Click to upload your photo</p>
                      <small>Max size: 5MB</small>
                    </div>
                  </label>
                )}
              </div>

              {error && (
                <div className="alert alert-danger mt-3">{error}</div>
              )}

              <button
                className="btn btn-primary w-100 mt-3"
                onClick={handleAnalyze}
                disabled={!selectedImage || loading}
              >
                {loading ? 'Analyzing...' : 'Analyze Skin Tone'}
              </button>
            </div>
          </div>

          {analysis && (
            <div className="col-md-6">
              <div className="results-section">
                <h3>Your Analysis</h3>
                
                <div className="skin-tone-badge mb-3">
                  <span className="badge bg-primary" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                    {analysis.skinTone.charAt(0).toUpperCase() + analysis.skinTone.slice(1).replace('-', ' ')} Skin Tone
                  </span>
                </div>

                {analysis.faceAttributes && (
                  <div className="face-attributes mb-3">
                    <small className="text-muted">
                      Age: {analysis.faceAttributes.age} | 
                      Gender: {analysis.faceAttributes.gender}
                    </small>
                  </div>
                )}

                <div className="recommendations mt-4">
                  <h5>Best Colors (Recommended)</h5>
                  <p className="text-muted">{analysis.recommendedColors.description}</p>
                  
                  <div className="color-tags mb-3">
                    {analysis.recommendedColors.best.map((color, index) => (
                      <span key={index} className="color-tag best">
                        {color}
                      </span>
                    ))}
                  </div>

                  <h6 className="mt-3">Colors to Avoid</h6>
                  <p className="text-muted small">These colors may make your skin appear darker</p>
                  <div className="color-tags">
                    {analysis.recommendedColors.avoid.map((color, index) => (
                      <span key={index} className="color-tag avoid">
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {loadingProducts && (
          <div className="text-center mt-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {recommendedProducts.length > 0 && (
          <div className="recommended-products mt-5">
            <h3 className="mb-4">Recommended Products for You</h3>
            <div className="row">
              {recommendedProducts.map(product => (
                <div key={product._id} className="col-md-3 mb-4">
                  <div className="product-card">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="product-image"
                    />
                    <div className="product-info">
                      <h5>{product.name}</h5>
                      <p className="text-muted">{product.color}</p>
                      <p className="price fw-bold">BDT {product.price}</p>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkinToneAnalysis;

