import React, { useState, useEffect } from 'react';

const formatPrice = (num) => {
  const value = Number(num);
  const rounded = Math.round(value * 100) / 100;

  return rounded % 1 === 0
    ? rounded.toLocaleString()
    : rounded.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
};

export default function Cart({ cart, setCart, setView, user }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: '', address: '', cardNumber: '', expiry: '', cvv: '' });
  const [paymentStatus, setPaymentStatus] = useState(null); 
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);

  const total = cart.reduce(
     (sum, item) => sum + ((item.finalPrice !== undefined ? item.finalPrice : item.price) * item.qty),
     0
    );
  
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
        } catch (err) { console.error(err); }
      } else {
        setPaymentStatus('fail');
      }
    }, 2000);
  };

  const handleFinishShopping = () => {
    setInvoiceDownloaded(true);
    setTimeout(() => {
      setCart([]);
      setShowCheckout(false);
      setView('shop');
    }, 1500);
  };

  if (showCheckout) {
    if (paymentStatus === 'success') {
      return (
        <div style={{ textAlign: 'center', padding: '60px 40px', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', maxWidth: '500px', margin: '60px auto' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
          <h2 style={{ color: '#10b981', fontSize: '24px', marginBottom: '12px', fontWeight: '700' }}>Payment Successful!</h2>
          <p style={{ color: '#4b5563', fontSize: '15px', marginBottom: '32px' }}>Your order has been confirmed and is being processed.</p>
          
          {invoiceDownloaded ? (
             <div style={{ color: '#4f46e5', fontWeight: '600', padding: '12px', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>Invoice downloaded! Redirecting...</div>
          ) : (
            <button onClick={handleFinishShopping} style={{ width: '100%', padding: '14px 24px', backgroundColor: '#111827', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px' }}>
              Download Invoice & Return
            </button>
          )}
        </div>
      );
    }

    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ fontSize: '24px', color: '#111827', marginBottom: '8px', fontWeight: '700' }}>Checkout</h2>
        <div style={{ marginBottom: '32px', fontSize: '16px', color: '#4b5563' }}>Total Amount: <strong style={{ color: '#111827', fontSize: '20px' }}>${formatPrice(total)}</strong></div>
        
        {paymentStatus === 'fail' && (
          <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '14px', borderRadius: '8px', marginBottom: '24px', textAlign: 'center', fontWeight: '500', fontSize: '14px', border: '1px solid #fecaca' }}>
            Invalid card details. Transaction rejected.
          </div>
        )}
        
        <form onSubmit={handleMockBankingPayment} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Delivery Details</h4>
            <input type="text" placeholder="Full Name" required value={checkoutData.name} onChange={e => setCheckoutData({...checkoutData, name: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }} />
            <textarea placeholder="Delivery Address" required value={checkoutData.address} onChange={e => setCheckoutData({...checkoutData, address: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', minHeight: '100px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }} />
          </div>

          <div>
            <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase' }}>Payment Information</h4>
            <input type="text" placeholder="Card Number (16 Digits)" maxLength="16" required value={checkoutData.cardNumber} onChange={e => setCheckoutData({...checkoutData, cardNumber: e.target.value})} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', marginBottom: '12px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '16px' }}>
              <input type="text" placeholder="MM/YY" required value={checkoutData.expiry} onChange={e => setCheckoutData({...checkoutData, expiry: e.target.value})} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', flex: 1 }} />
              <input type="text" placeholder="CVV" maxLength="3" required value={checkoutData.cvv} onChange={e => setCheckoutData({...checkoutData, cvv: e.target.value})} style={{ padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', flex: 1 }} />
            </div>
          </div>

          <button type="submit" disabled={paymentStatus === 'processing'} style={{ padding: '16px', backgroundColor: '#111827', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '16px', cursor: paymentStatus === 'processing' ? 'not-allowed' : 'pointer', marginTop: '8px', transition: 'background 0.2s' }}>
            {paymentStatus === 'processing' ? 'Processing...' : `Pay $${formatPrice(total)}` }
          </button>
        </form>
        <button onClick={() => setShowCheckout(false)} style={{ width: '100%', background: 'none', border: 'none', marginTop: '20px', cursor: 'pointer', color: '#6b7280', fontWeight: '500' }}>Return to Cart</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ fontSize: '28px', color: '#111827', marginBottom: '32px', fontWeight: '700' }}>My Cart</h1>
      
      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '20px' }}>Your cart is currently empty.</p>
          <button onClick={() => setView('shop')} style={{ padding: '10px 24px', backgroundColor: '#111827', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Continue Shopping</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map(item => (
              <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {item.image && (
                    <img src={item.image} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                  )}
                  <div>
                    <div style={{ fontWeight: '600', color: '#111827', marginBottom: '6px', fontSize: '16px' }}>{item.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>${formatPrice(item.finalPrice !== undefined ? item.finalPrice : item.price)} each</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginRight: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                    <button 
                      onClick={() => updateQty(item._id, item.qty - 1)}
                      style={{ width: '36px', height: '36px', border: 'none', backgroundColor: '#f9fafb', cursor: 'pointer', color: '#374151', fontSize: '16px', borderRight: '1px solid #e5e7eb' }}
                    >
                      −
                    </button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: '500', color: '#111827' }}>{item.qty}</span>
                    <button 
                      onClick={() => updateQty(item._id, item.qty + 1)}
                      style={{ width: '36px', height: '36px', border: 'none', backgroundColor: '#f9fafb', cursor: 'pointer', color: '#374151', fontSize: '16px', borderLeft: '1px solid #e5e7eb' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                  <span style={{ fontWeight: '700', minWidth: '80px', textAlign: 'right', color: '#111827', fontSize: '18px' }}>
                    ${formatPrice((item.finalPrice !== undefined ? item.finalPrice : item.price) * item.qty)}
                  </span>
                  <button 
                    onClick={() => removeItem(item._id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '500', padding: '8px' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '32px' }}>
            <div style={{ fontSize: '20px', color: '#4b5563', marginBottom: '24px' }}>
              Subtotal: <span style={{ fontSize: '28px', fontWeight: '700', color: '#111827', marginLeft: '12px' }}>${formatPrice(total)}</span>
            </div>

            {/* YENİ ŞIK UYARI MESAJI VE GİRİŞ YAP BAĞLANTISI */}
            {!user && (
              <div style={{ width: '100%', maxWidth: '400px', padding: '16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', marginBottom: '20px', color: '#b45309', textAlign: 'center', fontWeight: '500' }}>
                You must <button onClick={() => setView('login')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', padding: '0 4px', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>Sign In</button> to complete your purchase.
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
                maxWidth: '400px',
                padding: '16px',
                backgroundColor: user ? '#111827' : '#e5e7eb',
                color: user ? '#ffffff' : '#9ca3af',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: user ? 'pointer' : 'not-allowed'
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}