import React, { useState, useEffect } from 'react';

export default function RefundEvaluation({ fetchData }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchRefundRequests = () => {
    setLoading(true);
    fetch('http://localhost:8000/api/orders/sales/refund-requests')
      .then((res) => res.json())
      .then((data) => {
        setRequests(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const handleEvaluation = (orderId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this refund request?`)) return;

    fetch(`http://localhost:8000/api/orders/${orderId}/refund-evaluate`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessage(`Success: Request has been ${action}d!`);
        fetchRefundRequests();
        if (fetchData) fetchData();
        setTimeout(() => setMessage(''), 4000);
      })
      .catch((err) => console.error(err));
  };

  if (loading) return <div style={{ padding: '20px', color: '#666' }}>Loading refund requests...</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', color: '#111' }}>
        Refund Evaluation Panel
      </h1>
      <p style={{ color: '#666', marginBottom: '25px' }}>
        As a Sales Manager, evaluate incoming refund requests and restock products automatically upon approval.
      </p>

      {message && (
        <div style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '6px', marginBottom: '20px', fontWeight: '500' }}>
          {message}
        </div>
      )}

      {requests.length === 0 ? (
        <div style={{ padding: '30px', backgroundColor: '#f9fafb', border: '1px dashed #ced4da', borderRadius: '8px', textAlign: 'center', color: '#666' }}>
          🎉 No pending refund requests found.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {requests.map((order) => (
            <div
              key={order._id}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>ORDER ID:</span>{' '}
                  <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>#{order._id.toUpperCase()}</span>
                  <div style={{ fontSize: '13px', color: '#4b5563', marginTop: '4px' }}>
                    Customer: <strong>{order.userName}</strong> ({order.userEmail})
                  </div>
                </div>
                <span style={{ padding: '6px 12px', backgroundColor: '#fef3c7', color: '#d97706', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                  {order.status}
                </span>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>ITEMS IN THIS ORDER:</span>
                <div style={{ marginTop: '5px' }}>
                  {order.items.map((item, idx) => {
                    const isTargetRefund = item.refundStatus === 'Refund Requested' || order.status === 'Refund Requested';
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          fontSize: '14px', 
                          padding: '10px', 
                          backgroundColor: isTargetRefund ? '#fef2f2' : '#fff', 
                          border: isTargetRefund ? '1px solid #fee2e2' : '1px solid #f3f4f6',
                          borderRadius: '6px',
                          marginBottom: '6px'
                        }}
                      >
                        <span>
                          {isTargetRefund ? '🚨 [RETURN REQUESTED] ' : '📦 '} 
                          <strong>{item.name}</strong> x{item.quantity}
                        </span>
                        <span style={{ fontWeight: '600', color: isTargetRefund ? '#dc2626' : '#374151' }}>
                          {item.price * item.quantity} TL
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f3f4f6' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#9ca3af' }}>TOTAL REFUND AMOUNT</span>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>{order.totalPrice} TL</div>
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => handleEvaluation(order._id, 'reject')}
                    style={{ padding: '10px 18px', backgroundColor: '#f3f4f6', color: '#1f2937', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                  >
                    ❌ Reject Refund
                  </button>
                  <button
                    onClick={() => handleEvaluation(order._id, 'approve')}
                    style={{ padding: '10px 18px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                  >
                    ✅ Approve & Restock
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}