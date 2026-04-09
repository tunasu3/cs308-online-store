import React, { useState, useEffect } from 'react';

function App() {
  const [view, setView] = useState('shop'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [authData, setAuthData] = useState({ username: '', password: '', fullName: '', email: '', address: '', taxId: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const pRes = await fetch('http://localhost:5000/api/products');
    const oRes = await fetch('http://localhost:5000/api/admin/orders');
    setProducts(await pRes.json());
    setOrders(await oRes.json());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: authData.username, password: authData.password })
    });
    if (res.ok) { setUser((await res.json()).user); setView('shop'); }
    else alert("Login Failed!");
  };

  const addToCart = (p) => {
    const found = cart.find(item => item._id === p._id);
    if (found) setCart(cart.map(i => i._id === p._id ? {...i, qty: i.qty + 1} : i));
    else setCart([...cart, {...p, qty: 1}]);
  };

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <div style={{...styles.sidebar, left: isMenuOpen ? '0' : '-280px'}}>
        <button onClick={() => setIsMenuOpen(false)} style={styles.closeBtn}>×</button>
        <div style={styles.sidebarHeader}><h3>{user ? user.fullName : "Guest"}</h3></div>
        <div style={styles.menuItem} onClick={() => {setView('shop'); setIsMenuOpen(false)}}>Shop</div>
        {user?.role === 'Product Manager' && (
          <>
            <div style={styles.menuItem} onClick={() => {setView('stock'); setIsMenuOpen(false)}}>Stock & Warranty</div>
            <div style={styles.menuItem} onClick={() => {setView('delivery'); setIsMenuOpen(false)}}>Delivery Tracking</div>
          </>
        )}
        <div style={styles.menuItem} onClick={() => {setView('cart'); setIsMenuOpen(false)}}>My Cart ({cart.length})</div>
        {!user ? <div style={styles.menuItem} onClick={() => {setView('login'); setIsMenuOpen(false)}}>Sign In</div> : 
        <div style={{...styles.menuItem, color:'red'}} onClick={() => setUser(null)}>Logout</div>}
      </div>

      <nav style={styles.navbar}>
        <button onClick={() => setIsMenuOpen(true)} style={styles.hamburger}>☰</button>
        <h2 onClick={() => setView('shop')} style={{cursor:'pointer'}}>TECH<span style={{color:'#007AFF'}}>STORE</span></h2>
        <div style={styles.navTools}>
            <input placeholder="Search..." style={styles.search} onChange={e => setSearchTerm(e.target.value)} />
            <div onClick={() => setView('cart')} style={styles.cartIcon}>🛒 <span style={styles.badge}>{cart.length}</span></div>
        </div>
      </nav>

      <main style={styles.main}>
        {/* LOGIN */}
        {view === 'login' && (
          <div style={styles.authCard}>
            <h2>Login</h2>
            <input placeholder="Username" style={styles.input} onChange={e => setAuthData({...authData, username: e.target.value})} />
            <input type="password" placeholder="Password" style={styles.input} onChange={e => setAuthData({...authData, password: e.target.value})} />
            <button style={styles.primaryBtn} onClick={handleLogin}>Login</button>
            <p onClick={() => setView('register')} style={styles.link}>No account? Register</p>
          </div>
        )}

        {/* REGISTER */}
        {view === 'register' && (
          <div style={styles.authCard}>
            <h2>Register</h2>
            <input placeholder="Full Name" style={styles.input} onChange={e => setAuthData({...authData, fullName: e.target.value})} />
            <input placeholder="Email" style={styles.input} onChange={e => setAuthData({...authData, email: e.target.value})} />
            <input placeholder="Tax ID" style={styles.input} onChange={e => setAuthData({...authData, taxId: e.target.value})} />
            <input placeholder="Address" style={styles.input} onChange={e => setAuthData({...authData, address: e.target.value})} />
            <input placeholder="Username" style={styles.input} onChange={e => setAuthData({...authData, username: e.target.value})} />
            <input type="password" style={styles.input} placeholder="Password" onChange={e => setAuthData({...authData, password: e.target.value})} />
            <button style={styles.primaryBtn} onClick={() => setView('login')}>Register</button>
          </div>
        )}

        {/* CART PAGE */}
        {view === 'cart' && (
          <div style={styles.panel}>
            <h2>My Cart</h2>
            {cart.map(item => (
              <div key={item._id} style={styles.cartItem}>
                <span>{item.name} (x{item.qty})</span>
                <span>{item.price * item.qty} TL</span>
                <button onClick={() => setCart(cart.filter(i => i._id !== item._id))} style={{color:'red', border:'none', background:'none'}}>Remove</button>
              </div>
            ))}
            <h3 style={{textAlign:'right', marginTop:'20px'}}>Total: {cart.reduce((s, i) => s + (i.price * i.qty), 0)} TL</h3>
          </div>
        )}

        {/* SHOP */}
        {view === 'shop' && (
          <div style={styles.grid}>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p._id} style={styles.card}>
                <h4>{p.name}</h4>
                <p>{p.price} TL</p>
                <button style={styles.addBtn} onClick={() => addToCart(p)}>Add to Cart</button>
              </div>
            ))}
          </div>
        )}

        {/* PM: STOCK CONTROL */}
        {view === 'stock' && (
          <div style={styles.panel}>
            <h2>Stock & Warranty</h2>
            <table style={styles.table}>
              <thead><tr><th>Product</th><th>Stock</th><th>Warranty</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td><input type="number" defaultValue={p.stock} style={styles.tableInput} /></td>
                    <td><input type="text" defaultValue={p.warrantyStatus} style={styles.tableInputWide} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PM: DELIVERY LIST & TRACKING */}
        {view === 'delivery' && (
          <div style={styles.panel}>
            <h2>Delivery List</h2>
            <table style={styles.table}>
              <thead><tr><th>Customer</th><th>Address</th><th>Items</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td>{o.customerName}</td>
                    <td>{o.address}</td>
                    <td>{o.items?.map(i => `${i.name} (x${i.qty})`).join(', ')}</td>
                    <td>
                      <select defaultValue={o.status}>
                        <option>Processing</option>
                        <option>In-transit</option>
                        <option>Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: { background:'#F2F2F7', minHeight:'100vh', fontFamily:'sans-serif' },
  navbar: { display:'flex', justifyContent:'space-between', padding:'15px 5%', background:'#FFF', boxShadow:'0 2px 5px rgba(0,0,0,0.05)', position:'sticky', top:0, zIndex:10 },
  hamburger: { fontSize:'24px', background:'none', border:'none', cursor:'pointer' },
  navTools: { display:'flex', alignItems:'center', gap:'15px' },
  search: { padding:'8px 15px', borderRadius:'20px', border:'1px solid #DDD' },
  cartIcon: { cursor:'pointer', position:'relative', fontSize:'22px' },
  badge: { position:'absolute', top:'-8px', right:'-10px', background:'#007AFF', color:'#FFF', borderRadius:'10px', padding:'2px 6px', fontSize:'10px' },
  sidebar: { position:'fixed', top:0, width:'280px', height:'100%', background:'#1C1C1E', color:'#FFF', transition:'0.4s', zIndex:100 },
  sidebarHeader: { padding:'30px 20px', background:'#2C2C2E' },
  menuItem: { padding:'15px 25px', cursor:'pointer', borderBottom:'1px solid #333' },
  closeBtn: { float:'right', padding:'15px', color:'#FFF', background:'none', border:'none', fontSize:'24px' },
  main: { padding:'30px 5%' },
  authCard: { maxWidth:'400px', margin:'0 auto', background:'#FFF', padding:'40px', borderRadius:'20px', textAlign:'center' },
  input: { width:'100%', padding:'12px', margin:'10px 0', borderRadius:'10px', border:'1px solid #DDD', boxSizing:'border-box' },
  primaryBtn: { width:'100%', padding:'12px', background:'#007AFF', color:'#FFF', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer' },
  link: { color:'#007AFF', cursor:'pointer', marginTop:'15px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'20px' },
  card: { background:'#FFF', padding:'20px', borderRadius:'15px', textAlign:'center' },
  addBtn: { width:'100%', padding:'10px', background:'#007AFF', color:'#FFF', border:'none', borderRadius:'8px', cursor:'pointer' },
  panel: { background:'#FFF', padding:'30px', borderRadius:'20px' },
  cartItem: { display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #EEE' },
  table: { width:'100%', borderCollapse:'collapse', marginTop:'15px' },
  tableInput: { width:'60px' },
  tableInputWide: { width:'150px' }
};

export default App;