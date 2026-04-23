import React, { useState } from 'react';

export default function Shop({ products, categories, searchTerm, addToCart, setView, setSelectedProduct }) {
  const [sortBy, setSortBy] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });

  const [open, setOpen] = useState({
    category: true,
    stock: true,
    price: true
  });

  const toggle = (k) => setOpen(prev => ({ ...prev, [k]: !prev[k] }));

  const handleCategoryChange = (categoryName) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const derivedCategories = [...new Set(products.map(p => p.category))];

  const getCategoryCount = (cat) => {
    return products.filter(p => p.category === cat).length;
  };

  const filteredProducts = products.filter(p => {
    const term = searchTerm?.toLowerCase() || '';
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      (p.description || '').toLowerCase().includes(term);

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(p.category);

    const matchesStock = inStockOnly ? p.stock > 0 : true;

    const matchesPrice =
      p.price >= priceRange.min && p.price <= priceRange.max;

    return matchesSearch && matchesCategory && matchesStock && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'priceHigh') return b.price - a.price;
    if (sortBy === 'popularity') return (b.popularity || 0) - (a.popularity || 0);
    return 0;
  });

  return (
    <div style={{ display: 'flex', gap: '30px', marginTop: '20px', alignItems: 'flex-start' }}>

      <aside style={{
        width: '290px',
        position: 'sticky',
        top: '20px',
        background: '#fff',
        borderRadius: '18px',
        padding: '20px',
        boxShadow: '0 12px 35px rgba(0,0,0,0.06)'
      }}>

        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Filters</h3>

        <div style={{ marginBottom: '25px' }}>
          <div onClick={() => toggle('category')} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '1px' }}>CATEGORIES</span>
            <span>{open.category ? '-' : '+'}</span>
          </div>

          {open.category && derivedCategories.map(cat => (
            <label key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                  style={{ width: '16px', height: '16px', accentColor: '#111827' }}
                />
                <span>{cat}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                ({getCategoryCount(cat)})
              </span>
            </label>
          ))}
        </div>

        <div style={{ marginBottom: '25px' }}>
          <div onClick={() => toggle('stock')} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '1px' }}>STOCK</span>
            <span>{open.stock ? '-' : '+'}</span>
          </div>

          {open.stock && (
            <label style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
              In Stock Only
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
            </label>
          )}
        </div>

        <div>
          <div onClick={() => toggle('price')} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: '#9ca3af', letterSpacing: '1px' }}>PRICE</span>
            <span>{open.price ? '-' : '+'}</span>
          </div>

          {open.price && (
            <>
              <input
                type="range"
                min="0"
                max="50000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                style={{ width: '100%' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '8px' }}>
                <span>${priceRange.min}</span>
                <span>${priceRange.max}</span>
              </div>
            </>
          )}
        </div>

      </aside>

      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
          background: '#fff',
          padding: '15px 20px',
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0,0,0,0.04)'
        }}>
          <span>Showing {sortedProducts.length} products</span>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="">Featured</option>
            <option value="priceLow">Low → High</option>
            <option value="priceHigh">High → Low</option>
            <option value="popularity">Top Rated</option>
          </select>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))',
          gap: '24px'
        }}>
          {sortedProducts.map(product => (
            <div
              key={product._id}
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                transition: '0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-6px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div onClick={() => { setSelectedProduct(product); setView('productDetail'); }}>
                <img src={product.imageUrl} alt="" style={{ width: '100%', height: '200px', objectFit: 'contain' }} />
              </div>

              <h4 style={{ fontSize: '15px', margin: '10px 0' }}>{product.name}</h4>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: '700' }}>${product.price}</span>
                <button onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            No products found
          </div>
        )}
      </div>
    </div>
  );
}