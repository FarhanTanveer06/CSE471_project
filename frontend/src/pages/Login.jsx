import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [loginMethod, setLoginMethod] = useState('phone'); // 'phone' or 'username'
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const { login, user } = useContext(AuthContext);

  const validatePhone = (input) => /^\d{8,}$/.test(input);
  const validateUsername = (input) => /^[a-zA-Z0-9_]{3,}$/.test(input);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate based on login method
    if (loginMethod === 'phone') {
      if (!validatePhone(phone)) {
        setError('Enter a valid phone number (at least 8 digits)');
        return;
      }
    } else {
      if (!validateUsername(username)) {
        setError('Enter a valid username (at least 3 characters)');
        return;
      }
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const loginData = loginMethod === 'phone' 
        ? { phone, password }
        : { username, password };
      
      const res = await api.post('/auth/login', loginData);
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
      <div className="auth-container">
        <div className="auth-logged-in-card">
          <h2 className="auth-logged-in-title">
            {user.role === 'admin' ? 'Hi admin' : 'Hi'}, {user.name}!
          </h2>
          {user.role === 'admin' && (
            <div className="auth-alert auth-alert-info">
              <strong>Admin Access:</strong> You have administrative privileges.
            </div>
          )}
          <p className="auth-logged-in-text">You are already logged in.</p>
          <button className="auth-button" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">Men's Kart</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Login Method Toggle */}
          <div className="auth-toggle-group">
            <button
              type="button"
              className={`auth-toggle-btn ${loginMethod === 'phone' ? 'active' : ''}`}
              onClick={() => {
                setLoginMethod('phone');
                setUsername('');
                setError('');
              }}
            >
              Phone
            </button>
            <button
              type="button"
              className={`auth-toggle-btn ${loginMethod === 'username' ? 'active' : ''}`}
              onClick={() => {
                setLoginMethod('username');
                setPhone('');
                setError('');
              }}
            >
              Username
            </button>
          </div>

          {/* Input based on login method */}
          <div className="auth-form-group">
            <label className="auth-label">
              {loginMethod === 'phone' ? 'Phone Number' : 'Username'}
            </label>
            {loginMethod === 'phone' ? (
              <input 
                type="tel" 
                className="auth-input" 
                placeholder="Enter your phone number" 
                value={phone} 
                onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))} 
                required 
                minLength={8}
              />
            ) : (
              <input 
                type="text" 
                className="auth-input" 
                placeholder="Enter your username" 
                value={username} 
                onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} 
                required 
                minLength={3}
              />
            )}
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <input 
              type="password" 
              className="auth-input" 
              placeholder="Enter your password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              minLength={6}
            />
          </div>

          {error && (
            <div className="auth-alert auth-alert-error">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="auth-alert auth-alert-success">
              <strong>{successMessage}</strong>
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>Redirecting to home...</p>
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading || successMessage}
          >
            {loading ? (
              <>
                <span className="auth-spinner"></span>
                Logging in...
              </>
            ) : successMessage ? (
              'Success!'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-footer-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
