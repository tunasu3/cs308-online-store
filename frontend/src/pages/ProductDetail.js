import React from 'react';

export default function ProductDetail({ product, addToCart, setView }) {
  if (!product) return null;

  const isOutOfStock = product.stock === 0 || !product.stock;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <button 
        onClick={() => setView('shop')} 
        style={{ marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#007bff', fontSize: '16px', fontWeight: 'bold' }}
      >
        ← Back to Store
      </button>
      
      <div className="pro-card" style={{ display: 'flex', gap: '40px', padding: '30px', flexWrap: 'wrap' }}>
        <img 
          src={product.imageUrl || 'https://via.placeholder.com/400'} 
          alt={product.name} 
          style={{ width: '100%', maxWidth: '400px', height: '400px', objectFit: 'cover', borderRadius: '12px' }} 
        />
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: '300px' }}>
          <h2 style={{ fontSize: '28px', marginTop: 0 }}>{product.name}</h2>
          <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.6' }}>
            {product.description || 'No detailed description available for this hardware component.'}
          </p>
          
          {/*  */}
          <div style={{ margin: '20px 0', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
            <p style={{ margin: '5px 0' }}><strong>Category:</strong> {product.category || 'PC Hardware'}</p>
            <p style={{ margin: '5px 0' }}><strong>Model:</strong> {product.model || 'Standard Edition'}</p>
            <p style={{ margin: '5px 0' }}><strong>Serial Number:</strong> {product.serialNumber || `SN-${Math.floor(Math.random() * 1000000)}`}</p>
          </div>

          <p style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 'bold', color: isOutOfStock ? '#dc3545' : '#28a745' }}>
            {isOutOfStock ? '🔴 Out of Stock' : `🟢 In Stock: ${product.stock}`}
          </p>

          <p style={{ color: '#007AFF', fontWeight: 'bold', fontSize: '32px', margin: '10px 0 20px 0' }}>
            {product.price?.toLocaleString()} $
          </p>
          
          <div style={{ marginTop: 'auto' }}>
            {!isOutOfStock ? (
              <button className="pro-btn" style={{ width: '100%', padding: '15px', fontSize: '18px' }} onClick={() => addToCart(product)}>
                Add to Cart
              </button>
            ) : (
              <button className="pro-btn" style={{ width: '100%', padding: '15px', fontSize: '18px', background: '#f8d7da', cursor: 'not-allowed', color: '#721c24', border: '1px solid #f5c6cb' }} disabled>
                Out of Stock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}