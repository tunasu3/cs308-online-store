import React, { useState, useEffect } from 'react';

const Stars = ({ value }) => {
  const numValue = Number(value) || 0;
  const full = Math.floor(numValue);
  const half = numValue % 1 >= 0.5;

  return (
    <div style={{ display: 'flex', gap: '2px', fontSize: '14px' }}>
      {[...Array(5)].map((_, i) => {
        if (i < full) return <span key={i} style={{ color: '#fbbf24' }}>★</span>;
        if (i === full && half) return <span key={i} style={{ color: '#fbbf24' }}>☆</span>;
        return <span key={i} style={{ color: '#e5e7eb' }}>★</span>;
      })}
    </div>
  );
};

export default function ReviewApprovals() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingReviews = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/comments/pending'); 
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/comments/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== id));
        alert('Review approved and published.');
      } else {
        alert('Failed to approve review.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`http://localhost:8000/api/comments/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== id));
        alert('Review rejected and deleted.');
      } else {
        alert('Failed to reject review.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div style={{ padding: '25px', color: '#6b7280' }}>Loading reviews...</div>;

  return (
    <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', color: '#111827' }}>Review Moderation (Pending Approval)</h2>
      
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', fontSize: '16px', backgroundColor: '#f9fafb', borderRadius: '12px' }}>
          <span style={{ fontSize: '24px' }}>💬</span> No new reviews pending approval. All caught up!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {reviews.map(review => (
            <div key={review._id} style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.2s' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                  Review from <strong style={{ color: '#111827' }}>{review.userName}</strong> on <strong style={{ color: '#111827' }}>{review.productId?.name || 'Product'}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px' }}>
                  <Stars value={review.rating || 0} />
                  <span style={{ fontSize: '14px', color: '#9ca3af' }}>({review.rating || 0} Stars)</span>
                </div>
                <div style={{ fontSize: '16px', color: '#111827', fontStyle: 'italic', maxWidth: '500px', lineHeight: '1.5' }}>
                  "{review.comment}"
                </div>
                <div style={{ marginTop: '15px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px', backgroundColor: '#fffbeb', color: '#92400e', textTransform: 'uppercase' }}>
                    Status: Pending
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleApprove(review._id)} style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}>
                  Approve & Publish
                </button>
                <button onClick={() => handleReject(review._id)} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s' }}>
                  Reject & Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}