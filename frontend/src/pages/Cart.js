import React, { useState, useEffect } from 'react';

export default function Cart({ cart, setCart, setView, user }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', address: '', cardNumber: '', expiry: '', cvv: '' });
  const [paymentStatus, setPaymentStatus] = useState(null); 

  
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const removeItem = (id) => {
  setCart(cart.filter(item => item._id !== id));
};

const updateQty = (id, newQty) => {
  if (newQty < 1) {
    removeItem(id);
    return;
  }
  setCart(cart.map(item => 
    item._id === id ? { ...item, qty: newQty } : item
  ));
};

  
  useEffect(() => {
    if (user) {
      setCheckoutData(prev => ({ ...prev, name: user.fullName || '', address: user.address || '' }));
    }
  }, [user]);

  const handleMockBankingPayment = async (e) => {
    e.preventDefault();
    setPaymentStatus('processing');

    setTimeout(async () => {
      if(checkoutData.cardNumber.length === 16 && checkoutData.cvv.length === 3) {
        setPaymentStatus('success');
        try {
          await fetch('http://localhost:8000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userId: user._id,
              userName: user.fullName || checkoutData.name,
              userEmail: user.email || '',
              items: cart.map(item => ({
                productId: item._id,
                name: item.name,
                price: item.price,
                quantity: item.qty
              })),
              totalPrice: total,
              deliveryAddress: checkoutData.address
            })
          });
        } catch (err) { console.error("Order processing error", err); }
      } else {
        setPaymentStatus('fail');
      }
    }, 2000);
  };
  const generateInvoice = () => {
  alert(`Invoice Generated!\nCustomer: ${checkoutData.name}\nTotal: $${total}\nOrder Confirmed.`);
  setCart([]);
  setShowCheckout(false);
  setView('shop');
};

  if (showCheckout) {
    
    if (paymentStatus === 'success') {
      return (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: '#fff', borderRadius: '15px' }}>
          <h2 style={{ color: '#10b981' }}>✅ Payment Successful!</h2>
          <p>Your order has been confirmed.</p>
          <button onClick={generateInvoice} style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            View / Download Invoice
          </button>
        </div>
      );
    }

    
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', backgroundColor: '#fff', borderRadius: '15px' }}>
        <h2>Checkout</h2>
        <div style={{ marginBottom: '20px', fontSize: '18px' }}>Total to Pay: <strong>${total}</strong></div>
        
        {paymentStatus === 'fail' && <div style={{ color: 'red', marginBottom: '15px' }}>❌ Invalid card details. Transaction rejected.</div>}
        
        <form onSubmit={handleMockBankingPayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h4 style={{ margin: '0' }}>Delivery Information</h4>
          <input type="text" placeholder="Full Name" required value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
          <textarea placeholder="Delivery Address" required value={checkoutData.address} onChange={e => setCheckoutData({...checkoutData, address: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', minHeight: '80px' }} />
          
          <h4 style={{ marginTop: '10px', marginBottom: '0' }}>Credit Card Details</h4>
          <input type="text" placeholder="Card Number (16 Digits)" maxLength="16" required value={checkoutData.cardNumber} onChange={e => setCheckoutData({...checkoutData, cardNumber: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="text" placeholder="MM/YY" required value={checkoutData.expiry} onChange={e => setCheckoutData({...checkoutData, expiry: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }} />
            <input type="text" placeholder="CVV (3 Digits)" maxLength="3" required value={checkoutData.cvv} onChange={e => setCheckoutData({...checkoutData, cvv: e.target.value})} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }} />
          </div>

          <button type="submit" disabled={paymentStatus === 'processing'} style={{ padding: '15px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>
            {paymentStatus === 'processing' ? 'Processing Payment...' : 'Complete Payment'}
          </button>
        </form>
        <button onClick={() => setShowCheckout(false)} style={{ width: '100%', background: 'none', border: 'none', marginTop: '15px', cursor: 'pointer', color: '#666' }}>Cancel</button>
      </div>
    );
  }

  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>My Cart</h1>
      {cart.length === 0 ? <p>Your cart is empty.</p> : (
        <>
          {cart.map(item => (
  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#fff', borderBottom: '1px solid #eee', marginBottom: '10px', borderRadius: '8px' }}>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: '600', marginBottom: '5px' }}>{item.name}</div>
      <div style={{ color: '#666', fontSize: '14px' }}>${item.price} each</div>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
      <button 
        onClick={() => updateQty(item._id, item.qty - 1)}
        style={{ width: '30px', height: '30px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9fafb', cursor: 'pointer', fontWeight: 'bold' }}
      >
        −
      </button>
      <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.qty}</span>
      <button 
        onClick={() => updateQty(item._id, item.qty + 1)}
        style={{ width: '30px', height: '30px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#f9fafb', cursor: 'pointer', fontWeight: 'bold' }}
      >
        +
      </button>
    </div>

    <span style={{ fontWeight: 'bold', minWidth: '70px', textAlign: 'right', marginRight: '15px' }}>
      ${item.price * item.qty}
    </span>

    <button 
      onClick={() => removeItem(item._id)}
      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600', padding: '8px 12px' }}
    >
      Remove
    </button>
  </div>
))}
          <div style={{ textAlign: 'right', fontSize: '24px', fontWeight: '700', margin: '20px 0' }}>Total: ${total}</div>
          {!user && (
  <div style={{ padding: '15px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '15px', color: '#92400e', textAlign: 'center' }}>
    🔒 You must sign in to complete your purchase.
  </div>
)}
<button
  onClick={() => {
    if (!user) {
      setView('login');
    } else {
      setShowCheckout(true);
    }
  }}
  style={{
    width: '100%',
    padding: '15px',
    backgroundColor: user ? '#111' : '#6b7280',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer'
  }}
>
  {user ? 'Buy Now (Checkout)' : 'Sign In to Checkout'}
</button>
        </>
      )}
    </div>
  );
}