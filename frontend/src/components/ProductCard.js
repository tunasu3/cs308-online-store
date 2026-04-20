import React from 'react';

export default function ProductCard({ product, addToCart }) {
  return (
    <div className="pro-card" style={{ display: 'flex', flexDirection: 'column', padding: '15px', height: '100%' }}>
      <img 
        src={product.imageUrl || 'https://via.placeholder.com/200'} 
        alt={product.name} 
        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} 
      />
      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{product.name}</h3>
      <p style={{ margin: '0 0 15px 0', color: '#007AFF', fontWeight: 'bold', fontSize: '20px' }}>
        {product.price?.toLocaleString()} $
      </p>
      
      <div style={{ marginTop: 'auto' }}>
        {product.stock > 0 ? (
          <button className="pro-btn" onClick={() => addToCart(product)}>Add to Cart</button>
        ) : (
          <button className="pro-btn" style={{ background: '#ccc', cursor: 'not-allowed' }} disabled>Out of Stock</button>
        )}
      </div>
    </div>
  );
}