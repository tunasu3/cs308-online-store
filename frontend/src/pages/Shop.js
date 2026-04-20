import React from 'react';
import ProductCard from '../components/ProductCard'; 

export default function Shop({ products, searchTerm, addToCart }) {
  
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Our Products</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              addToCart={addToCart} 
            />
          ))
        ) : (
          <p style={{ color: '#666' }}>No products found matching your search.</p>
        )}
      </div>
    </div>
  );
}