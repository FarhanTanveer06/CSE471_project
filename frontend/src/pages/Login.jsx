import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

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
      const res = await api.post('/auth/login', { phone, password });
      console.log('Login response:', res.data); // Debug log
      login(res.data.user, res.data.token);
      
      // Show success message for admin
      if (res.data.user.role === 'admin') {
        setSuccessMessage(`Hi admin, ${res.data.user.name}!`);
        setTimeout(() => {
          navigate('/'); // Redirect to home after 2 seconds
        }, 2000);
      } else {
        console.log('User role is:', res.data.user.role); // Debug log
        navigate('/'); // Redirect immediately for regular users
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed!';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  // If user is already logged in, show greeting
  if (user) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="card p-4 shadow text-center" style={{maxWidth: 400, width: '100%'}}>
          <h2 className="mb-3">
            {user.role === 'admin' ? 'Hi admin' : 'Hi'}, {user.name}!
          </h2>
          {user.role === 'admin' && (
            <div className="alert alert-info mb-3">
              <strong>Admin Access:</strong> You have administrative privileges.
            </div>
          )}
          <p className="text-muted mb-3">You are already logged in.</p>
          <button className="btn btn-primary w-100" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card p-4 shadow" style={{maxWidth: 400, width: '100%'}}>
        <h2 className="mb-4 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input type="tel" className="form-control" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))} required />
          </div>
          <div className="mb-3">
            <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {successMessage && (
            <div className="alert alert-success text-center">
              <h4 className="mb-2"><strong>{successMessage}</strong></h4>
              <p className="mb-0">Redirecting to home...</p>
            </div>
          )}
          <button type="submit" className="btn btn-primary w-100" disabled={loading || successMessage}>
            {loading ? 'Logging in...' : successMessage ? 'Success!' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
