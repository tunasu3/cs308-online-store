import React from 'react';

export default function Sidebar({ isMenuOpen, setIsMenuOpen, user, setUser, setView }) {
  if (!isMenuOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: '250px', backgroundColor: '#111', color: '#fff', zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <button onClick={() => setIsMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', alignSelf: 'flex-end', marginBottom: '30px' }}>
        Close ✕
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <button onClick={() => { setView('shop'); setIsMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', textAlign: 'left', cursor: 'pointer' }}>Shop</button>
        <button onClick={() => { setView('cart'); setIsMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '18px', textAlign: 'left', cursor: 'pointer' }}>My Cart</button>
        
        <hr style={{ borderColor: '#333', width: '100%', margin: '10px 0' }} />
        <span style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Admin Panel</span>
        
        <button onClick={() => { setView('products'); setIsMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '16px', textAlign: 'left', cursor: 'pointer' }}>Product Management</button>
        <button onClick={() => { setView('delivery'); setIsMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '16px', textAlign: 'left', cursor: 'pointer' }}>Delivery & Orders</button>
        <button onClick={() => { setView('reviews'); setIsMenuOpen(false); }} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '16px', textAlign: 'left', cursor: 'pointer' }}>Review Approvals</button>
      </div>

      <div style={{ marginTop: 'auto' }}>
        {user ? (
          <button onClick={() => { setUser(null); setView('shop'); setIsMenuOpen(false); }} style={{ width: '100%', padding: '10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
        ) : (
          <button onClick={() => { setView('login'); setIsMenuOpen(false); }} style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Login</button>
        )}
      </div>
    </div>
  );
}