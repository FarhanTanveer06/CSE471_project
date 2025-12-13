import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validatePhone = (input) => /^\d{8,}$/.test(input);
  const validateUsername = (input) => /^[a-zA-Z0-9_]{3,}$/.test(input);
  const validatePassword = (input) => input.length >= 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name
    if (name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    // Validate phone
    if (!validatePhone(phone)) {
      setError('Enter a valid phone number (at least 8 digits)');
      return;
    }

    // Validate username if provided
    if (username && !validateUsername(username)) {
      setError('Username must be at least 3 characters and contain only letters, numbers, and underscores');
      return;
    }

    // Validate password
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setError('');
    setLoading(true);
    try {
      // 1. Call signup API
      await api.post('/auth/signup', { name, username: username || undefined, phone, password });
      // 2. Log in automatically using phone or username
      const loginCredential = username || phone;
      const res = await api.post('/auth/login', { 
        ...(username ? { username } : { phone }), 
        password 
      });
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
    <div className="auth-container auth-container-alt">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">Men's Kart</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join us to start shopping for premium fashion</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Full Name</label>
            <input 
              type="text" 
              className="auth-input" 
              placeholder="Enter your full name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              minLength={2}
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">
              Username{' '}
              <span className="auth-label-optional">(Optional)</span>
            </label>
            <input 
              type="text" 
              className="auth-input" 
              placeholder="Choose a username (optional)" 
              value={username} 
              onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} 
              minLength={3}
            />
            <span className="auth-help-text">
              3+ characters, letters, numbers, and underscores only
            </span>
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Phone Number</label>
            <input 
              type="tel" 
              className="auth-input" 
              placeholder="Enter your phone number" 
              value={phone} 
              onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))} 
              required 
              minLength={8}
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="Create a password (min 6 characters)" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
            <span className="auth-help-text">
              Password must be at least 6 characters long
            </span>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button auth-button-primary" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="auth-spinner"></span>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Already have an account?{' '}
            <Link to="/login" className="auth-footer-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
