import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import MixupAndSee from './pages/MixupAndSee';
import AdminDashboard from './pages/AdminDashboard';
import ResellProducts from './pages/ResellProducts';
import ResellProductDetails from './pages/ResellProductDetails';
import SellItem from './pages/SellItem';
import MyResellItems from './pages/MyResellItems';
import AuthProvider from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

const App = () => (
  <AuthProvider>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/category/:category" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/mixup-and-see" element={<ProtectedRoute><MixupAndSee /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/resell" element={<ResellProducts />} />
        <Route path="/resell/:id" element={<ResellProductDetails />} />
        <Route path="/resell/sell" element={<ProtectedRoute><SellItem /></ProtectedRoute>} />
        <Route path="/resell/my-items" element={<ProtectedRoute><MyResellItems /></ProtectedRoute>} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
