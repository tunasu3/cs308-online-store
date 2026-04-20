import React, { useState, useEffect } from 'react';
import './styles.css';

// Components & Pages
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Shop from './pages/Shop';
import Cart from './pages/Cart';
import AuthCard from './pages/AuthCard';
import ProductManager from './pages/Dashboard/ProductManager';
import DeliveryTracking from './pages/Dashboard/DeliveryTracking';
import ProductDetail from './pages/ProductDetail';

function App() {
  const [view, setView] = useState('shop');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Auth States
  const [authData, setAuthData] = useState({ name: '', email: '', password: '', fullName: '' });
  const [authError, setAuthError] = useState('');

  // Dashboard / Management States
  const [editedProducts, setEditedProducts] = useState({});
  const [dashboardMsg, setDashboardMsg] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [deliveryMsg, setDeliveryMsg] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchData();
    fetchCategories();
  }, []);


  const fetchData = async () => {
    try {
      const pRes = await fetch('http://localhost:8000/api/products');
      setProducts(await pRes.json());
    } catch (err) { console.error('Failed to fetch products:', err); }
  };

  const fetchCategories = async () => {
    try {
      const cRes = await fetch('http://localhost:8000/api/categories');
      setCategories(await cRes.json());
    } catch (err) { console.error('Failed to fetch categories:', err); }
  };

  const fetchOrders = async () => {
    try {
      const oRes = await fetch('http://localhost:8000/api/orders');
      setOrders(await oRes.json());
    } catch (err) { console.error('Failed to fetch orders:', err); }
  };

 
  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:8000/api/orders/${id}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    });
    fetchOrders(); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authData.email, password: authData.password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        setView(data.role === 'Customer' ? 'shop' : 'mDash');
      } else setAuthError(data.message || 'Login failed');
    } catch (err) { setAuthError('Failed to connect to server'); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: authData.fullName, email: authData.email, password: authData.password })
      });
      if (res.ok) { alert('Account created!'); setView('login'); } 
      else { const data = await res.json(); setAuthError(data.message || 'Registration failed'); }
    } catch (err) { setAuthError('Failed to connect to server'); }
  };

  const addToCart = (p) => {
    if (p.stock === 0) return;
    const found = cart.find(item => item._id === p._id);
    if (found) setCart(cart.map(i => i._id === p._id ? {...i, qty: i.qty + 1} : i));
    else setCart([...cart, {...p, qty: 1}]);
  };

 
  const handleProductFieldChange = (productId, field, value) => {
    setEditedProducts(prev => ({ ...prev, [productId]: { ...(prev[productId] || {}), [field]: value } }));
  };

  const saveProductChanges = async (product) => {
    const updates = editedProducts[product._id];
    if (!updates) return;
    try {
      await fetch(`http://localhost:8000/api/products/${product._id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...product, ...updates, stock: Number(updates.stock ?? product.stock), price: Number(updates.price ?? product.price) })
      });
      setDashboardMsg(`Saved changes for ${product.name}`);
      fetchData();
      setTimeout(() => setDashboardMsg(''), 2500);
    } catch (err) { setDashboardMsg(`Error: ${err.message}`); }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`http://localhost:8000/api/products/${productId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const openComments = () => { /* Review logic */ };
  const loadPendingComments = () => { /* Review approval logic */ };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingBottom: '50px' }}>
      
      <Sidebar isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} user={user} setUser={setUser} setView={setView} cart={cart} fetchOrders={fetchOrders} loadPendingComments={loadPendingComments} />
      
      <Navbar setIsMenuOpen={setIsMenuOpen} setView={setView} cart={cart} user={user} setSearchTerm={setSearchTerm} />

      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {view === 'shop' && <Shop products={products} searchTerm={searchTerm} addToCart={addToCart} setView={setView} setSelectedProduct={setSelectedProduct} />}
        
        {view === 'productDetail' && selectedProduct && <ProductDetail product={selectedProduct} addToCart={addToCart} setView={setView} />}
        
        {(view === 'login' || view === 'register') && <AuthCard view={view} setView={setView} handleLogin={handleLogin} handleRegister={handleRegister} authData={authData} setAuthData={setAuthData} authError={authError} />}
        
        {view === 'cart' && <Cart cart={cart} setCart={setCart} setShowCheckout={setShowCheckout} />}
        
        {view === 'products' && <ProductManager products={products} categories={categories} dashboardMsg={dashboardMsg} setShowAddProduct={setShowAddProduct} setShowAddCategory={setShowAddCategory} handleProductFieldChange={handleProductFieldChange} saveProductChanges={saveProductChanges} deleteProduct={deleteProduct} />}
        
        {view === 'delivery' && <DeliveryTracking orders={orders} updateStatus={updateStatus} deliveryMsg={deliveryMsg} />}
        
      </main>
    </div>
  );
}

export default App;