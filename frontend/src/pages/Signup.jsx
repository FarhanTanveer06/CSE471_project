import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validatePhone = (input) => /^\d{8,}$/.test(input);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhone(phone)) {
      setError('Enter a valid phone number (at least 8 digits)');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 1. Call signup API
      await api.post('/auth/signup', { name, phone, password });
      // 2. Log in automatically
      const res = await api.post('/auth/login', { phone, password });
      login(res.data.user, res.data.token);
      // 3. Redirect to home
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{maxWidth: 400, width: '100%'}}>
        <h2 className="mb-4 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="text" className="form-control" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <input type="tel" className="form-control" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))} required />
          </div>
          <div className="mb-3">
            <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-success w-100" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
