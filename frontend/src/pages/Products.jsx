import React from 'react';
import { useParams, Link } from 'react-router-dom';

// Placeholder data (replace with API fetch)
const placeholderProducts = [
  { name: 'Classic Oxford Shirt', price: 50, category: 'shirts', imageUrl: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&w=400&h=300&fit=crop', description: 'Premium, versatile oxford shirt.', badge: 'New' },
  { name: 'Tailored Pants', price: 65, category: 'pants', imageUrl: 'https://images.pexels.com/photos/5322211/pexels-photo-5322211.jpeg?auto=compress&w=400&h=300&fit=crop', description: 'Tailored for comfort and style.', badge: 'Sale' },
  { name: 'Slim Fit Blazer', price: 120, category: 'blazers', imageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&w=400&h=300&fit=crop', description: 'A modern slim-fit blazer.', badge: null },
];

const Products = () => {
  const { category } = useParams();
  const products = category ? placeholderProducts.filter(p => p.category === category) : placeholderProducts;

  return (
    <div className="container py-4">
      <div className="mb-4 p-4 bg-light rounded-3 shadow-sm text-center">
        <h2 className="fw-bold display-5 text-capitalize mb-2">
          {category ? `${category}` : 'All Products'}
        </h2>
        <span className="text-secondary">Discover the latest in men&apos;s fashion</span>
      </div>
      <div className="row g-4">
        {products.map((prod, idx) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={idx}>
            <Link to={`/products/${idx}`} className="text-decoration-none text-reset">
              <div className="card h-100 shadow border-0 product-card-hover">
                <div className="position-relative">
                  <img src={prod.imageUrl} className="card-img-top" alt={prod.name} style={{height: 220, objectFit: 'cover'}} />
                  {prod.badge && <span className={`badge position-absolute top-0 start-0 m-2 ${prod.badge === 'Sale' ? 'bg-danger' : 'bg-success'}`}>{prod.badge}</span>}
                </div>
                <div className="card-body">
                  <h5 className="card-title mb-2">{prod.name}</h5>
                  <div className="text-primary fw-bold mb-2">${prod.price}</div>
                  <span className="badge bg-secondary mb-3">{prod.category}</span>
                  <p className="card-text small text-muted">{prod.description}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
