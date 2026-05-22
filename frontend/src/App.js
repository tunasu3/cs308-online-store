import React, { useState, useEffect, useCallback } from 'react';
import { useCookies } from 'react-cookie'
import Navbar from './components/Navbar';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import AuthCard from './pages/AuthCard';
import ProductManager from './pages/Dashboard/ProductManager';
import SalesManager from './pages/Dashboard/SalesManager';
import Cart from './pages/Cart';
import MyOrders from './pages/MyOrders';
import Wishlist from './pages/Wishlist';
import RefundEvaluation from './pages/Dashboard/RefundEvaluation'; 

export default function App() {
  const [cookies, setCookie, removeCookie] = useCookies(["sessionToken"]);

  const [view, setView] = useState('shop');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authData, setAuthData] = useState({ email: '', password: '', fullName: '', taxId: '', address: '' });
  const [wishlistCount, setWishlistCount] = useState(0);

  const verifySession = useCallback(async () => {
    if (cookies.sessionToken) {
      try {
        const res = await fetch('http://localhost:8000/api/auth/verifySession', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: cookies.sessionToken })
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
        } else {
          alert(data.message);
          removeCookie("sessionToken");
        }
      } catch (err) { 
        console.error(err); 
      }
    }
  }, [cookies]);
  useEffect(() => { verifySession(); }, [])

  const updateWishlistCount = useCallback(async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await fetch(`http://localhost:8000/api/wishlist/${user._id}`);
      const data = await res.json();
      setWishlistCount(data.length || 0);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  const fetchData = useCallback(async () => {
    try {
      const pRes = await fetch('http://localhost:8000/api/products');
      const cRes = await fetch('http://localhost:8000/api/categories');
      setProducts(await pRes.json());
      setCategories(await cRes.json());
      updateWishlistCount();
    } catch (err) { 
      console.error(err); 
    }
  }, [updateWishlistCount]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

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
        setCookie("sessionToken", data.token, { expiresIn: 7 * 24 * 60 * 60 });
        setView('shop');
      } else { 
        alert(data.message); 
      }
    } catch (err) { 
      console.error(err); 
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authData.fullName,
          email: authData.email,
          password: authData.password,
          taxID: authData.taxId,
          homeAddress: authData.address
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setCookie("sessionToken", data.token, { expiresIn: 7 * 24 * 60 * 60 });
        setView('shop');
        alert('Registration successful! You are now logged in.');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Is the backend running?');
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
        wishlistCount={wishlistCount}
      />

      {}
      {isMenuOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '280px', height: '100%', backgroundColor: '#fff', zIndex: 1000, padding: '30px', boxShadow: '5px 0 15px rgba(0,0,0,0.1)' }}>
          <button onClick={() => setIsMenuOpen(false)} style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }}>✕</button>
          <h3 style={{ marginTop: '40px' }}>Menu</h3>
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
            <li onClick={() => { setView('shop'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid #eee' }}>Shop</li>
            
            {(user?.role === 'ProductManager' || user?.role === 'SalesManager' || user?.role === 'Admin') && (
              <>
                <li onClick={() => { setView('products'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}>
                  Product Manager Dashboard
                </li>
                <li onClick={() => { setView('salesManager'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}>
                  Sales Manager Dashboard
                </li>
                {}
                <li onClick={() => { setView('refundEvaluation'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', color: '#2563eb', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Refund Evaluation
                </li>
              </>
            )}

            {user && (
              <li onClick={() => { setView('myOrders'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', borderBottom: '1px solid #eee' }}>
                  My Orders
              </li>
            )}

            {user && (
              <li onClick={() => { setUser(null); removeCookie("sessionToken"); setView('shop'); setIsMenuOpen(false); }} style={{ padding: '12px 0', cursor: 'pointer', color: '#666' }}>Logout</li>
            )}
          </ul>
        </div>
      )}

      {}
      <main style={{ padding: '20px 5%' }}>
        {view === 'shop' && <Shop products={products} categories={categories} searchTerm={searchTerm} addToCart={addToCart} setView={setView} setSelectedProduct={setSelectedProduct} user={user} updateWishlistCount={updateWishlistCount} />}
        {view === 'wishlist' && (
          <Wishlist 
            user={user} 
            addToCart={addToCart} 
            setView={setView} 
            setSelectedProduct={setSelectedProduct} 
            updateWishlistCount={updateWishlistCount} 
          />
        )}
        {view === 'cart' && <Cart cart={cart} setCart={setCart} user={user} setView={setView} fetchData={fetchData} />}
        {view === 'productDetail' && <ProductDetail product={selectedProduct} addToCart={addToCart} setView={setView} user={user} fetchData={fetchData} updateWishlistCount={updateWishlistCount} />}
        {view === 'myOrders' && <MyOrders user={user} setView={setView} products={products} setSelectedProduct={setSelectedProduct} />}
        {view === 'salesManager' && (user?.role === 'ProductManager' || user?.role === 'SalesManager' || user?.role === 'Admin' ? <SalesManager fetchData={fetchData} products={products} /> : <Shop products={products} categories={categories} searchTerm={searchTerm} addToCart={addToCart} setView={setView} setSelectedProduct={setSelectedProduct} user={user} updateWishlistCount={updateWishlistCount} />)}

        {}
{view === 'refundEvaluation' && (
  (user?.role === 'ProductManager' || user?.role === 'SalesManager' || user?.role === 'Admin') ? (
    
    <RefundEvaluation fetchData={fetchData} />
  ) : (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <button onClick={() => setView('shop')} style={{ padding: '10px 20px', marginTop: '15px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Go Back Home</button>
    </div>
  )
)}

        {(view === 'login' || view === 'register') && (
          <AuthCard 
            view={view} 
            setView={setView} 
            handleLogin={handleLogin}
            handleRegister={handleRegister} 
            authData={authData} 
            setAuthData={setAuthData} 
          />
        )}

        {view === 'products' && (
          (user?.role === 'ProductManager' || user?.role === 'SalesManager' || user?.role === 'Admin') ? (
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