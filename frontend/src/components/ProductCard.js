import React from 'react';

export default function ProductCard({ product, onAddToCart, setView, setSelectedProduct }) {
  const isOutOfStock = product.stock === 0 || !product.stock;

  return (
    <div 
      onClick={() => {
        setSelectedProduct(product);
        setView('productDetail');
      }}
      style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', cursor: 'pointer' }}
    >
      <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
        <img src={product.imageUrl} alt={product.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 5px 0' }}>{product.name}</h3>
      <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>{product.price} $</div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
        disabled={isOutOfStock}
        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: isOutOfStock ? '#ccc' : '#111', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
      >
        {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
      </button>
    </div>
  );
}