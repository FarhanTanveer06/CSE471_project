import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (path) => {
    closeMenu();
    // Force navigation even if we're on a similar route
    if (location.pathname !== path) {
      navigate(path);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg premium-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" onClick={() => handleNavClick('/')}>Men's Kart</Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="mainNavbar" 
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/" onClick={() => handleNavClick('/')}>Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products" onClick={() => handleNavClick('/products')}>All Products</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products/category/shirts" onClick={() => handleNavClick('/products/category/shirts')}>Shirts</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products/category/pants" onClick={() => handleNavClick('/products/category/pants')}>Pants</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products/category/blazers" onClick={() => handleNavClick('/products/category/blazers')}>Blazers</Link></li>
            {user && user.role === 'admin' && (
              <li className="nav-item"><Link className="nav-link" to="/admin" onClick={() => handleNavClick('/admin')}>Admin Dashboard</Link></li>
            )}
          </ul>
          <ul className="navbar-nav mb-2 mb-lg-0">
            {user ? (
              <>
                <li className="nav-item nav-link text-light">Hi, {user.name}</li>
                <li className="nav-item"><button className="btn btn-outline-light ms-2" onClick={handleLogout}>Logout</button></li>
              </>
            ) : (
              <>
                <li className="nav-item"><Link className="btn btn-outline-light me-2" to="/login" onClick={() => handleNavClick('/login')}>Login</Link></li>
                <li className="nav-item"><Link className="btn btn-light" to="/signup" onClick={() => handleNavClick('/signup')}>Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
