import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/sellItem.css';

const SellItem = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    type: '',
    color: '',
    size: '',
    images: [''],
    description: '',
    condition: '',
    fabricType: '',
    originalPrice: '',
    purchaseDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    if (formData.images.length > 1) {
      const newImages = formData.images.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      alert('Please login to sell items');
      navigate('/login');
      return;
    }

    const images = formData.images.filter(img => img.trim() !== '');
    if (images.length === 0) {
      setError('Please provide at least one image URL');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        ...formData,
        images,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        purchaseDate: formData.purchaseDate || undefined
      };

      await api.post('/resell', submitData);
      alert('Item listed successfully!');
      navigate('/resell/my-items');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to list item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h2 className="mb-4">Sell Your Preowned Item</h2>
          
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Item Name *</label>
                <input
                  type="text"
                  className="form-control"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Selling Price (BDT) *</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Category *</label>
                <select
                  className="form-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select category</option>
                  <option value="shirts">Shirts</option>
                  <option value="pants">Pants</option>
                  <option value="blazers">Blazers</option>
                  <option value="panjabi">Panjabi</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Type *</label>
                <input
                  type="text"
                  className="form-control"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="e.g., Formal, Casual, Semi-formal"
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Color *</label>
                <input
                  type="text"
                  className="form-control"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Size *</label>
                <select
                  className="form-select"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select size</option>
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Condition *</label>
                <select
                  className="form-select"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select condition</option>
                  <option value="Like New">Like New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Fabric Type</label>
                <input
                  type="text"
                  className="form-control"
                  name="fabricType"
                  value={formData.fabricType}
                  onChange={handleChange}
                  placeholder="e.g., Cotton, Polyester"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Original Price (BDT)</label>
                <input
                  type="number"
                  className="form-control"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Purchase Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the item's condition, any defects, etc."
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Image URLs *</label>
                {formData.images.map((image, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      type="url"
                      className="form-control"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.images.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeImageField(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={addImageField}
                >
                  Add Another Image
                </button>
              </div>
            </div>

            <div className="d-flex gap-2 mt-4">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Listing...' : 'List Item for Sale'}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => navigate('/resell')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellItem;

