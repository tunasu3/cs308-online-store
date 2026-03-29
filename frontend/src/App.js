import React, { useState } from 'react';

// --- SENİN DOSYA SİSTEMİNE GÖRE GÖRSELLERİ IMPORT EDİYORUZ ---
import asusImg from './assets/ASUS.png';
import corsairImg from './assets/corsair.png';
import headsetImg from './assets/headset.png';
import msicaseImg from './assets/msicase.png';
import rtxImg from './assets/rtx4070.png';
import ryzenImg from './assets/ryzen.png';
import samsungImg from './assets/samsung.png';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userRole, setUserRole] = useState('Customer');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Default');

  // Senin indirdiğin görsellerle eşleşen ürün listesi
  const products = [
    { id: 1, n: "ASUS ROG STRIX B650-A", p: 9400, cat: "MB", img: asusImg },
    { id: 2, n: "Corsair Vengeance RGB 32GB", p: 4899, cat: "RAM", img: corsairImg },
    { id: 3, n: "Logitech G Pro X 2 Lightspeed", p: 7800, cat: "Headset", img: headsetImg },
    { id: 4, n: "MSI MPG Gungnir 110R Case", p: 3950, cat: "Case", img: msicaseImg },
    { id: 5, n: "ASUS GeForce RTX 4070 Ti", p: 32499, cat: "GPU", img: rtxImg },
    { id: 6, n: "AMD Ryzen 7 7800X3D", p: 14200, cat: "CPU", img: ryzenImg },
    { id: 7, n: "Samsung 990 PRO 2TB SSD", p: 6100, cat: "Storage", img: samsungImg },
  ];

  let filtered = products.filter(p => 
    (selectedCategory === 'All' || p.cat === selectedCategory) &&
    p.n.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (sortBy === 'LowToHigh') filtered.sort((a, b) => a.p - b.p);
  if (sortBy === 'HighToLow') filtered.sort((a, b) => b.p - a.p);

  const addToCart = (product) => {
    if (userRole !== 'Customer') return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h1 style={styles.brandTitle}>CS308 <span style={{color: '#00d4ff'}}>GAMING</span></h1>
          <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} style={styles.form}>
            {isRegistering && <input type="text" placeholder="Full Name" style={styles.darkInput} required />}
            <input type="email" required placeholder="Email Address" style={styles.darkInput} />
            <input type="password" required placeholder="Password" style={styles.darkInput} />
            {!isRegistering && (
              <select style={styles.darkInput} onChange={(e) => setUserRole(e.target.value)}>
                <option value="Customer">Login as Customer</option>
                <option value="Product Manager">Login as Product Manager</option>
                <option value="Sales Manager">Login as Sales Manager</option>
              </select>
            )}
            <button type="submit" style={styles.proBtn}>{isRegistering ? 'CREATE ACCOUNT' : 'LAUNCH SYSTEM'}</button>
          </form>
          <p onClick={() => setIsRegistering(!isRegistering)} style={styles.toggleText}>
            {isRegistering ? "Back to Login" : "Don't have an account? Sign Up"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardLayout}>
      <nav style={styles.navBar}>
        <div style={styles.navLeft}>
          <div onClick={() => setIsSideMenuOpen(true)} style={styles.hamburger}>☰</div>
          <h2 style={styles.navBrand}>CS308 <span style={{color: '#00d4ff'}}>GAMING</span></h2>
        </div>
        <input type="text" placeholder="Search components..." style={styles.searchInput} onChange={(e) => setSearchQuery(e.target.value)} />
        <div style={styles.navRight}>
          {userRole === 'Customer' && (
            <div onClick={() => setIsCartOpen(true)} style={styles.cartIcon}>
              🛒 <span style={styles.badge}>{cart.reduce((a, b) => a + b.qty, 0)}</span>
            </div>
          )}
          <div style={{textAlign: 'right'}}>
            <div style={{fontSize: '11px', color: '#00d4ff', fontWeight:'bold'}}>{userRole.toUpperCase()}</div>
            <div onClick={() => setIsLoggedIn(false)} style={styles.logoutLink}>Logout</div>
          </div>
        </div>
      </nav>

      {/* SIDEBAR */}
      {isSideMenuOpen && (
        <div style={styles.overlay} onClick={() => setIsSideMenuOpen(false)}>
          <div style={styles.sideMenu} onClick={e => e.stopPropagation()}>
            <div style={styles.sideHeader}>
              <h3>Categories</h3>
              <button onClick={() => setIsSideMenuOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            {['All', 'GPU', 'CPU', 'RAM', 'Storage', 'Case', 'Headset', 'MB'].map(cat => (
              <div key={cat} onClick={() => {setSelectedCategory(cat); setIsSideMenuOpen(false);}} 
                   style={{...styles.sideItem, color: selectedCategory === cat ? '#00d4ff' : '#aaa'}}>
                {cat}
              </div>
            ))}
            <hr style={styles.hr}/>
            <h4 style={{fontSize:'12px', color:'#00d4ff'}}>SORT BY</h4>
            <select style={styles.darkSelect} onChange={(e) => {setSortBy(e.target.value); setIsSideMenuOpen(false);}}>
              <option value="Default">Default</option>
              <option value="LowToHigh">Price: Low to High</option>
              <option value="HighToLow">Price: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* PRODUCT GRID */}
      <div style={styles.container}>
        <h3 style={styles.sectionTitle}>{selectedCategory} Hardware</h3>
        <div style={styles.productGrid}>
          {filtered.map((item) => (
            <div key={item.id} style={styles.productCard}>
              <div style={styles.imageBox}><img src={item.img} alt={item.n} style={styles.productImage} /></div>
              <div style={styles.cardInfo}>
                <h4 style={styles.productName}>{item.n}</h4>
                <p style={styles.productPrice}>{item.p.toLocaleString()} TL</p>
                {userRole === 'Customer' ? (
                  <button onClick={() => addToCart(item)} style={styles.addToCartBtn}>Add to Cart</button>
                ) : (
                  <button style={{...styles.addToCartBtn, background: '#f39c12'}}>Edit Details</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CART DRAWER */}
      {isCartOpen && (
        <div style={styles.overlay} onClick={() => setIsCartOpen(false)}>
          <div style={styles.drawer} onClick={e => e.stopPropagation()}>
            <div style={styles.drawerHeader}><h3>Your Loadout</h3><button onClick={() => setIsCartOpen(false)} style={styles.closeBtn}>✕</button></div>
            <div style={styles.drawerContent}>
              {cart.map(item => (
                <div key={item.id} style={styles.cartItem}>
                  <span>{item.n} (x{item.qty})</span>
                  <b>{(item.p * item.qty).toLocaleString()} TL</b>
                </div>
              ))}
            </div>
            <div style={styles.drawerFooter}>
              <h4>Total: {cart.reduce((a, b) => a + (b.p * b.qty), 0).toLocaleString()} TL</h4>
              <button style={styles.proBtn}>Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  loginPage: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', fontFamily: 'sans-serif' },
  loginCard: { background: '#161616', padding: '40px', borderRadius: '15px', border: '1px solid #333', textAlign: 'center', width: '380px' },
  brandTitle: { color: '#fff', fontSize: '28px', marginBottom: '25px', fontWeight: 'bold' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  darkInput: { padding: '12px', borderRadius: '8px', border: '1px solid #333', background: '#0d0d0d', color: '#fff', outline: 'none' },
  proBtn: { padding: '14px', background: 'linear-gradient(45deg, #00d4ff, #0055ff)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  toggleText: { color: '#00d4ff', marginTop: '15px', cursor: 'pointer', fontSize: '13px' },

  dashboardLayout: { minHeight: '100vh', background: '#0f0f0f', color: '#fff', fontFamily: 'sans-serif' },
  navBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 40px', background: '#161616', borderBottom: '1px solid #333', position: 'sticky', top: 0, zIndex: 100 },
  navLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  hamburger: { fontSize: '24px', cursor: 'pointer', color: '#00d4ff' },
  navBrand: { margin: 0, fontSize: '20px', fontWeight: '800' },
  searchInput: { width: '30%', padding: '8px 15px', borderRadius: '20px', border: '1px solid #333', background: '#0a0a0a', color: '#fff', outline: 'none' },
  navRight: { display: 'flex', gap: '25px', alignItems: 'center' },
  cartIcon: { position: 'relative', cursor: 'pointer', fontSize: '22px' },
  badge: { position: 'absolute', top: '-8px', right: '-10px', background: '#00d4ff', color: '#000', fontSize: '10px', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' },
  logoutLink: { color: '#ff4d4d', cursor: 'pointer', fontSize: '11px' },

  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 1000 },
  sideMenu: { position: 'fixed', left: 0, top: 0, width: '280px', height: '100%', background: '#161616', padding: '30px', borderRight: '1px solid #333' },
  sideHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sideItem: { padding: '10px 0', cursor: 'pointer', fontSize: '14px' },
  darkSelect: { width: '100%', padding: '10px', background: '#0a0a0a', color: '#fff', border: '1px solid #333', borderRadius: '5px' },
  hr: { border: '0', borderTop: '1px solid #333', margin: '20px 0' },

  container: { padding: '30px 40px' },
  sectionTitle: { borderLeft: '4px solid #00d4ff', paddingLeft: '15px', marginBottom: '25px' },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
  productCard: { background: '#161616', borderRadius: '10px', overflow: 'hidden', border: '1px solid #333' },
  imageBox: { height: '180px', background: '#fff', display:'flex', alignItems:'center', justifyContent:'center' },
  productImage: { width: '90%', height: '90%', objectFit: 'contain' },
  cardInfo: { padding: '15px' },
  productName: { margin: '0 0 10px 0', fontSize: '14px', height: '35px', overflow:'hidden' },
  productPrice: { fontSize: '18px', fontWeight: 'bold', color: '#00d4ff', marginBottom: '10px' },
  addToCartBtn: { width: '100%', padding: '10px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '6px', cursor: 'pointer' },

  drawer: { position: 'fixed', right: 0, top: 0, width: '350px', height: '100%', background: '#161616', padding: '30px' },
  drawerHeader: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '15px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  drawerContent: { padding: '20px 0' },
  cartItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '13px' },
  drawerFooter: { borderTop: '1px solid #333', paddingTop: '20px' }
};

export default App;