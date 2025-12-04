import React from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Shirts', path: '/products/category/shirts', img: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&w=600&h=360&fit=crop' },
  { name: 'Pants', path: '/products/category/pants', img: 'https://images.pexels.com/photos/5322211/pexels-photo-5322211.jpeg?auto=compress&w=600&h=360&fit=crop' },
  { name: 'Blazers', path: '/products/category/blazers', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&w=600&h=360&fit=crop' },
];

const Home = () => (
  <>
    <header className="bg-dark text-light py-5 mb-4">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-md-6 mb-3 mb-md-0">
            <h1 className="display-4 fw-bold mb-4">Men's Clothing Classics</h1>
            <p className="lead mb-4">Shop premium shirts, pants, and blazers. Dress smart, look sharp, stand out.</p>
            <Link to="/products/category/shirts" className="btn btn-lg btn-primary fw-bold">Shop Now</Link>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end justify-content-center">
            <img src="https://images.pexels.com/photos/5322201/pexels-photo-5322201.jpeg?auto=compress&w=600&h=480&fit=crop" alt="Men's clothing hero" className="img-fluid rounded shadow-lg" style={{maxHeight: 320}}/>
          </div>
        </div>
      </div>
    </header>
    <section className="container mb-5">
      <h2 className="mb-4 text-center">Shop By Category</h2>
      <div className="row justify-content-center">
        {categories.map((cat) => (
          <div className="col-md-4 mb-4" key={cat.name}>
            <div className="card h-100 border-0 shadow-sm">
              <img src={cat.img} alt={cat.name} className="card-img-top" style={{height: 220, objectFit: 'cover'}}/>
              <div className="card-body d-flex flex-column align-items-center">
                <h5 className="mb-3">{cat.name}</h5>
                <Link to={cat.path} className="btn btn-outline-primary w-100">Explore {cat.name}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </>
);

export default Home;
