import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg premium-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">Smart Dress</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar" aria-controls="mainNavbar" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products/category/shirts">Shirts</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products/category/pants">Pants</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/products/category/blazers">Blazers</Link></li>
            {user && user.role === 'admin' && (
              <li className="nav-item"><Link className="nav-link" to="/admin">Admin Dashboard</Link></li>
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
                <li className="nav-item"><Link className="btn btn-outline-light me-2" to="/login">Login</Link></li>
                <li className="nav-item"><Link className="btn btn-light" to="/signup">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
