import React from 'react';

export default function DeliveryTracking({ orders, fetchData }) {
  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData(); 
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '15px' }}>
      <h2 style={{ marginBottom: '20px' }}>Delivery & Order Tracking</h2>
      
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px' }}>Order ID</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Delivery Status</th>
          </tr>
        </thead>
        <tbody>
          {orders && orders.length > 0 ? orders.map(order => (
            <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>#{order._id.substring(0, 8)}</td>
              <td>{order.customerName || 'Guest'}</td>
              <td style={{ fontWeight: 'bold', color: '#10b981' }}>${order.totalAmount}</td>
              <td>
                <select 
                  value={order.status || 'Processing'} 
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ddd', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
                >
                  <option value="Processing">📦 Processing</option>
                  <option value="Shipped">🚚 Shipped</option>
                  <option value="Delivered">✅ Delivered</option>
                  <option value="Cancelled">❌ Cancelled</option>
                </select>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}