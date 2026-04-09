import React, { useState, useEffect } from 'react';

function App() {
  const [view, setView] = useState('shop'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '', fullName: '', address: '', taxId: '' });

  // Checkout states
  const [showCheckout, setShowCheckout] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');

  // Comments states
  const [showComments, setShowComments] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [commentMsg, setCommentMsg] = useState('');
  const [pendingComments, setPendingComments] = useState([]);
  const [showPendingComments, setShowPendingComments] = useState(false);

  const [authError, setAuthError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const pRes = await fetch('http://localhost:8000/api/products');
      setProducts(await pRes.json());
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await fetch('http://localhost:8000/api/orders');
      setOrders(await oRes.json());
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authData.email, password: authData.password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        setView('shop');
      } else {
        setAuthError(data.message || 'Login failed');
      }
    } catch (err) {
      setAuthError('Failed to connect to server');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authData.fullName,
          email: authData.email,
          password: authData.password
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Account created! Please login.');
        setView('login');
      } else {
        setAuthError(data.message || 'Registration failed');
      }
    } catch (err) {
      setAuthError('Failed to connect to server');
    }
  };

  const addToCart = (p) => {
    if (p.stock === 0) return;
    const found = cart.find(item => item._id === p._id);
    if (found) setCart(cart.map(i => i._id === p._id ? {...i, qty: i.qty + 1} : i));
    else setCart([...cart, {...p, qty: 1}]);
  };

  const handleCheckout = async () => {
    if (!deliveryAddress) { alert('Please enter delivery address'); return; }
    if (!cardNumber || !cardName || !cardExpiry || !cardCVV) { alert('Please fill in all card details'); return; }
    try {
      const orderItems = cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.qty
      }));
      const totalPrice = cart.reduce((a, b) => a + (b.price * b.qty), 0);

      const res = await fetch('http://localhost:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?._id || '000000000000000000000000',
          userName: user?.name || 'Guest',
          userEmail: user?.email || 'guest@store.com',
          items: orderItems,
          totalPrice,
          deliveryAddress
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setLastOrder(data.order);
      setCart([]);
      setShowCheckout(false);
      setShowInvoice(true);
    } catch (err) {
      alert('Checkout failed: ' + err.message);
    }
  };

  const openComments = async (product) => {
    setSelectedProduct(product);
    setShowComments(true);
    try {
      const res = await fetch(`http://localhost:8000/api/comments/product/${product._id}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) { alert('Please write a comment'); return; }
    try {
      const res = await fetch('http://localhost:8000/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct._id,
          userId: user?._id || '000000000000000000000000',
          userName: user?.name || 'Guest',
          rating: newRating,
          comment: newComment
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCommentMsg('✅ Comment submitted! Waiting for approval.');
      setNewComment('');
      setNewRating(5);
      setTimeout(() => setCommentMsg(''), 3000);
    } catch (err) {
      setCommentMsg('❌ Error: ' + err.message);
    }
  };

  const loadPendingComments = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/comments/pending');
      const data = await res.json();
      setPendingComments(data);
      setShowPendingComments(true);
    } catch (err) {
      console.error('Failed to load pending comments:', err);
    }
  };

  const approveComment = async (commentId) => {
    try {
      await fetch(`http://localhost:8000/api/comments/${commentId}/approve`, { method: 'PUT' });
      setPendingComments(pendingComments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const rejectComment = async (commentId) => {
    try {
      await fetch(`http://localhost:8000/api/comments/${commentId}`, { method: 'DELETE' });
      setPendingComments(pendingComments.filter(c => c._id !== commentId));
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <div style={{...styles.sidebar, left: isMenuOpen ? '0' : '-280px'}}>
        <button onClick={() => setIsMenuOpen(false)} style={styles.closeBtn}>×</button>
        <div style={styles.sidebarHeader}><h3>{user ? user.name : "Guest"}</h3></div>
        <div style={styles.menuItem} onClick={() => {setView('shop'); setIsMenuOpen(false)}}>Shop</div>
        {user?.role === 'ProductManager' && (
          <>
            <div style={styles.menuItem} onClick={() => {setView('stock'); setIsMenuOpen(false)}}>Stock & Warranty</div>
            <div style={styles.menuItem} onClick={() => {fetchOrders(); setView('delivery'); setIsMenuOpen(false)}}>Delivery Tracking</div>
            <div style={styles.menuItem} onClick={() => {loadPendingComments(); setIsMenuOpen(false)}}>🛡️ Moderate Comments</div>
          </>
        )}
        {user?.role === 'SalesManager' && (
          <>
            <div style={styles.menuItem} onClick={() => {fetchOrders(); setView('invoices'); setIsMenuOpen(false)}}>📋 All Invoices</div>
          </>
        )}
        <div style={styles.menuItem} onClick={() => {setView('cart'); setIsMenuOpen(false)}}>My Cart ({cart.length})</div>
        {!user ? 
          <div style={styles.menuItem} onClick={() => {setView('login'); setIsMenuOpen(false)}}>Sign In</div> : 
          <div style={{...styles.menuItem, color:'red'}} onClick={() => { setUser(null); localStorage.removeItem('token'); }}>Logout</div>
        }
      </div>

      <nav style={styles.navbar}>
        <button onClick={() => setIsMenuOpen(true)} style={styles.hamburger}>☰</button>
        <h2 onClick={() => setView('shop')} style={{cursor:'pointer'}}>TECH<span style={{color:'#007AFF'}}>STORE</span></h2>
        <div style={styles.navTools}>
          <input placeholder="Search..." style={styles.search} onChange={e => setSearchTerm(e.target.value)} />
          <div onClick={() => setView('cart')} style={styles.cartIcon}>🛒 <span style={styles.badge}>{cart.reduce((a,b) => a+b.qty, 0)}</span></div>
          {user && <span style={{fontSize:'12px', color:'#007AFF', fontWeight:'bold'}}>{user.role}</span>}
        </div>
      </nav>

      <main style={styles.main}>
        {/* LOGIN */}
        {view === 'login' && (
          <div style={styles.authCard}>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input placeholder="Email" type="email" style={styles.input} 
                onChange={e => setAuthData({...authData, email: e.target.value})} required />
              <input type="password" placeholder="Password" style={styles.input} 
                onChange={e => setAuthData({...authData, password: e.target.value})} required />
              {authError && <p style={{color:'red', fontSize:'13px'}}>{authError}</p>}
              <button style={styles.primaryBtn} type="submit">Login</button>
            </form>
            <p onClick={() => setView('register')} style={styles.link}>No account? Register</p>
          </div>
        )}

        {/* REGISTER */}
        {view === 'register' && (
          <div style={styles.authCard}>
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input placeholder="Full Name" style={styles.input} 
                onChange={e => setAuthData({...authData, fullName: e.target.value})} required />
              <input placeholder="Email" type="email" style={styles.input} 
                onChange={e => setAuthData({...authData, email: e.target.value})} required />
              <input placeholder="Tax ID" style={styles.input} 
                onChange={e => setAuthData({...authData, taxId: e.target.value})} />
              <input placeholder="Address" style={styles.input} 
                onChange={e => setAuthData({...authData, address: e.target.value})} />
              <input type="password" style={styles.input} placeholder="Password" 
                onChange={e => setAuthData({...authData, password: e.target.value})} required />
              {authError && <p style={{color:'red', fontSize:'13px'}}>{authError}</p>}
              <button style={styles.primaryBtn} type="submit">Register</button>
            </form>
            <p onClick={() => setView('login')} style={styles.link}>Already have an account? Login</p>
          </div>
        )}

        {/* CART PAGE */}
        {view === 'cart' && (
          <div style={styles.panel}>
            <h2>My Cart</h2>
            {cart.length === 0 ? <p style={{color:'#999'}}>Your cart is empty.</p> :
              cart.map(item => (
                <div key={item._id} style={styles.cartItem}>
                  <span>{item.name} (x{item.qty})</span>
                  <span>{(item.price * item.qty).toLocaleString()} TL</span>
                  <button onClick={() => setCart(cart.filter(i => i._id !== item._id))} 
                    style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Remove</button>
                </div>
              ))
            }
            <h3 style={{textAlign:'right', marginTop:'20px'}}>
              Total: {cart.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString()} TL
            </h3>
            {cart.length > 0 && (
              <button style={{...styles.primaryBtn, marginTop:'15px'}} 
                onClick={() => setShowCheckout(true)}>
                ✅ Proceed to Checkout
              </button>
            )}
          </div>
        )}

        {/* SHOP */}
        {view === 'shop' && (
          <div style={styles.grid}>
            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
              <div key={p._id} style={styles.card}>
                <h4>{p.name}</h4>
                <p style={{color:'#007AFF', fontWeight:'bold'}}>{p.price?.toLocaleString()} TL</p>
                <p style={{fontSize:'12px', color: p.stock > 0 ? 'green' : 'red'}}>
                  {p.stock > 0 ? `In Stock: ${p.stock}` : 'Out of Stock'}
                </p>
                <button style={{...styles.addBtn, opacity: p.stock === 0 ? 0.4 : 1}} 
                  onClick={() => addToCart(p)} disabled={p.stock === 0}>
                  {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button style={{...styles.addBtn, background:'#f0f0f0', color:'#333', marginTop:'5px'}} 
                  onClick={() => openComments(p)}>
                  💬 Reviews
                </button>
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
                    <td><input type="text" defaultValue={p.warranty} style={styles.tableInputWide} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PM: DELIVERY LIST */}
        {view === 'delivery' && (
          <div style={styles.panel}>
            <h2>Delivery List</h2>
            <table style={styles.table}>
              <thead><tr><th>Customer</th><th>Address</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td>{o.userName}</td>
                    <td>{o.deliveryAddress}</td>
                    <td>{o.items?.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
                    <td>{o.totalPrice?.toLocaleString()} TL</td>
                    <td>
                      <select defaultValue={o.status} onChange={async (e) => {
                        await fetch(`http://localhost:8000/api/orders/${o._id}/status`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ status: e.target.value })
                        });
                      }}>
                        <option>Processing</option>
                        <option>In-Transit</option>
                        <option>Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* SALES MANAGER: ALL INVOICES */}
        {view === 'invoices' && (
          <div style={styles.panel}>
            <h2>📋 All Invoices</h2>
            <table style={styles.table}>
              <thead><tr><th>ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th>PDF</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td style={{fontSize:'11px'}}>{o._id}</td>
                    <td>{o.userName}</td>
                    <td>{o.totalPrice?.toLocaleString()} TL</td>
                    <td>{o.status}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button style={{...styles.primaryBtn, padding:'5px 10px', fontSize:'12px'}}
                        onClick={() => window.open(`http://localhost:8000/api/orders/${o._id}/invoice`)}>
                        📥 PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div style={styles.modalOverlay} onClick={() => setShowCheckout(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>💳 Checkout</h3>
            <h4 style={{color:'#007AFF'}}>Order Summary</h4>
            {cart.map(item => (
              <div key={item._id} style={styles.cartItem}>
                <span>{item.name} x{item.qty}</span>
                <b>{(item.price * item.qty).toLocaleString()} TL</b>
              </div>
            ))}
            <h4 style={{color:'green'}}>Total: {cart.reduce((a,b) => a+(b.price*b.qty),0).toLocaleString()} TL</h4>
            <hr/>
            <h4>📦 Delivery Address</h4>
            <input placeholder="Full delivery address" style={styles.input}
              onChange={e => setDeliveryAddress(e.target.value)} />
            <h4>💳 Card Details (Mock)</h4>
            <input placeholder="Card Number" maxLength={16} style={styles.input}
              onChange={e => setCardNumber(e.target.value)} />
            <input placeholder="Cardholder Name" style={styles.input}
              onChange={e => setCardName(e.target.value)} />
            <div style={{display:'flex', gap:'10px'}}>
              <input placeholder="MM/YY" style={{...styles.input, flex:1}}
                onChange={e => setCardExpiry(e.target.value)} />
              <input placeholder="CVV" maxLength={3} style={{...styles.input, flex:1}}
                onChange={e => setCardCVV(e.target.value)} />
            </div>
            <button onClick={handleCheckout} style={styles.primaryBtn}>✅ Place Order</button>
            <button onClick={() => setShowCheckout(false)} 
              style={{...styles.primaryBtn, background:'#ccc', color:'#333', marginTop:'10px'}}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {showInvoice && lastOrder && (
        <div style={styles.modalOverlay} onClick={() => setShowInvoice(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 style={{color:'#007AFF', textAlign:'center'}}>🧾 Invoice</h2>
            <hr/>
            <p><b>Invoice ID:</b> <span style={{fontSize:'11px', color:'#999'}}>{lastOrder._id}</span></p>
            <p><b>Date:</b> {new Date(lastOrder.createdAt).toLocaleString()}</p>
            <p><b>Customer:</b> {lastOrder.userName}</p>
            <p><b>Email:</b> {lastOrder.userEmail}</p>
            <p><b>Address:</b> {lastOrder.deliveryAddress}</p>
            <p><b>Status:</b> <span style={{color:'orange'}}>{lastOrder.status}</span></p>
            <hr/>
            <h4>Items:</h4>
            {lastOrder.items.map((item, i) => (
              <div key={i} style={styles.cartItem}>
                <span>{item.name} x{item.quantity}</span>
                <b>{(item.price * item.quantity).toLocaleString()} TL</b>
              </div>
            ))}
            <hr/>
            <h3 style={{textAlign:'right', color:'green'}}>Total: {lastOrder.totalPrice.toLocaleString()} TL</h3>
            <button onClick={() => window.open(`http://localhost:8000/api/orders/${lastOrder._id}/invoice`)}
              style={styles.primaryBtn}>📥 Download PDF</button>
            <button onClick={() => setShowInvoice(false)}
              style={{...styles.primaryBtn, background:'#ccc', color:'#333', marginTop:'10px'}}>Close</button>
          </div>
        </div>
      )}

      {/* COMMENTS MODAL */}
      {showComments && selectedProduct && (
        <div style={styles.modalOverlay} onClick={() => setShowComments(false)}>
          <div style={{...styles.modal, maxHeight:'80vh', overflowY:'auto'}} onClick={e => e.stopPropagation()}>
            <h3>💬 Reviews — {selectedProduct.name}</h3>
            {user && (
              <div style={{marginBottom:'20px', paddingBottom:'20px', borderBottom:'1px solid #eee'}}>
                <h4>Leave a Review</h4>
                <div style={{display:'flex', gap:'5px', marginBottom:'10px'}}>
                  {[1,2,3,4,5].map(star => (
                    <span key={star} onClick={() => setNewRating(star)}
                      style={{fontSize:'28px', cursor:'pointer', color: star <= newRating ? '#f39c12' : '#ccc'}}>★</span>
                  ))}
                </div>
                <textarea placeholder="Write your review..." rows={3} value={newComment}
                  style={{...styles.input, resize:'none'}}
                  onChange={e => setNewComment(e.target.value)} />
                {commentMsg && <p style={{color: commentMsg.includes('✅') ? 'green' : 'red', fontSize:'13px'}}>{commentMsg}</p>}
                <button onClick={handleSubmitComment} style={styles.primaryBtn}>Submit Review</button>
              </div>
            )}
            <h4>Customer Reviews</h4>
            {comments.length === 0 ? <p style={{color:'#999'}}>No reviews yet.</p> :
              comments.map(c => (
                <div key={c._id} style={{background:'#f9f9f9', borderRadius:'8px', padding:'15px', marginBottom:'10px'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <b>{c.userName}</b>
                    <span style={{color:'#f39c12'}}>{'★'.repeat(c.rating)}{'☆'.repeat(5-c.rating)}</span>
                  </div>
                  <p style={{color:'#555', fontSize:'13px', margin:'5px 0'}}>{c.comment}</p>
                  <p style={{color:'#999', fontSize:'11px'}}>{new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            }
            <button onClick={() => setShowComments(false)} 
              style={{...styles.primaryBtn, background:'#ccc', color:'#333'}}>Close</button>
          </div>
        </div>
      )}

      {/* PENDING COMMENTS MODAL */}
      {showPendingComments && (
        <div style={styles.modalOverlay} onClick={() => setShowPendingComments(false)}>
          <div style={{...styles.modal, maxHeight:'80vh', overflowY:'auto'}} onClick={e => e.stopPropagation()}>
            <h3>🛡️ Pending Comments ({pendingComments.length})</h3>
            {pendingComments.length === 0 ? <p style={{color:'green'}}>No pending comments! ✅</p> :
              pendingComments.map(c => (
                <div key={c._id} style={{background:'#f9f9f9', borderRadius:'8px', padding:'15px', marginBottom:'10px'}}>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <b>{c.userName}</b>
                    <span style={{color:'#f39c12'}}>{'★'.repeat(c.rating)}{'☆'.repeat(5-c.rating)}</span>
                  </div>
                  <p style={{color:'#555', fontSize:'13px'}}>{c.comment}</p>
                  <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                    <button onClick={() => approveComment(c._id)} style={styles.primaryBtn}>✅ Approve</button>
                    <button onClick={() => rejectComment(c._id)} 
                      style={{...styles.primaryBtn, background:'#ff3b30'}}>❌ Reject</button>
                  </div>
                </div>
              ))
            }
            <button onClick={() => setShowPendingComments(false)}
              style={{...styles.primaryBtn, background:'#ccc', color:'#333'}}>Close</button>
          </div>
        </div>
      )}
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
  primaryBtn: { width:'100%', padding:'12px', background:'#007AFF', color:'#FFF', border:'none', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', marginTop:'5px' },
  link: { color:'#007AFF', cursor:'pointer', marginTop:'15px' },
  grid: { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'20px' },
  card: { background:'#FFF', padding:'20px', borderRadius:'15px', textAlign:'center' },
  addBtn: { width:'100%', padding:'10px', background:'#007AFF', color:'#FFF', border:'none', borderRadius:'8px', cursor:'pointer' },
  panel: { background:'#FFF', padding:'30px', borderRadius:'20px' },
  cartItem: { display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #EEE' },
  table: { width:'100%', borderCollapse:'collapse', marginTop:'15px' },
  tableInput: { width:'60px' },
  tableInputWide: { width:'150px' },
  modalOverlay: { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' },
  modal: { background:'#FFF', padding:'30px', borderRadius:'20px', width:'480px', maxWidth:'90%', maxHeight:'90vh', overflowY:'auto' }
};

export default App;