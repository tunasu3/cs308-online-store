import React from 'react';

export default function Cart({ cart, setCart, setShowCheckout }) {
  return (
    <div className="pro-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2>My Cart</h2>
      {cart.length === 0 ? (
        <p style={{ color: '#999' }}>Your cart is currently empty.</p>
      ) : (
        cart.map(item => (
          <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', alignItems: 'center' }}>
            <span style={{ fontWeight: '500' }}>{item.name} (x{item.qty})</span>
            <span style={{ color: '#007AFF', fontWeight: 'bold' }}>{(item.price * item.qty).toLocaleString()} $</span>
            <button onClick={() => setCart(cart.filter(i => i._id !== item._id))} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
          </div>
        ))
      )}
      
      {cart.length > 0 && (
        <>
          <h3 style={{ textAlign: 'right', marginTop: '20px' }}>
            Total: {cart.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString()} $
          </h3>
          <button className="pro-btn" style={{ marginTop: '15px', background: '#28a745' }} onClick={() => setShowCheckout(true)}>
            ✅ Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}