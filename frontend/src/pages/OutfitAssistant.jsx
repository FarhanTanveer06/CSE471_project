import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const OutfitAssistant = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  const sendPrompt = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!prompt.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/assistant/suggest', { prompt });
      setMessages(prev => [...prev, { role: 'user', text: prompt }, { role: 'assistant', text: response.data.message }]);
      setSuggestions(response.data.suggestions || []);
      setPrompt('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await api.post('/cart/add', {
        productId: product._id,
        quantity: 1,
        size: product.sizes?.[0] || 'M'
      });
      alert('Added to cart');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-3">Outfit Assistant</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3 d-flex">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Describe your event and style (e.g., Wedding, formal, navy)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendPrompt();
          }}
        />
        <button className="btn btn-primary" onClick={sendPrompt} disabled={loading}>
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </div>

      <div className="mb-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`p-3 mb-2 rounded ${m.role === 'user' ? 'bg-light' : 'bg-primary text-white'}`}>
            {m.text}
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <>
          <h5 className="mb-3">Suggested Products</h5>
          <div className="row g-3">
            {suggestions.map((product) => {
              const imageSrc = product.images?.[0] || product.imageUrl || 'https://via.placeholder.com/300x400?text=No+Image';
              const isAvailable = product.availability > 0;
              return (
                <div key={product._id} className="col-12 col-sm-6 col-lg-4">
                  <div className="card h-100">
                    <img src={imageSrc} className="card-img-top" alt={product.name} />
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title">{product.name}</h6>
                      <div className="mb-1">{product.category} • {product.type}</div>
                      <div className="mb-2">৳ {product.price}</div>
                      <div className="mt-auto d-flex">
                        <Link to={`/products/${product._id}`} className="btn btn-outline-primary me-2">View</Link>
                        {isAvailable && (
                          <button className="btn btn-primary" onClick={() => handleAddToCart(product)}>
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default OutfitAssistant;
