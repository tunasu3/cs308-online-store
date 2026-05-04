import React, { useState, useEffect } from 'react';

const formatPrice = (num) => {
  const value = Number(num);

  return value % 1 === 0
    ? value.toLocaleString()
    : value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
};

const Stars = ({ value }) => {
  const numValue = Number(value) || 0;
  const full = Math.floor(numValue);
  const half = numValue % 1 >= 0.5;

  return (
    <div style={{ display: 'flex', gap: '2px', fontSize: '14px' }}>
      {[...Array(5)].map((_, i) => {
        if (i < full) return <span key={i} style={{ color: '#fbbf24' }}>★</span>;
        if (i === full && half) return <span key={i} style={{ color: '#fbbf24' }}>★</span>; 
        return <span key={i} style={{ color: '#e5e7eb' }}>★</span>;
      })}
    </div>
  );
};

export default function Shop({ products, searchTerm, addToCart, setView, setSelectedProduct, user }) {
  const [sortBy, setSortBy] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [wishlist, setWishlist] = useState([]);
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const res = await fetch(`http://localhost:8000/api/wishlist/${user._id}`);
        const data = await res.json();
        
        setWishlist(data.map(item => item._id));
      } catch (err) {
        console.error(err);
      }
    };
    
    fetchWishlist();
  }, [user]);

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

    const currentPrice = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
    const matchesPrice = currentPrice >= priceRange.min && currentPrice <= priceRange.max;

    return matchesSearch && matchesCategory && matchesStock && matchesPrice;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
    const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;

    if (sortBy === 'priceLow') return priceA - priceB;
    if (sortBy === 'priceHigh') return priceB - priceA;
    if (sortBy === 'popularity') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });
  const toggleWishlist = async (productId) => {
  if (!user) {
    alert("Please login first");
    return;
  }

  try {
    if (wishlist.includes(productId)) {
      // REMOVE
      await fetch(`http://localhost:8000/api/wishlist/${user._id}/${productId}`, {
        method: "DELETE"
      });

      setWishlist(prev => prev.filter(id => id !== productId));

    } else {
      // ADD
      await fetch(`http://localhost:8000/api/wishlist/${user._id}/${productId}`, {
        method: "POST"
      });

      setWishlist(prev => [...prev, productId]);
    }
  } catch (err) {
    console.error(err);
  }
};

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
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>({getCategoryCount(cat)})</span>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
          {sortedProducts.map(product => {
            const discount = Number(product.discount) || 0;
            
            const finalPrice = discount > 0
            ? product.price * (1 - discount / 100)
            : product.price;
            return (
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
                  style={{ position: 'relative', height: '180px', marginBottom: '20px' }}
                >
                  <img
                    src={product.image || product.imageUrl || 'https://via.placeholder.com/200'}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      filter: product.stock === 0 ? 'grayscale(100%)' : 'none'
                    }}
                  />
                  <div
  onClick={(e) => {
    e.stopPropagation();
    toggleWishlist(product._id);
  }}
  style={{
  position: 'absolute',
  top: '8px',
  right: '8px',
  background: 'rgba(255,255,255,0.85)',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  minWidth: '32px',
  minHeight: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  zIndex: 10
}}
>
  <svg
  width="18"
  height="18"
  viewBox="0 0 24 24"
  fill={wishlist.includes(product._id) ? '#ef4444' : 'none'}
  stroke={wishlist.includes(product._id) ? '#ef4444' : '#111827'}
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  style={{ display: 'block', transform: 'translateY(1px)' }}  // ✅ merged
>
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>
</div>
                  {product.stock === 0 && (
                    <span style={{ position: 'absolute', top: '0', right: '0', background: '#ef4444', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>SOLD OUT</span>
                  )}
                  {(Number(product.discount) || 0) > 0 && product.stock !== 0 && (
                    <span style={{ position: 'absolute', top: '0', left: '0', background: '#ef4444', color: '#ffffff', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' }}>%{product.discount} OFF</span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Stars value={product.rating || 0} />
                  <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '600' }}>
                    ({product.rating ? product.rating.toFixed(1) : '0'})
                  </span>
                </div>

                <h4 
                  style={{ color: '#111827', fontSize: '15px', fontWeight: '500', marginBottom: '20px', lineHeight: '1.4' }} 
                  onClick={() => { setSelectedProduct(product); setView('productDetail'); }}
                >
                  {product.name}
                </h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', gap: '10px'  }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {(Number(product.discount) || 0) > 0 ? (
                      <>
                        <span style={{ color: '#9ca3af', textDecoration: 'line-through', fontSize: '13px' }}> ${formatPrice(product.price)}</span>
                        <span style={{ color: '#111827', fontWeight: '700', fontSize: '18px' }}> ${formatPrice(finalPrice)}</span>
                      </>
                    ) : (
                     <span style={{ color: '#111827', fontWeight: '700', fontSize: '18px' }}> ${formatPrice(product.price)} </span>
                    )}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const discount = Number(product.discount) || 0;
                      const finalPrice = discount > 0
                      ? product.price * (1 - discount / 100)
                      : product.price;
                      
                      addToCart({
                        ...product,
                        finalPrice
                      });
                    }}
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
            );
          })}
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