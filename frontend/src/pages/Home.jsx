import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Shirts', path: '/products/category/shirts', img: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&w=600&h=360&fit=crop' },
  { name: 'Pants', path: '/products/category/pants', img: 'https://images.pexels.com/photos/5322211/pexels-photo-5322211.jpeg?auto=compress&w=600&h=360&fit=crop' },
  { name: 'Blazers', path: '/products/category/blazers', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&w=600&h=360&fit=crop' },
];

const Home = () => (
  <>
    <header className="premium-hero mb-5">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 mb-4 mb-md-0">
            <h1>Men's Clothing Classics</h1>
            <p>Shop premium shirts, pants, and blazers. Dress smart, look sharp, stand out.</p>
            <Link to="/products/category/shirts" className="premium-btn premium-btn-primary">Shop Now</Link>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end justify-content-center">
            <img 
              src="https://images.pexels.com/photos/5322201/pexels-photo-5322201.jpeg?auto=compress&w=600&h=480&fit=crop" 
              alt="Men's clothing hero" 
              className="img-fluid rounded" 
              style={{
                maxHeight: 400,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                borderRadius: 'var(--radius)'
              }}
            />
          </div>
        </div>
      </div>
    </header>
    <section className="container mb-5">
      <div className="premium-section-header">
        <h2>Shop By Category</h2>
        <p>Discover our curated collection of premium men's clothing</p>
      </div>
      <div className="row justify-content-center g-4">
        {categories.map((cat) => (
          <div className="col-md-4" key={cat.name}>
            <div className="premium-product-card">
              <img 
                src={cat.img} 
                alt={cat.name} 
                style={{
                  height: 280, 
                  objectFit: 'cover',
                  width: '100%'
                }}
              />
              <div className="card-body d-flex flex-column align-items-center">
                <h5 className="mb-3" style={{fontWeight: 'var(--font-weight-semibold)'}}>{cat.name}</h5>
                <Link to={cat.path} className="premium-btn premium-btn-secondary w-100 text-center text-decoration-none">Explore {cat.name}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </>
);

export default Home;
