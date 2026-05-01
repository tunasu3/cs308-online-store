import React from 'react';

export default function ProductCard({ product, onAddToCart, setView, setSelectedProduct, user }) {
  const isOutOfStock = product.stock === 0 || !product.stock;
  

  const rating = product.rating || 0;
  const fullStars = Math.round(rating);

  const addToWishlist = async (productId) => {
  if (!user) {
    alert("Please login first");
    return;
  }

  try {
    await fetch(`http://localhost:8000/api/wishlist/${user._id}/${productId}`, {
      method: "POST"
    });

    alert("Added to wishlist");
  } catch (err) {
    console.error(err);
  }
};

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
      
      {/* */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '5px' }}>
        <span style={{ color: '#FFD700', fontSize: '14px', letterSpacing: '2px' }}>
          {'★'.repeat(fullStars)}
          <span style={{ color: '#e0e0e0' }}>{'★'.repeat(5 - fullStars)}</span>
        </span>
        <span style={{ fontSize: '13px', color: '#888', fontWeight: '500' }}>
          ({rating > 0 ? rating.toFixed(1) : '0'})
        </span>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 5px 0' }}>{product.name}</h3>
      <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '15px' }}>{product.price} $</div>
      <button
      onClick={(e) => {
        e.stopPropagation(); // prevents opening product page
        addToWishlist(product._id);
      }}
      style={{
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
        backgroundColor: '#fff',
        cursor: 'pointer',
        fontWeight: '600'
        }}
        >
          ❤️ Add to Wishlist
          </button>
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