import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import AuthCard from './pages/AuthCard';
import ProductManager from './pages/Dashboard/ProductManager';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';

export default function App() {
  const [view, setView] = useState('shop');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authData, setAuthData] = useState({ email: '', password: '', fullName: '', taxId: '', address: '' });
  
  const addToCart = (product) => {
  setCart(prevCart => {
    const existing = prevCart.find(item => item._id === product._id);
    if (existing) {
      return prevCart.map(item =>
        item._id === product._id ? { ...item, qty: item.qty + 1 } : item
      );
    }
    return [...prevCart, { ...product, qty: 1 }];
  });
};
  const fetchData = async () => {
    try {
      const pRes = await fetch('http://localhost:8000/api/products');
      const cRes = await fetch('http://localhost:8000/api/categories');
      setProducts(await pRes.json());
      setCategories(await cRes.json());
    } catch (err) { 
      console.error(err); 
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authData.email, password: authData.password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setView('shop');
      } else { 
        alert(data.message); 
      }
    } catch (err) { 
      console.error(err); 
    }
  };

  const deleteProduct = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      await fetch(`http://localhost:8000/api/products/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) { 
      console.error(err); 
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      <Navbar 
        setView={setView} 
        cart={cart} 
        user={user} 
        setSearchTerm={setSearchTerm} 
        setIsCartOpen={() => setView('cart')} 
        setIsMenuOpen={setIsMenuOpen} 
      />

      {isMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '280px', height: '100%', backgroundColor: '#fff', zIndex: 1000, padding: '30px', boxShadow: '5px 0 15px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setIsMenuOpen(false)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
          <h3 style={{ marginTop: '40px' }}>Menu</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
            <li onClick={() => { setView('shop'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid #eee' }}>Shop</li>
            
            {user?.role === 'ProductManager' && (
              <li onClick={() => { setView('products'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}>
                🛡️ ProductManager Dashboard
              </li>
            )}

            {user && (
  <li onClick={() => { setView('myOrders'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
    📦 My Orders
  </li>
)}

{user && (
  <li onClick={() => { setUser(null); setView('shop'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', color: '#666' }}>Logout</li>
)}
          </ul>
        </div>
      )}

      <main style={{ padding: '20px 5%' }}>
        {view === 'shop' && <Shop products={products} categories={categories} searchTerm={searchTerm} addToCart={addToCart} setView={setView} setSelectedProduct={setSelectedProduct} />}
        {view === 'cart' && <Cart cart={cart} setCart={setCart} user={user} setView={setView} />}
        {view === 'productDetail' && <ProductDetail product={selectedProduct} addToCart={addToCart} setView={setView} user={user} />}
        {view === 'myOrders' && <MyOrders user={user} setView={setView} />}

        {(view === 'login' || view === 'register') && (
          <AuthCard 
            view={view} 
            setView={setView} 
            handleLogin={handleLogin} 
            authData={authData} 
            setAuthData={setAuthData} 
          />
        )}

        {view === 'products' && (
          user?.role === 'ProductManager' ? (
            <ProductManager products={products} categories={categories} fetchData={fetchData} deleteProduct={deleteProduct} />
          ) : (
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h2>Access Denied</h2>
              <p>You don't have permission to view this page.</p>
              <button onClick={() => setView('shop')} style={{ padding: '10px 20px', marginTop: '15px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Go Back Home</button>
            </div>
          )
        )}
      </main>
    </div>
  );
}