import React from 'react';

export default function DeliveryTracking({ orders, fetchData }) {
  const updateItemStatus = async (orderId, itemId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemStatus: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '25px', backgroundColor: '#fff', borderRadius: '15px' }}>
      <h2 style={{ marginBottom: '20px' }}>Delivery & Order Tracking</h2>
      
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee', backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '12px' }}>Order ID</th>
            <th>Customer</th>
            <th>Products & Item Delivery Status</th>
            <th>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {orders && orders.length > 0 ? orders.map(order => (
            <tr key={order._id} style={{ borderBottom: '1px solid #eee', verticalAlign: 'top' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>#{order._id.substring(0, 8)}</td>
              <td>
                <div style={{ fontWeight: '500' }}>{order.userName || 'Guest'}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{order.userEmail}</div>
              </td>
              <td style={{ padding: '12px 0' }}>
                {order.items && order.items.map(item => (
                  <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f5f5f5', gap: '15px' }}>
                    <span style={{ fontSize: '14px' }}>
                      {item.name} <strong style={{ color: '#666' }}>x{item.quantity}</strong>
                    </span>
                    <select
                      value={item.itemStatus || 'Processing'}
                      onChange={(e) => updateItemStatus(order._id, item._id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px' }}
                    >
                      <option value="Processing">📦 Processing</option>
                      <option value="In-Transit">🚚 In-Transit</option>
                      <option value="Delivered">✅ Delivered</option>
                      <option value="Refund Requested">↩️ Refund Requested</option>
                      <option value="Refunded">💰 Refunded</option>
                      <option value="Refund Rejected">❌ Refund Rejected</option>
                      <option value="Cancelled">🚫 Cancelled</option>
                    </select>
                  </div>
                ))}
              </td>
              <td style={{ fontWeight: 'bold', color: '#10b981', paddingTop: '12px' }}>${order.totalPrice}</td>
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