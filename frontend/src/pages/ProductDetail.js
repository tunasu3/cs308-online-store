import React, { useState } from 'react';

export default function ProductDetail({ product, addToCart, setView }) {
  const [review, setReview] = useState('');
  const [reviews, setReviews] = useState(product.reviews || []);
  const isOutOfStock = product.stock === 0;

  const handleAddReview = (e) => {
    e.preventDefault();
    if(review.trim() !== '') {
      setReviews([...reviews, { text: review, approved: true, user: 'User' }]);
      setReview('');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '15px' }}>
      <button onClick={() => setView('shop')} style={{ marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#3b82f6' }}>← Go Back</button>
      
      <div style={{ display: 'flex', gap: '30px' }}>
        <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.name} style={{ width: '400px', height: '400px', objectFit: 'cover', borderRadius: '10px' }} />
        
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '28px', marginBottom: '10px' }}>{product.name}</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '20px' }}>${product.price}</p>
          <p style={{ color: '#666', lineHeight: '1.6' }}>{product.description}</p>
          
          <div style={{ marginTop: '30px' }}>
            <button 
              onClick={() => addToCart(product)} 
              disabled={isOutOfStock}
              style={{ width: '100%', padding: '15px', backgroundColor: isOutOfStock ? '#ccc' : '#111', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: isOutOfStock ? 'not-allowed' : 'pointer' }}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          <div style={{ marginTop: '45px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '15px' }}>Specifications</h4>
            <ul style={{ paddingLeft: '20px', color: '#4b5563', fontSize: '15px', lineHeight: '1.8' }}>
              <li><strong>Warranty:</strong> {product.warranty || '2 Years'}</li>
              <li><strong>Distributor:</strong> {product.distributor || 'Official Distributor'}</li>
              <li><strong>Availability:</strong> {isOutOfStock ? 'Sold Out' : `${product.stock} in stock`}</li>
            </ul>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '30px' }}>
        <h3>Product Reviews</h3>
        <form onSubmit={handleAddReview} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input type="text" placeholder="Write a review..." value={review} onChange={e => setReview(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }} />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px' }}>Submit</button>
        </form>
        {reviews.map((r, idx) => (
          <div key={idx} style={{ padding: '15px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '8px' }}>
            <strong>{r.user}</strong>: {r.text}
          </div>
        ))}
      </div>
    </div>
  );
}