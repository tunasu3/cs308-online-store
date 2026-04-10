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

  // Product manager dashboard states
  const [editedProducts, setEditedProducts] = useState({});
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    warranty: '',
    description: ''
  });
  const [dashboardMsg, setDashboardMsg] = useState('');

  // Category states
  const [categories, setCategories] = useState([]);
  const [editedCategories, setEditedCategories] = useState({});
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: ''
  });

  // Delivery states
  const [deliveryMsg, setDeliveryMsg] = useState('');

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await fetch('http://localhost:8000/api/products');
      setProducts(await pRes.json());
    } catch (err) {
      console.error('Failed to fetch products:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const cRes = await fetch('http://localhost:8000/api/categories');
      if (!cRes.ok) throw new Error('Failed to fetch categories');
      setCategories(await cRes.json());
    } catch (err) {
      console.error('Failed to fetch categories:', err);
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

  const updateStatus = async (id, status) => {
  await fetch(`http://localhost:8000/api/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });

  fetchOrders(); // refresh table
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
        if (data.role === 'Customer') {
          setView('shop');
        } else {
          setView('mDash');
        }
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

  // Product Manager Dashboard Functions
  const handleProductFieldChange = (productId, field, value) => {
    setEditedProducts(prev => ({
      ...prev,
      [productId]: {
        ...(prev[productId] || {}),
        [field]: value
      }
    }));
  };

  const saveProductChanges = async (product) => {
    const updates = editedProducts[product._id];

    if (!updates) {
      setDashboardMsg('No changes to save for this product.');
      setTimeout(() => setDashboardMsg(''), 2500);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...product,
          ...updates,
          stock: Number((updates.stock ?? product.stock) || 0),
          price: Number((updates.price ?? product.price) || 0)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update product');

      setDashboardMsg(`Saved changes for ${product.name}`);
      setEditedProducts(prev => {
        const copy = { ...prev };
        delete copy[product._id];
        return copy;
      });
      fetchData();
      setTimeout(() => setDashboardMsg(''), 2500);
    } catch (err) {
      setDashboardMsg(`Error: ${err.message}`);
      setTimeout(() => setDashboardMsg(''), 3000);
    }
  };

  const deleteProduct = async (productId) => {
    const confirmed = window.confirm('Are you sure you want to delete this product?');
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/api/products/${productId}`, {
        method: 'DELETE'
      });

      let data = {};
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok) throw new Error(data.message || data.error || 'Failed to delete product');

      setDashboardMsg('Product deleted successfully.');
      fetchData();
      setTimeout(() => setDashboardMsg(''), 2500);
    } catch (err) {
      setDashboardMsg(`Error: ${err.message}`);
      setTimeout(() => setDashboardMsg(''), 3000);
    }
  };

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      setDashboardMsg('Please fill in name, price, and stock.');
      setTimeout(() => setDashboardMsg(''), 2500);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProduct.name,
          price: Number(newProduct.price),
          stock: Number(newProduct.stock),
          warranty: newProduct.warranty,
          description: newProduct.description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to add product');

      setDashboardMsg('Product added successfully.');
      setNewProduct({
        name: '',
        price: '',
        stock: '',
        warranty: '',
        description: ''
      });
      setShowAddProduct(false);
      fetchData();
      setTimeout(() => setDashboardMsg(''), 2500);
    } catch (err) {
      setDashboardMsg(`Error: ${err.message}`);
      setTimeout(() => setDashboardMsg(''), 3000);
    }
  };

  const handleCategoryFieldChange = (categoryId, field, value) => {
    setEditedCategories(prev => ({
      ...prev,
      [categoryId]: {
        ...(prev[categoryId] || {}),
        [field]: value
      }
    }));
  };

  const saveCategoryChanges = async (category) => {
    const updates = editedCategories[category._id];

    if (!updates) {
      setDashboardMsg('No changes to save for this category.');
      setTimeout(() => setDashboardMsg(''), 2500);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/categories/${category._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...category,
          ...updates
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to update category');

      setDashboardMsg(`Saved changes for category: ${category.name}`);
      setEditedCategories(prev => {
        const copy = { ...prev };
        delete copy[category._id];
        return copy;
      });
      fetchCategories();
      setTimeout(() => setDashboardMsg(''), 2500);
    } catch (err) {
      setDashboardMsg(`Error: ${err.message}`);
      setTimeout(() => setDashboardMsg(''), 3000);
    }
  };

  const deleteCategory = async (categoryId) => {
    const confirmed = window.confirm('Are you sure you want to delete this category?');
    if (!confirmed) return;

    try {
      const res = await fetch(`http://localhost:8000/api/categories/${categoryId}`, {
        method: 'DELETE'
      });

      let data = {};
      try {
        data = await res.json();
      } catch (_) {}

      if (!res.ok) throw new Error(data.message || data.error || 'Failed to delete category');

      setDashboardMsg('Category deleted successfully.');
      fetchCategories();
      setTimeout(() => setDashboardMsg(''), 2500);
    } catch (err) {
      setDashboardMsg(`Error: ${err.message}`);
      setTimeout(() => setDashboardMsg(''), 3000);
    }
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) {
      setDashboardMsg('Please enter a category name.');
      setTimeout(() => setDashboardMsg(''), 2500);
      return;
    }

    try {
      const res = await fetch('http://localhost:8000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategory.name,
          description: newCategory.description
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to add category');

      setDashboardMsg('Category added successfully.');
      setNewCategory({
        name: '',
        description: ''
      });
      setShowAddCategory(false);
      fetchCategories();
      setTimeout(() => setDashboardMsg(''), 2500);
    } catch (err) {
      setDashboardMsg(`Error: ${err.message}`);
      setTimeout(() => setDashboardMsg(''), 3000);
    }
  };

  const forwardOrderToDelivery = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Forwarded to Delivery'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Failed to forward order');

      setDeliveryMsg('Order forwarded to delivery department.');
      fetchOrders();
      setTimeout(() => setDeliveryMsg(''), 2500);
    } catch (err) {
      setDeliveryMsg(`Error: ${err.message}`);
      setTimeout(() => setDeliveryMsg(''), 3000);
    }
  };

  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <div style={{...styles.sidebar, left: isMenuOpen ? '0' : '-280px'}}>
        <button onClick={() => setIsMenuOpen(false)} style={styles.closeBtn}>×</button>
        <div style={styles.sidebarHeader}><h3>{user ? user.name : "Guest"}</h3></div>
        {(!user || user?.role === 'Customer') && (
          <>
            <div style={styles.menuItem} onClick={() => {setView('shop'); setIsMenuOpen(false)}}>Shop</div>
            <div style={styles.menuItem} onClick={() => {setView('cart'); setIsMenuOpen(false)}}>My Cart ({cart.length})</div>
          </>
        )}
        {user?.role === 'ProductManager' && (
          <>
            <div style={styles.menuItem} onClick={() => {setView('products'); setIsMenuOpen(false)}}>Products</div>
            <div style={styles.menuItem} onClick={() => {fetchOrders(); setView('delivery'); setIsMenuOpen(false)}}>Delivery Tracking</div>
            <div style={styles.menuItem} onClick={() => {loadPendingComments(); setIsMenuOpen(false)}}>🛡️ Moderate Comments</div>
          </>
        )}
        {user?.role === 'SalesManager' && (
          <>
            <div style={styles.menuItem} onClick={() => {fetchOrders(); setView('invoices'); setIsMenuOpen(false)}}>📋 All Invoices</div>
          </>
        )}
        {!user ? 
          <div style={styles.menuItem} onClick={() => {setView('login'); setIsMenuOpen(false)}}>Sign In</div> : 
          <div style={{...styles.menuItem, color:'red'}} onClick={() => { setUser(null); setView('store'); localStorage.removeItem('token'); }}>Logout</div>
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
                {p.imageUrl && (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    style={{ width:'100%', height:'180px', objectFit:'cover', borderRadius:'10px', marginBottom:'10px' }}
                  />
                )}
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

        {/* MODERATOR DASHBOARD */}
        {view === 'mDash' && (
          <>
            <h2>Dashboard</h2>
            <div style={styles.grid}>
              {user?.role === 'ProductManager' && (
                <>
                  <button style={styles.card}
                    onClick={() => {setView('products')}}>
                    <p style={{ fontSize:'20px' }}>Product Controls</p>
                  </button>
                  <button style={styles.card}
                    onClick={() => {fetchOrders(); setView('delivery')}}>
                    <p style={{ fontSize:'20px' }}>Delivery Status Controls</p>
                  </button>
                  <button style={styles.card}
                    onClick={() => {loadPendingComments()}}>
                    <p style={{ fontSize:'20px' }}>Comment Moderation</p>
                  </button>
                </>
              )}
              {user?.role === 'SalesManager' && (
                <>
                  <button style={styles.card}
                    onClick={() => {fetchOrders(); setView('invoices')}}>
                    <p style={{ fontSize:'20px' }}>📋 All Invoices</p>
                  </button>
                </>
              ) /*ToDo: Add sales manager action buttons*/}
            </div>
          </>
        )}

        {/* PM: PRODUCT CONTROL */}
        {view === 'products' && (
          <div style={styles.panel}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
              <h2 style={{margin:0}}>Stock, Products & Categories</h2>
              <div style={{display:'flex', gap:'10px'}}>
                <button
                  style={{...styles.primaryBtn, width:'auto', padding:'10px 16px', marginTop:0}}
                  onClick={() => setShowAddProduct(true)}
                >
                  + Add Product
                </button>
                <button
                  style={{...styles.primaryBtn, width:'auto', padding:'10px 16px', marginTop:0, background:'#34c759'}}
                  onClick={() => setShowAddCategory(true)}
                >
                  + Add Category
                </button>
              </div>
            </div>

            {dashboardMsg && (
              <p style={{marginBottom:'15px', color: dashboardMsg.startsWith('Error') ? 'red' : 'green'}}>
                {dashboardMsg}
              </p>
            )}

            <h3>Products</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Warranty</th>
                  <th>Image URL</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>
                      <input
                        type="number"
                        defaultValue={p.price}
                        style={styles.tableInputWide}
                        onChange={(e) => handleProductFieldChange(p._id, 'price', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        defaultValue={p.stock}
                        style={styles.tableInput}
                        onChange={(e) => handleProductFieldChange(p._id, 'stock', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        defaultValue={p.warranty || ''}
                        style={styles.tableInputWide}
                        onChange={(e) => handleProductFieldChange(p._id, 'warranty', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        defaultValue={p.imageUrl || ''}
                        style={{...styles.tableInputWide, width:'180px'}}
                        placeholder="Paste image URL..."
                        onChange={(e) => handleProductFieldChange(p._id, 'imageUrl', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        defaultValue={p.imageUrl || ''}
                        style={{...styles.tableInputWide, width:'180px'}}
                        placeholder="Paste image URL..."
                        onChange={(e) => handleProductFieldChange(p._id, 'imageUrl', e.target.value)}
                      />
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'8px'}}>
                        <button
                          style={{...styles.primaryBtn, width:'auto', padding:'8px 12px', marginTop:0}}
                          onClick={() => saveProductChanges(p)}
                        >
                          Save
                        </button>
                        <button
                          style={{
                            ...styles.primaryBtn,
                            width:'auto',
                            padding:'8px 12px',
                            marginTop:0,
                            background:'#ff3b30'
                          }}
                          onClick={() => deleteProduct(p._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 style={{marginTop:'30px'}}>Categories</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(category => (
                  <tr key={category._id}>
                    <td>
                      <input
                        type="text"
                        defaultValue={category.name}
                        style={styles.tableInputWide}
                        onChange={(e) => handleCategoryFieldChange(category._id, 'name', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        defaultValue={category.description || ''}
                        style={styles.tableInputWide}
                        onChange={(e) => handleCategoryFieldChange(category._id, 'description', e.target.value)}
                      />
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'8px'}}>
                        <button
                          style={{...styles.primaryBtn, width:'auto', padding:'8px 12px', marginTop:0}}
                          onClick={() => saveCategoryChanges(category)}
                        >
                          Save
                        </button>
                        <button
                          style={{
                            ...styles.primaryBtn,
                            width:'auto',
                            padding:'8px 12px',
                            marginTop:0,
                            background:'#ff3b30'
                          }}
                          onClick={() => deleteCategory(category._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* DELIVERY TRACKING */}
        {view === 'delivery' && (
          <div style={styles.panel}>
            <h2>Delivery Tracking</h2>

            {deliveryMsg && (
              <p style={{marginBottom:'15px', color: deliveryMsg.startsWith('Error') ? 'red' : 'green'}}>
                {deliveryMsg}
              </p>
            )}

            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id}>
                    <td style={{fontSize:'11px'}}>{o._id}</td>
                    <td>{o.userName}</td>
                    <td>{o.totalPrice?.toLocaleString()} TL</td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => updateStatus(o._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td>{o.deliveryAddress}</td>
                    <td>
                      {o.status === 'Confirmed' ? (
                        <button
                          style={{...styles.primaryBtn, width:'auto', padding:'8px 12px', marginTop:0}}
                          onClick={() => forwardOrderToDelivery(o._id)}
                        >
                          Forward to Delivery
                        </button>
                      ) : (
                        <span style={{fontSize:'12px', color:'#888'}}>No action</span>
                      )}
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

      {/* ADD PRODUCT MODAL */}
      {showAddProduct && (
        <div style={styles.modalOverlay} onClick={() => setShowAddProduct(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Add New Product</h3>

            <input
              placeholder="Product name"
              style={styles.input}
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />

            <input
              placeholder="Price"
              type="number"
              style={styles.input}
              value={newProduct.price}
              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
            />

            <input
              placeholder="Stock"
              type="number"
              style={styles.input}
              value={newProduct.stock}
              onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
            />

            <input
              placeholder="Warranty"
              style={styles.input}
              value={newProduct.warranty}
              onChange={(e) => setNewProduct({...newProduct, warranty: e.target.value})}
            />

            <textarea
              placeholder="Description"
              rows={4}
              style={{...styles.input, resize:'none'}}
              value={newProduct.description}
              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
            />

            <button onClick={addProduct} style={styles.primaryBtn}>Add Product</button>
            <button
              onClick={() => setShowAddProduct(false)}
              style={{...styles.primaryBtn, background:'#ccc', color:'#333', marginTop:'10px'}}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ADD CATEGORY MODAL */}
      {showAddCategory && (
        <div style={styles.modalOverlay} onClick={() => setShowAddCategory(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Add New Category</h3>

            <input
              placeholder="Category name"
              style={styles.input}
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
            />

            <textarea
              placeholder="Description"
              rows={4}
              style={{...styles.input, resize:'none'}}
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
            />

            <button onClick={addCategory} style={styles.primaryBtn}>Add Category</button>
            <button
              onClick={() => setShowAddCategory(false)}
              style={{...styles.primaryBtn, background:'#ccc', color:'#333', marginTop:'10px'}}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
  toolbarBtn: { width:'max-content', position:'sticky', right:'20px' },
  cartItem: { display:'flex', justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid #EEE' },
  table: { width:'100%', borderCollapse:'collapse', marginTop:'15px' },
  tableInput: { width:'60px', padding:'6px', border:'1px solid #DDD', borderRadius:'6px' },
  tableInputWide: { width:'120px', padding:'6px', border:'1px solid #DDD', borderRadius:'6px' },
  modalOverlay: { position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' },
  modal: { background:'#FFF', padding:'30px', borderRadius:'20px', width:'480px', maxWidth:'90%', maxHeight:'90vh', overflowY:'auto' }
};

export default App;