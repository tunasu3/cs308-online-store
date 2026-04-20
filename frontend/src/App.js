import React, { useState, useEffect } from 'react';
import { styles } from './styles/theme';
import Navbar from './components/layout/Navbar';
import Shop from './pages/Shop';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  // --- STATES ---
  const [view, setView] = useState('shop'); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [authData, setAuthData] = useState({ email: '', password: '', fullName: '', address: '', taxId: '' });
  const [authError, setAuthError] = useState('');
  const [dashboardMsg, setDashboardMsg] = useState('');

  // --- FETCH DATA ---
  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);

  const fetchData = async () => {
    try {
      const pRes = await fetch('http://localhost:8000/api/products');
      setProducts(await pRes.json());
    } catch (err) { console.error('Products fetch error:', err); }
  };

  const fetchCategories = async () => {
    try {
      const cRes = await fetch('http://localhost:8000/api/categories');
      setCategories(await cRes.json());
    } catch (err) { console.error('Categories fetch error:', err); }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await fetch('http://localhost:8000/api/orders');
      setOrders(await oRes.json());
    } catch (err) { console.error('Orders fetch error:', err); }
  };

  // --- AUTH FUNCTIONS ---
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
        setView(data.user.role === 'Customer' ? 'shop' : 'mDash');
      } else {
        setAuthError(data.message || 'Login failed');
      }
    } catch (err) { setAuthError('Server connection failed'); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authData.fullName, email: authData.email, password: authData.password })
      });
      if (res.ok) {
        alert('Account created! Please login.');
        setView('login');
      } else {
        const data = await res.json();
        setAuthError(data.message || 'Registration failed');
      }
    } catch (err) { setAuthError('Server connection failed'); }
  };

  // --- SHOPPING FUNCTIONS ---
  const addToCart = (p) => {
    if (p.stock === 0) return;
    const found = cart.find(item => item._id === p._id);
    if (found) setCart(cart.map(i => i._id === p._id ? {...i, qty: i.qty + 1} : i));
    else setCart([...cart, {...p, qty: 1}]);
  };

  // --- ADMIN FUNCTIONS ---
  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:8000/api/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchOrders();
  };

  const saveProductChanges = async (product, updates) => {
    try {
      const res = await fetch(`http://localhost:8000/api/products/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, ...updates })
      });
      if (res.ok) {
        setDashboardMsg('Saved successfully!');
        fetchData();
        setTimeout(() => setDashboardMsg(''), 2000);
      }
    } catch (err) { setDashboardMsg('Error saving product'); }
  };

  // --- RENDER ---
  return (
    <div style={styles.app}>
      <Navbar 
        user={user} 
        setView={setView} 
        cartCount={cart.reduce((a, b) => a + b.qty, 0)} 
        isMenuOpen={isMenuOpen} 
        setIsMenuOpen={setIsMenuOpen}
        setSearchTerm={setSearchTerm}
      />

      <main style={{ minHeight: '80vh' }}>
        {view === 'shop' && (
          <Shop 
            products={products} 
            searchTerm={searchTerm} 
            addToCart={addToCart} 
            openComments={(p) => { /* Modal mantığı buraya eklenebilir */ }}
          />
        )}

        {(view === 'login' || view === 'register') && (
          <Auth 
            isRegistering={view === 'register'}
            setIsRegistering={(val) => setView(val ? 'register' : 'login')}
            authData={authData}
            setAuthData={setAuthData}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            authError={authError}
          />
        )}

        {['products', 'delivery', 'mDash'].includes(view) && (
          <AdminDashboard 
            view={view}
            products={products}
            orders={orders}
            categories={categories}
            fetchOrders={fetchOrders}
            updateStatus={updateStatus}
            saveProductChanges={saveProductChanges}
            dashboardMsg={dashboardMsg}
            setView={setView}
          />
        )}
      </main>
    </div>
  );
}

export default App;