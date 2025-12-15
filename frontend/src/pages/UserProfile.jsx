import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const UserProfile = () => {
  const { user } = useContext(AuthContext);
  const [account, setAccount] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [meRes, ordersRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/orders'),
        ]);
        setAccount(meRes.data);
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">My Profile</h2>

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Account Information</h5>
              <div className="mb-2"><strong>Name:</strong> {account?.name || user?.name}</div>
              {account?.username && (
                <div className="mb-2"><strong>Username:</strong> {account.username}</div>
              )}
              <div className="mb-2"><strong>Phone:</strong> {account?.phone}</div>
              <div className="mb-2"><strong>Role:</strong> {account?.role}</div>
              <div className="mb-2"><strong>Created:</strong> {formatDate(account?.createdAt)}</div>
              {account?.banned && (
                <div className="alert alert-warning mt-3 mb-0">
                  This account is currently banned.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Order History</h5>
              {orders.length === 0 ? (
                <div className="text-muted">You have no orders yet.</div>
              ) : (
                <div className="list-group">
                  {orders.map((order) => (
                    <div key={order._id} className="list-group-item">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-bold">{order.orderNumber}</div>
                          <div className="text-muted">{formatDate(order.createdAt)}</div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-secondary me-2">{order.orderStatus}</span>
                          <span className="badge bg-info text-dark me-2">{order.paymentMethod}</span>
                          <span className="badge bg-success">৳ {order.totalAmount}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <table className="table table-sm mb-0">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th style={{ width: 90 }}>Size</th>
                              <th style={{ width: 90 }}>Qty</th>
                              <th style={{ width: 120 }}>Price</th>
                              <th style={{ width: 120 }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(order.items || []).map((item, idx) => {
                              const product = item.productId;
                              const productName = product?.name || item.productName;
                              const productId = product?._id || product;
                              return (
                                <tr key={`${order._id}-${idx}`}>
                                  <td>
                                    {productId ? (
                                      <Link to={`/products/${productId}`}>{productName}</Link>
                                    ) : (
                                      productName
                                    )}
                                  </td>
                                  <td>{item.size}</td>
                                  <td>{item.quantity}</td>
                                  <td>৳ {item.price}</td>
                                  <td>৳ {item.total}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div className="mt-2 text-muted">
                          Subtotal: ৳ {order.subtotal} • Shipping: ৳ {order.shippingCost}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
