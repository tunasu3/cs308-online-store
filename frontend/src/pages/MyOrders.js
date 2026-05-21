import React, { useState, useEffect } from 'react';

export default function MyOrders({ user, setView, products, setSelectedProduct }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  
  const fetchOrders = () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

   
    let url = `http://localhost:8000/api/orders/user/${user._id}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const downloadInvoice = (orderId) => {
    window.open(`http://localhost:8000/api/orders/${orderId}/invoice`, '_blank');
  };
  const downloadAllInvoices = () => {
      let url = `http://localhost:8000/api/orders/user/${user._id}/invoices/download`;
    
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }
      window.open(url, '_blank');
    };
  const handleProductClick = (productId) => {
    const product = products.find(p => p._id === productId);
    if (product) {
      setSelectedProduct(product);
      setView('productDetail');
    } else {
      alert('This product is no longer available in the store.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return { bg: '#d1fae5', text: '#065f46' };
      case 'In-Transit': return { bg: '#dbeafe', text: '#1e40af' };
      case 'Processing':
      default: return { bg: '#fef3c7', text: '#92400e' };
    }
  };

  if (!user) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', textAlign: 'center' }}>
        <h2>My Orders</h2>
        <div style={{ padding: '20px', backgroundColor: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginTop: '20px', color: '#92400e' }}>
          🔒 Please sign in to view your order history.
        </div>
        <button
          onClick={() => setView('login')}
          style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
        >
          Sign In
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#666' }}>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button
        onClick={() => setView('shop')}
        style={{ marginBottom: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#3b82f6' }}
      >
        ← Back to Shop
      </button>

      <h1 style={{ marginBottom: '10px' }}>My Orders</h1>

      {}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '25px', alignItems: 'center', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
        <label style={{ fontSize: '14px', color: '#4b5563' }}>
          From: <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', marginLeft: '5px' }} />
        </label>
        <label style={{ fontSize: '14px', color: '#4b5563' }}>
          To: <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db', marginLeft: '5px' }} />
        </label>
        <button 
          onClick={fetchOrders} 
          style={{ padding: '8px 16px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          Filter Invoices
        </button>
        {}
        <button 
          onClick={downloadAllInvoices} 
          style={{ padding: '8px 16px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
        >
          Download All Invoices (PDF)
        </button>

        {(startDate || endDate) && (
          <button 
            onClick={() => { setStartDate(''); setEndDate(''); setTimeout(fetchOrders, 0); }} 
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px' }}
          >
            Clear
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: '40px', backgroundColor: '#fff', borderRadius: '15px', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '16px' }}>No orders found for this criteria.</p>
          <button
            onClick={() => setView('shop')}
            style={{ marginTop: '15px', padding: '12px 24px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        orders.map(order => {
          const statusColors = getStatusColor(order.status);
          return (
            <div
              key={order._id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '25px',
                marginBottom: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>ORDER ID</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '600' }}>
                    #{order._id.substring(0, 12).toUpperCase()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: statusColors.bg,
                  color: statusColors.text
                }}>
                  {order.status || 'Processing'}
                </span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                {order.items && order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid #f5f5f5'
                    }}
                  >
                    <div>
                      <div
                        onClick={() => handleProductClick(item.productId)}
                        style={{
                          fontWeight: '600',
                          cursor: 'pointer',
                          color: '#3b82f6',
                          textDecoration: 'none',
                          display: 'inline-block'
                        }}
                        onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                      >
                        {item.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#888' }}>
                        Qty: {item.quantity} × ${item.price}
                      </div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#888' }}>TOTAL</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>
                    ${order.totalPrice?.toLocaleString()} 
                  </div>
                </div>
                <button
                  onClick={() => downloadInvoice(order._id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  📄 Download Invoice
                </button>
              </div>

              {order.deliveryAddress && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                  <strong>Deliver to:</strong> {order.deliveryAddress}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}