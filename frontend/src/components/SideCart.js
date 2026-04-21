import React from 'react';

export default function SideCart({ isOpen, onClose, cartItems, setCart, setView }) {
  if (!isOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const removeItem = (id) => {
    setCart(cartItems.filter(item => item._id !== id));
  };

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: '300px', backgroundColor: '#fff', boxShadow: '-2px 0 5px rgba(0,0,0,0.1)', zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h2 style={{ margin: 0 }}>Your Cart</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', marginTop: '20px' }}>
        {cartItems.length === 0 ? <p>Your cart is empty.</p> : cartItems.map(item => (
          <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
            <div>
              <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{item.name}</p>
              <p style={{ margin: 0, color: '#666' }}>{item.qty} x ${item.price}</p>
            </div>
            <button onClick={() => removeItem(item._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <h3 style={{ margin: '0 0 15px 0' }}>Total: ${total}</h3>
        <button onClick={() => { setView('cart'); onClose(); }} style={{ width: '100%', padding: '15px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Go to Checkout</button>
      </div>
    </div>
  );
}