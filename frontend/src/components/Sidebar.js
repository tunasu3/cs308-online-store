import React from 'react';

export default function Sidebar({ isMenuOpen, setIsMenuOpen, user, setUser, setView, cart, fetchOrders, loadPendingComments }) {
  const sidebarStyle = {
    position: 'fixed', top: 0, bottom: 0, left: isMenuOpen ? '0' : '-280px',
    width: '260px', backgroundColor: '#fff', boxShadow: '2px 0 12px rgba(0,0,0,0.1)',
    transition: 'left 0.3s ease', zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column'
  };

  const menuItemStyle = { padding: '12px 15px', cursor: 'pointer', borderRadius: '8px', marginBottom: '8px', fontWeight: '500', transition: '0.2s' };

  return (
    <div style={sidebarStyle}>
      <button onClick={() => setIsMenuOpen(false)} style={{ border: 'none', background: 'none', fontSize: '24px', alignSelf: 'flex-end', cursor: 'pointer' }}>×</button>
      <div style={{ marginBottom: '30px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
        <h3 style={{ margin: 0, color: '#007AFF' }}>{user ? user.name : "Guest"}</h3>
      </div>

      {(!user || user?.role === 'Customer') && (
        <>
          <div style={menuItemStyle} onClick={() => { setView('shop'); setIsMenuOpen(false) }}>🛍️ Shop</div>
          <div style={menuItemStyle} onClick={() => { setView('cart'); setIsMenuOpen(false) }}>🛒 My Cart ({cart.length})</div>
        </>
      )}

      {user?.role === 'ProductManager' && (
        <>
          <div style={menuItemStyle} onClick={() => { setView('products'); setIsMenuOpen(false) }}>📦 Product Management</div>
          <div style={menuItemStyle} onClick={() => { fetchOrders(); setView('delivery'); setIsMenuOpen(false) }}>🚚 Delivery Tracking</div>
          <div style={menuItemStyle} onClick={() => { loadPendingComments(); setIsMenuOpen(false) }}>🛡️ Review Approvals</div>
        </>
      )}

      <div style={{ marginTop: 'auto' }}>
        {!user ? (
          <button className="pro-btn" onClick={() => { setView('login'); setIsMenuOpen(false) }}>Login</button>
        ) : (
          <button className="pro-btn" style={{ background: '#ff3b30' }} onClick={() => { setUser(null); setView('shop'); localStorage.removeItem('token'); setIsMenuOpen(false); }}>Logout</button>
        )}
      </div>
    </div>
  );
}