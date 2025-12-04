import React from 'react';
import { useParams } from 'react-router-dom';

const sampleProduct = {
  name: 'Sample Blazer',
  price: 120,
  imageUrl: 'https://via.placeholder.com/300x200',
  description: 'Elegant blazer for formal occasions.',
  category: 'blazers'
};

const ProductDetails = () => {
  const { id } = useParams();
  // TODO: Fetch real data using id
  return (
    <div className="container py-5 d-flex justify-content-center">
      <div className="card shadow" style={{ maxWidth: 600 }}>
        <img src={sampleProduct.imageUrl} className="card-img-top" alt={sampleProduct.name} />
        <div className="card-body">
          <h2 className="card-title">{sampleProduct.name}</h2>
          <h4 className="text-success mb-2">${sampleProduct.price}</h4>
          <span className="badge bg-secondary mb-3">{sampleProduct.category}</span>
          <p className="card-text mb-0">{sampleProduct.description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
