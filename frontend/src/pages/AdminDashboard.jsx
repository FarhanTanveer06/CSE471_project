import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/admin.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: 'shirts',
    type: '',
    color: '',
    sizes: [],
    images: [''],
    description: '',
    fabricType: '',
    gsm: '',
    availability: '',
    featured: false
  });

  // Edit product state
  const [editingProduct, setEditingProduct] = useState(null);
  const [priceUpdate, setPriceUpdate] = useState({});

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [activeTab, user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'products') {
        const res = await api.get('/admin/products');
        setProducts(res.data);
      } else if (activeTab === 'users') {
        const res = await api.get('/admin/users');
        setUsers(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const productData = {
        ...productForm,
        price: Number(productForm.price),
        gsm: Number(productForm.gsm),
        availability: Number(productForm.availability),
        images: productForm.images.filter(img => img.trim() !== ''),
        sizes: productForm.sizes
      };

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, productData);
        setSuccess('Product updated successfully!');
      } else {
        await api.post('/admin/products', productData);
        setSuccess('Product added successfully!');
      }

      // Reset form
      setProductForm({
        name: '',
        price: '',
        category: 'shirts',
        type: '',
        color: '',
        sizes: [],
        images: [''],
        description: '',
        fabricType: '',
        gsm: '',
        availability: '',
        featured: false
      });
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/admin/products/${id}`);
      setSuccess('Product deleted successfully!');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      type: product.type || '',
      color: product.color || '',
      sizes: product.sizes || [],
      images: product.images && product.images.length > 0 ? product.images : [''],
      description: product.description || '',
      fabricType: product.fabricType || '',
      gsm: product.gsm || '',
      availability: product.availability || '',
      featured: product.featured || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePriceUpdate = async (productId, newPrice) => {
    if (!newPrice || newPrice <= 0) {
      setError('Please enter a valid price');
      return;
    }

    try {
      await api.patch(`/admin/products/${productId}/price`, { price: Number(newPrice) });
      setSuccess('Price updated successfully!');
      setPriceUpdate({ ...priceUpdate, [productId]: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update price');
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/ban`);
      setSuccess(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const addImageField = () => {
    setProductForm({
      ...productForm,
      images: [...productForm.images, '']
    });
  };

  const updateImageField = (index, value) => {
    const newImages = [...productForm.images];
    newImages[index] = value;
    setProductForm({ ...productForm, images: newImages });
  };

  const removeImageField = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages.length > 0 ? newImages : [''] });
  };

  const toggleSize = (size) => {
    const newSizes = productForm.sizes.includes(size)
      ? productForm.sizes.filter(s => s !== size)
      : [...productForm.sizes, size];
    setProductForm({ ...productForm, sizes: newSizes });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Admin Dashboard</h1>
          
          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                Products Management
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                Users Management
              </button>
            </li>
          </ul>

          {/* Messages */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}
          {success && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === 'products' && (
            <div>
              {/* Add/Edit Product Form */}
              <div className="card mb-4">
                <div className="card-header">
                  <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleProductSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Product Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Category *</label>
                        <select
                          className="form-select"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          required
                        >
                          <option value="shirts">Shirts</option>
                          <option value="pants">Pants</option>
                          <option value="blazers">Blazers</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Type *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={productForm.type}
                          onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                          placeholder="e.g., Formal, Casual"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Color *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={productForm.color}
                          onChange={(e) => setProductForm({ ...productForm, color: e.target.value })}
                          placeholder="e.g., Black, White, Navy"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Fabric Type *</label>
                        <input
                          type="text"
                          className="form-control"
                          value={productForm.fabricType}
                          onChange={(e) => setProductForm({ ...productForm, fabricType: e.target.value })}
                          placeholder="e.g., Cotton, Polyester"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">GSM *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={productForm.gsm}
                          onChange={(e) => setProductForm({ ...productForm, gsm: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Availability (Stock) *</label>
                        <input
                          type="number"
                          className="form-control"
                          value={productForm.availability}
                          onChange={(e) => setProductForm({ ...productForm, availability: e.target.value })}
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Sizes *</label>
                        <div className="d-flex gap-2 flex-wrap">
                          {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                            <button
                              key={size}
                              type="button"
                              className={`btn ${productForm.sizes.includes(size) ? 'btn-primary' : 'btn-outline-primary'}`}
                              onClick={() => toggleSize(size)}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Images *</label>
                        {productForm.images.map((img, index) => (
                          <div key={index} className="input-group mb-2">
                            <input
                              type="url"
                              className="form-control"
                              value={img}
                              onChange={(e) => updateImageField(index, e.target.value)}
                              placeholder="Image URL"
                              required
                            />
                            {productForm.images.length > 1 && (
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
                          className="btn btn-sm btn-outline-secondary"
                          onClick={addImageField}
                        >
                          + Add Another Image
                        </button>
                      </div>
                      <div className="col-12 mb-3">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={productForm.description}
                          onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        />
                      </div>
                      <div className="col-12 mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={productForm.featured}
                            onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                          />
                          <label className="form-check-label">Featured Product</label>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                      </button>
                      {editingProduct && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setEditingProduct(null);
                            setProductForm({
                              name: '',
                              price: '',
                              category: 'shirts',
                              type: '',
                              color: '',
                              sizes: [],
                              images: [''],
                              description: '',
                              fabricType: '',
                              gsm: '',
                              availability: '',
                              featured: false
                            });
                          }}
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* Products List */}
              <div className="card">
                <div className="card-header">
                  <h3>All Products ({products.length})</h3>
                </div>
                <div className="card-body">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : products.length === 0 ? (
                    <p className="text-muted">No products found.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr key={product._id}>
                              <td>
                                <img
                                  src={product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/50'}
                                  alt={product.name}
                                  style={{ width: 50, height: 50, objectFit: 'cover' }}
                                />
                              </td>
                              <td>{product.name}</td>
                              <td><span className="badge bg-secondary">{product.category}</span></td>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    style={{ width: 100 }}
                                    defaultValue={product.price}
                                    onChange={(e) => setPriceUpdate({ ...priceUpdate, [product._id]: e.target.value })}
                                  />
                                  <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => handlePriceUpdate(product._id, priceUpdate[product._id] || product.price)}
                                  >
                                    Update
                                  </button>
                                </div>
                              </td>
                              <td>{product.availability || 0}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-warning"
                                    onClick={() => handleEditProduct(product)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteProduct(product._id)}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="card">
              <div className="card-header">
                <h3>All Users ({users.length})</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : users.length === 0 ? (
                  <p className="text-muted">No users found.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Phone</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Joined</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((usr) => (
                          <tr key={usr._id}>
                            <td>{usr.name}</td>
                            <td>{usr.phone}</td>
                            <td>
                              <span className={`badge ${usr.role === 'admin' ? 'bg-danger' : 'bg-primary'}`}>
                                {usr.role}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${usr.banned ? 'bg-danger' : 'bg-success'}`}>
                                {usr.banned ? 'Banned' : 'Active'}
                              </span>
                            </td>
                            <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                            <td>
                              {usr.role !== 'admin' && (
                                <button
                                  className={`btn btn-sm ${usr.banned ? 'btn-success' : 'btn-danger'}`}
                                  onClick={() => handleToggleBan(usr._id)}
                                >
                                  {usr.banned ? 'Unban' : 'Ban'}
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

