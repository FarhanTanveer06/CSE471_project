import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Shirts', path: '/products/category/shirts', img: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&w=600&h=360&fit=crop' },
  { name: 'Pants', path: '/products/category/pants', img: 'https://images.pexels.com/photos/5322211/pexels-photo-5322211.jpeg?auto=compress&w=600&h=360&fit=crop' },
  { name: 'Blazers', path: '/products/category/blazers', img: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&w=600&h=360&fit=crop' },
];

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://media.glamour.com/photos/68cc39f779746685f58c84e2/16:9/w_2034,h_1144,c_limit/photo_3_3000.jpg?auto=compress&w=1920&h=800&fit=crop',
      title: 'Men\'s Clothing Classics',
      subtitle: 'Shop premium shirts, pants, and blazers. Dress smart, look sharp, stand out.',
      buttonText: 'Shop Now',
      buttonLink: '/products'
    },
    {
      image: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg?auto=compress&w=1920&h=800&fit=crop',
      title: 'Premium Quality',
      subtitle: 'Discover our curated collection of premium men\'s fashion',
      buttonText: 'Explore Collection',
      buttonLink: '/products'
    },
    {
      image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&w=1920&h=800&fit=crop',
      title: 'Style That Matters',
      subtitle: 'Elevate your wardrobe with our sophisticated designs',
      buttonText: 'Shop Now',
      buttonLink: '/products'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <>
      {/* Image Slideshow Section */}
      <section className="hero-slideshow mb-5">
        <div className="slideshow-container">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="slide-overlay">
                <div className="container">
                  <div className="slide-content">
                    <h1>{slide.title}</h1>
                    <p>{slide.subtitle}</p>
                    <Link to={slide.buttonLink} className="premium-btn premium-btn-primary">
                      {slide.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Navigation Arrows */}
          <button className="slideshow-nav slideshow-prev" onClick={goToPrevious} aria-label="Previous slide">
            &#8249;
          </button>
          <button className="slideshow-nav slideshow-next" onClick={goToNext} aria-label="Next slide">
            &#8250;
          </button>

          {/* Slide Indicators */}
          <div className="slideshow-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
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
                <h5 className="mb-3" style={{fontWeight: 600}}>{cat.name}</h5>
                <Link to={cat.path} className="premium-btn premium-btn-secondary w-100 text-center text-decoration-none">Explore {cat.name}</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  </>
  );
};

export default Home;
