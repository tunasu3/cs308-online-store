import React, { useState, useEffect } from 'react';

export default function ProductDetail({ product, addToCart, setView, user }) {
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const isOutOfStock = product.stock === 0;

  
  const productRating = product.rating || 0;

  useEffect(() => {
    fetch(`http://localhost:8000/api/comments/product/${product._id}`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(err => console.error(err));

    if (user) {
      fetch(`http://localhost:8000/api/comments/has-purchased/${user._id}/${product._id}`)
        .then(res => res.json())
        .then(data => setHasPurchased(data.hasPurchased))
        .catch(err => console.error(err));
    }
  }, [product._id, user]);

  const handleAddReview = async (e) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      alert('Please select a star rating (1-5 stars).');
      return;
    }
    
    if (review.trim() === '') {
      alert('Please write a review before submitting.');
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          userId: user._id,
          userName: user.fullName || user.email || 'User',
          rating,
          comment: review
        })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Could not submit review.');
        return;
      }

      alert('Review submitted! It will appear after approval.');
      setReview('');
      setRating(0);
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '30px', borderRadius: '15px' }}>
      <button onClick={() => setView('shop')} style={{ marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#3b82f6' }}>← Go Back</button>
      
      <div style={{ display: 'flex', gap: '30px' }}>
        <img src={product.imageUrl || 'https://via.placeholder.com/400'} alt={product.name} style={{ width: '400px', height: '400px', objectFit: 'cover', borderRadius: '10px' }} />
        
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '28px', marginBottom: '5px' }}>{product.name}</h2>
          
          {/* */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '8px' }}>
            <span style={{ color: '#fbbf24', fontSize: '18px' }}>
              {'★'.repeat(Math.round(productRating))}
              <span style={{ color: '#d1d5db' }}>{'★'.repeat(5 - Math.round(productRating))}</span>
            </span>
            <span style={{ fontSize: '16px', color: '#666', fontWeight: '600' }}>
              ({productRating > 0 ? productRating.toFixed(1) : '0'})
            </span>
          </div>

          <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', marginBottom: '20px' }}>${product.price}</p>
          <p style={{ color: '#666', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{product.description}</p>
          
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

        {!user && (
          <div style={{ padding: '15px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '20px', color: '#92400e' }}>
            🔒 Please sign in to leave a review.
          </div>
        )}

        {user && !hasPurchased && (
          <div style={{ padding: '15px', backgroundColor: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', marginBottom: '20px', color: '#991b1b' }}>
            ⚠️ You can only review this product once it has been delivered to you.
          </div>
        )}

        {user && hasPurchased && (
          <form onSubmit={handleAddReview} style={{ marginBottom: '20px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Your Rating:</label>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      fontSize: '32px',
                      cursor: 'pointer',
                      color: (hoverRating || rating) >= star ? '#fbbf24' : '#d1d5db',
                      transition: 'color 0.15s'
                    }}
                  >
                    ★
                  </span>
                ))}
                <span style={{ marginLeft: '10px', alignSelf: 'center', color: '#666' }}>
                  {rating > 0 ? `${rating} / 5` : 'Select a rating'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Write your review..."
                value={review}
                onChange={e => setReview(e.target.value)}
                style={{ flex: 1, padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
              />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                Submit
              </button>
            </div>
          </form>
        )}

        {reviews.length === 0 ? (
          <p style={{ color: '#666' }}>No reviews yet. Be the first!</p>
        ) : (
          reviews.map((r, idx) => (
            <div key={idx} style={{ padding: '15px', backgroundColor: '#f8f9fa', marginBottom: '10px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong>{r.userName}</strong>
                <span style={{ color: '#fbbf24', fontSize: '16px' }}>
                  {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                </span>
              </div>
              <div style={{ color: '#444' }}>{r.comment}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}