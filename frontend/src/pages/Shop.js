import React from 'react';
import { styles } from '../styles/theme';

function Shop({ products, searchTerm, addToCart, openComments }) {
  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div style={styles.grid}>
      {filtered.map(p => (
        <div key={p._id} style={styles.card}>
          {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ width:'100%', height:'180px', objectFit:'cover', borderRadius:'10px' }} />}
          <h4>{p.name}</h4>
          <p style={{color:'#007AFF', fontWeight:'bold'}}>{p.price?.toLocaleString()} TL</p>
          <p style={{fontSize:'12px', color: p.stock > 0 ? 'green' : 'red'}}>
            {p.stock > 0 ? `In Stock: ${p.stock}` : 'Out of Stock'}
          </p>
          <button 
            style={{...styles.addBtn, opacity: p.stock === 0 ? 0.4 : 1}} 
            onClick={() => addToCart(p)} 
            disabled={p.stock === 0}
          >
            {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button 
            style={{...styles.addBtn, background:'#f0f0f0', color:'#333', marginTop:'5px'}} 
            onClick={() => openComments(p)}
          >
            💬 Reviews
          </button>
        </div>
      ))}
    </div>
  );
}

export default Shop;