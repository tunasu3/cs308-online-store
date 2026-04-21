import React, { useState, useEffect } from 'react';

export default function ReviewApprovals() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setReviews([
      { id: 1, user: 'John Doe', product: 'Gaming Laptop', text: 'Great product, very fast!', status: 'Pending' },
      { id: 2, user: 'Jane Smith', product: 'Mechanical Keyboard', text: 'Delivery was a bit late but the item is good.', status: 'Pending' }
    ]);
  }, []);

  const handleApprove = (id) => {
    setReviews(reviews.map(r => r.id === id ? { ...r, status: 'Approved' } : r));
    alert('Review approved and published.');
  };

  const handleReject = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
    alert('Review rejected and deleted.');
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px' }}>
      <h2 style={{ marginBottom: '20px' }}>Review Approvals (Moderation)</h2>
      
      {reviews.length === 0 ? (
        <p style={{ color: '#666' }}>No new reviews pending approval.</p>
      ) : (
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '12px' }}>Customer</th>
              <th>Product</th>
              <th>Review</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(review => (
              <tr key={review.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{review.user}</td>
                <td>{review.product}</td>
                <td style={{ maxWidth: '300px', fontStyle: 'italic', color: '#555' }}>"{review.text}"</td>
                <td>
                  <span style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', backgroundColor: review.status === 'Approved' ? '#d1fae5' : '#fef3c7', color: review.status === 'Approved' ? '#065f46' : '#92400e' }}>
                    {review.status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '10px', padding: '12px 0' }}>
                  {review.status !== 'Approved' && (
                    <button onClick={() => handleApprove(review.id)} style={{ padding: '6px 12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Approve</button>
                  )}
                  <button onClick={() => handleReject(review.id)} style={{ padding: '6px 12px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Reject / Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}