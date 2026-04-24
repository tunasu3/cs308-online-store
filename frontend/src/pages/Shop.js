import React, { useState } from 'react';

const Stars = ({ value }) => {
  const numValue = Number(value) || 0;
  const full = Math.floor(numValue);
  const half = numValue % 1 >= 0.5;

  return (
    <div style={{ display: 'flex', gap: '2px', fontSize: '14px' }}>
      {[...Array(5)].map((_, i) => {
        if (i < full) return <span key={i} style={{ color: '#fbbf24' }}>★</span>;
        if (i === full && half) return <span key={i} style={{ color: '#fbbf24' }}>☆</span>;
        return <span key={i} style={{ color: '#e5e7eb' }}>★</span>;
      })}
    </div>
  );
};

export default function Shop({ products, searchTerm, addToCart, setView, setSelectedProduct }) {
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
        width: '260px',
        position: 'sticky',
        top: '20px',
        background: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>

        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>Filters</h3>

        <div style={{ marginBottom: '24px' }}>
          <div onClick={() => toggle('category')} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>CATEGORIES</span>
            <span style={{ color: '#6b7280' }}>{open.category ? '-' : '+'}</span>
          </div>

          {open.category && derivedCategories.map(cat => (
            <label key={cat} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', cursor: 'pointer', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                  style={{ width: '16px', height: '16px', accentColor: '#111827', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>{cat}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                ({getCategoryCount(cat)})
              </span>
            </label>
          ))}
        </div>

        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #f3f4f6' }}>
          <div onClick={() => toggle('stock')} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STOCK</span>
            <span style={{ color: '#6b7280' }}>{open.stock ? '-' : '+'}</span>
          </div>

          {open.stock && (
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#374151', cursor: 'pointer', alignItems: 'center' }}>
              In Stock Only
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#111827', cursor: 'pointer' }}
              />
            </label>
          )}
        </div>

        <div>
          <div onClick={() => toggle('price')} style={{ display: 'flex', justifyContent: 'space-between', cursor: 'pointer', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRICE RANGE</span>
            <span style={{ color: '#6b7280' }}>{open.price ? '-' : '+'}</span>
          </div>

          {open.price && (
            <>
              <input
                type="range"
                min="0"
                max="50000"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#111827', cursor: 'pointer' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginTop: '12px', color: '#4b5563' }}>
                <div style={{ border: '1px solid #e5e7eb', padding: '6px 12px', borderRadius: '6px' }}>Min $0</div>
                <div style={{ border: '1px solid #e5e7eb', padding: '6px 12px', borderRadius: '6px' }}>Max ${priceRange.max}</div>
              </div>
            </>
          )}
        </div>

      </aside>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', backgroundColor: '#ffffff', padding: '16px 24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <span style={{ color: '#4b5563', fontSize: '14px' }}>Showing <strong>{sortedProducts.length}</strong> products</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', color: '#6b7280' }}>Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', outline: 'none', cursor: 'pointer', backgroundColor: '#fff', color: '#111827', fontSize: '14px' }}>
              <option value="">Featured</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="popularity">Top Rated</option>
            </select>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '24px'
        }}>
          {sortedProducts.map(product => (
            <div
              key={product._id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                opacity: product.stock === 0 ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (product.stock !== 0) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (product.stock !== 0) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                }
              }}
            >
              <div
                onClick={() => { setSelectedProduct(product); setView('productDetail'); }}
                style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}
              >
                <img
                  src={product.image || product.imageUrl || 'https://via.placeholder.com/200'}
                  alt={product.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    filter: product.stock === 0 ? 'grayscale(100%)' : 'none'
                  }}
                />

                {product.stock === 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    background: '#ef4444',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    SOLD OUT
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Stars value={product.rating || product.averageRating || product.ratings || 0} />
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                  ({product.reviewCount || product.numReviews || product.reviews?.length || 0})
                </span>
              </div>

              <h4 
                style={{ color: '#111827', fontSize: '15px', fontWeight: '500', marginBottom: '20px', lineHeight: '1.4' }} 
                onClick={() => { setSelectedProduct(product); setView('productDetail'); }}
              >
                {product.name}
              </h4>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <span style={{ color: '#111827', fontWeight: '700', fontSize: '20px' }}>
                  ${product.price}
                </span>

                <button
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  disabled={product.stock === 0}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: product.stock === 0 ? '#f3f4f6' : '#111827',
                    color: product.stock === 0 ? '#9ca3af' : '#ffffff',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s'
                  }}
                >
                  {product.stock === 0 ? 'Out' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {sortedProducts.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '60px', color: '#6b7280', fontSize: '16px', backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            No products found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}