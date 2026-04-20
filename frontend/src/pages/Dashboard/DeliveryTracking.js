import React from 'react';

export default function DeliveryTracking({ orders, updateStatus, deliveryMsg }) {
  return (
    <div className="pro-card">
      <h2>Delivery Tracking</h2>
      {deliveryMsg && <p style={{ color: deliveryMsg.startsWith('Error') ? 'red' : 'green' }}>{deliveryMsg}</p>}
      
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Order ID</th>
            <th style={{ padding: '12px' }}>Customer</th>
            <th style={{ padding: '12px' }}>Total</th>
            <th style={{ padding: '12px' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o._id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontSize: '12px', color: '#666' }}>{o._id}</td>
              <td style={{ padding: '12px' }}>{o.userName}</td>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{o.totalPrice?.toLocaleString()} $</td>
              <td style={{ padding: '12px' }}>
                <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)} style={{ padding: '6px', borderRadius: '4px' }}>
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}