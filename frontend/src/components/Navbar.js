import React from 'react';

export default function Navbar({ setIsMenuOpen, setView, cart, user, setSearchTerm }) {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button onClick={() => setIsMenuOpen(true)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>☰</button>
        <h1 style={{ margin: 0, fontSize: '20px', color: '#007AFF', cursor: 'pointer' }} onClick={() => setView('shop')}>Store</h1>
      </div>

      <input 
        type="text" 
        placeholder="Search products..." 
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '10px 15px', borderRadius: '20px', border: '1px solid #ddd', width: '40%', minWidth: '200px' }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ cursor: 'pointer', fontWeight: '500' }} onClick={() => setView('cart')}>
          🛒 Cart ({cart.length})
        </div>
        {!user ? (
          <button className="pro-btn" style={{ padding: '8px 15px', width: 'auto' }} onClick={() => setView('login')}>Login</button>
        ) : (
          <span style={{ fontWeight: '500', color: '#333' }}>Hi, {user.name}</span>
        )}
      </div>
    </nav>
  );
}