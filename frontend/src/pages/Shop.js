import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';

export default function Shop({ products, searchTerm, addToCart, setView, setSelectedProduct }) {
  
  const [sortOption, setSortOption] = useState('');

  const filteredProducts = products.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchName = p.name?.toLowerCase().includes(term);
    const matchDesc = p.description?.toLowerCase().includes(term); // Açıklamada da arıyoruz
    return matchName || matchDesc;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'price-asc') {
      return a.price - b.price; 
    } else if (sortOption === 'price-desc') {
      return b.price - a.price;
    } else if (sortOption === 'popularity') {
      return (b.popularity || 0) - (a.popularity || 0); 
    }
    return 0; 
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Our Products</h2>
        
        <select 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)}
          style={{ 
            padding: '10px 15px', 
            borderRadius: '8px', 
            border: '1px solid #ddd', 
            outline: 'none',
            backgroundColor: '#fff',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <option value="">Sort By: Default</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px' 
      }}>
        {sortedProducts.length > 0 ? (
          sortedProducts.map(product => (
            <ProductCard 
              key={product._id} 
              product={product} 
              addToCart={addToCart} 
              setView={setView} 
              setSelectedProduct={setSelectedProduct} 
            />
          ))
        ) : (
          <p style={{ color: '#666' }}>No products found matching your search.</p>
        )}
      </div>
    </div>
  );
}