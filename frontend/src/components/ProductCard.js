import React from 'react';

export default function ProductCard({ product, addToCart, setView, setSelectedProduct }) {
  const getCategoryColor = (category) => {
    if (!category) return '#6c757d';
    const cat = category.toLowerCase();
    if (cat.includes('gpu')) return '#060642';
    if (cat.includes('ram')) return '#0c5c53';
    if (cat.includes('keyboard') || cat.includes('mouse')) return '#a12323';
    if (cat.includes('monitor')) return '#45e26f';
    if (cat.includes('headset') || cat.includes('audio')) return '#49128c';
    if (cat.includes('storage')) return '#127382';
    return '#343a40';
  };

  const categoryColor = getCategoryColor(product.category);
  const isOutOfStock = product.stock === 0 || !product.stock;


  const handleCardClick = () => {
    setSelectedProduct(product);
    setView('productDetail');
  };

  
  const handleAddToCart = (e) => {
    e.stopPropagation(); 
    addToCart(product);
  };

  return (
    <div 
      className="pro-card" 
      onClick={handleCardClick} 
      style={{ display: 'flex', flexDirection: 'column', padding: '15px', height: '100%', position: 'relative', cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <span style={{ position: 'absolute', top: '25px', right: '25px', backgroundColor: categoryColor, color: '#fff', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
        {product.category || 'Hardware'}
      </span>

      <img src={product.imageUrl || 'https://via.placeholder.com/200'} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />
      <h3 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{product.name}</h3>
      <p style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 'bold', color: isOutOfStock ? '#dc3545' : '#28a745' }}>
        {isOutOfStock ? '🔴' : '🟢'} {isOutOfStock ? 'Out of Stock' : `In Stock: ${product.stock}`}
      </p>
      <p style={{ margin: '0 0 15px 0', color: '#007AFF', fontWeight: 'bold', fontSize: '20px' }}>
        {product.price?.toLocaleString()} $
      </p>
      
      <div style={{ marginTop: 'auto' }}>
        {!isOutOfStock ? (
          <button className="pro-btn" onClick={handleAddToCart}>Add to Cart</button>
        ) : (
          <button className="pro-btn" style={{ background: '#f8d7da', cursor: 'not-allowed', color: '#721c24' }} disabled>Out of Stock</button>
        )}
      </div>
    </div>
  );
}