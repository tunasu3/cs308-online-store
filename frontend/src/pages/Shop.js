import React, { useState } from 'react';

export default function Shop({ products, categories, searchTerm, addToCart, setView, setSelectedProduct }) {
  const [sortBy, setSortBy] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  // Kategori Seçimi İşleyicisi
  const handleCategoryChange = (categoryName) => {
    setSelectedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName) 
        : [...prev, categoryName]
    );
  };

  // 1. FİLTRELEME İŞLEMİ (Arama + Kategori + Stok + Fiyat)
  const filteredProducts = products.filter(p => {
    // Arama
    const term = searchTerm?.toLowerCase() || '';
    const matchName = p.name.toLowerCase().includes(term);
    const matchDesc = p.description ? p.description.toLowerCase().includes(term) : false;
    const matchesSearch = matchName || matchDesc;

    // Kategori
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(p.category);

    // Stok
    const matchesStock = inStockOnly ? p.stock > 0 : true;

    // Fiyat
    const min = priceRange.min === '' ? 0 : Number(priceRange.min);
    const max = priceRange.max === '' ? Infinity : Number(priceRange.max);
    const matchesPrice = p.price >= min && p.price <= max;

    return matchesSearch && matchesCategory && matchesStock && matchesPrice;
  });

  // 2. SIRALAMA İŞLEMİ (Sorting)
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'priceHigh') return b.price - a.price;
    if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0); 
    return 0; 
  });

  return (
    <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
      
      {/* SOL SIDEBAR - FİLTRELER */}
      <aside style={{ width: '260px', flexShrink: 0, backgroundColor: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: 'fit-content' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '10px' }}>Filters</h3>
        
        {/* Kategoriler */}
        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ fontSize: '14px', color: '#4b5563', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Categories</h4>
          {categories.map(cat => (
            <label key={cat._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer', fontSize: '15px', color: '#374151' }}>
              <input 
                type="checkbox" 
                checked={selectedCategories.includes(cat.name)}
                onChange={() => handleCategoryChange(cat.name)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0f172a' }}
              />
              {cat.name}
            </label>
          ))}
        </div>

        {/* Sadece Stokta Olanlar */}
        <div style={{ marginBottom: '25px' }}>
           <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: '15px', color: '#374151', fontWeight: '500' }}>
            In Stock Only
            <input 
              type="checkbox" 
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#059669' }}
            />
          </label>
        </div>

        {/* Fiyat Aralığı */}
        <div>
          <h4 style={{ fontSize: '14px', color: '#4b5563', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price Range</h4>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="number" 
              placeholder="Min $" 
              value={priceRange.min}
              onChange={(e) => setPriceRange({...priceRange, min: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', outline: 'none' }}
            />
            <span style={{ color: '#9ca3af' }}>-</span>
            <input 
              type="number" 
              placeholder="Max $" 
              value={priceRange.max}
              onChange={(e) => setPriceRange({...priceRange, max: e.target.value})}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', outline: 'none' }}
            />
          </div>
        </div>
      </aside>

      {/* SAĞ TARAF - ÜRÜNLER VE SIRALAMA */}
      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '15px 20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <span style={{ color: '#6b7280', fontSize: '15px' }}>Showing <strong>{sortedProducts.length}</strong> products</span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#4b5563' }}>Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', outline: 'none', backgroundColor: '#f9fafb', color: '#111827', cursor: 'pointer', fontWeight: '500' }}
            >
              <option value="">Featured</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="popularity">Top Rated</option>
            </select>
          </div>
        </div>

        {/* ÜRÜN GRID YAPISI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {sortedProducts.map(product => (
            <div key={product._id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', position: 'relative', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              
              {/* Resim */}
              <div onClick={() => { setSelectedProduct(product); setView('productDetail'); }} style={{ position: 'relative' }}>
                <img src={product.imageUrl || 'https://via.placeholder.com/200'} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'contain', marginBottom: '15px' }} />
                {product.stock === 0 && (
                  <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>SOLD OUT</span>
                )}
              </div>

              {/* Bilgiler */}
              <div style={{ flexGrow: 1 }} onClick={() => { setSelectedProduct(product); setView('productDetail'); }}>
                {/* Yıldızlar (Placeholder) */}
                <div style={{ color: '#fbbf24', fontSize: '14px', marginBottom: '6px', display: 'flex', gap: '2px' }}>
                  ★ ★ ★ ★ ☆ <span style={{ color: '#9ca3af', fontSize: '12px', marginLeft: '4px' }}>(12)</span>
                </div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#111827', fontWeight: '500', lineHeight: '1.4' }}>{product.name}</h3>
              </div>

              {/* Fiyat ve Buton */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <span style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>${product.price}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }} 
                  disabled={product.stock === 0}
                  style={{ padding: '8px 16px', backgroundColor: product.stock === 0 ? '#f3f4f6' : '#0f172a', color: product.stock === 0 ? '#9ca3af' : '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: product.stock === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
                >
                  {product.stock === 0 ? 'Out' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {sortedProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '50px', color: '#6b7280', backgroundColor: '#fff', borderRadius: '12px' }}>
            <svg style={{ margin: '0 auto 15px auto', display: 'block' }} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <p>No products found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}