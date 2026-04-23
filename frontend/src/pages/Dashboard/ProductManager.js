import React, { useState, useEffect } from 'react';

export default function ProductManager({ products, categories, fetchData, deleteProduct }) {
  const [activeTab, setActiveTab] = useState('products');
  const [deliveries, setDeliveries] = useState([]);
const [comments, setComments] = useState([]);

// Fetch real orders + pending comments from backend on mount
useEffect(() => {
    fetchDeliveries();
    fetchPendingComments();
}, []);

const fetchDeliveries = async () => {
    try {
        const res = await fetch('http://localhost:8000/api/orders');
        const data = await res.json();
        setDeliveries(data);
    } catch (err) {
        console.error('Error fetching orders:', err);
    }
};

const fetchPendingComments = async () => {
    try {
        const res = await fetch('http://localhost:8000/api/comments/pending');
        const data = await res.json();
        setComments(data);
    } catch (err) {
        console.error('Error fetching comments:', err);
    }
};

  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      fetchData();
      setNewProduct({ name: '', price: '', stock: '', category: '' });
    } catch (err) { console.error(err); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      fetchData();
      setNewCategory({ name: '' });
    } catch (err) { console.error(err); }
  };

  const toggleDeliveryStatus = async (order) => {
    // Cycle through statuses: Processing → In-Transit → Delivered → Processing
    const nextStatus = order.status === 'Processing' ? 'In-Transit'
                     : order.status === 'In-Transit' ? 'Delivered'
                     : 'Processing';
    try {
        await fetch(`http://localhost:8000/api/orders/${order._id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus })
        });
        fetchDeliveries(); // reload from backend
    } catch (err) {
        console.error('Error updating order status:', err);
    }
};

  const handleCommentStatus = (id, newStatus) => {
    setComments(comments.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const tabStyle = (tabName) => ({
    padding: '12px 24px',
    cursor: 'pointer',
    borderBottom: activeTab === tabName ? '2px solid #0f172a' : '2px solid transparent',
    color: activeTab === tabName ? '#0f172a' : '#6b7280',
    fontWeight: activeTab === tabName ? '600' : '500',
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    fontSize: '15px'
  });

  const inputStyle = {
    padding: '10px 14px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        <button style={tabStyle('products')} onClick={() => setActiveTab('products')}>Products & Stock</button>
        <button style={tabStyle('categories')} onClick={() => setActiveTab('categories')}>Categories</button>
        <button style={tabStyle('deliveries')} onClick={() => setActiveTab('deliveries')}>Deliveries</button>
        <button style={tabStyle('comments')} onClick={() => setActiveTab('comments')}>Comments</button>
      </div>

      <div style={{ padding: '30px' }}>
        
        {activeTab === 'products' && (
          <div>
            <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '15px', marginBottom: '30px' }}>
              <input type="text" placeholder="Product Name" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={inputStyle} />
              <input type="number" placeholder="Price" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={inputStyle} />
              <input type="number" placeholder="Stock Qty" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} style={inputStyle} />
              <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={inputStyle}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
              </select>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#4b5563' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Price</th>
                  <th style={{ padding: '12px' }}>Stock</th>
                  <th style={{ padding: '12px' }}>Category</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px' }}>{p.name}</td>
                    <td style={{ padding: '12px' }}>${p.price}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: p.stock > 0 ? '#d1fae5' : '#fee2e2', color: p.stock > 0 ? '#065f46' : '#991b1b', fontWeight: 'bold' }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{p.category}</td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => deleteProduct(p._id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'categories' && (
          <div style={{ maxWidth: '500px' }}>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
              <input type="text" placeholder="New Category Name" required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} style={inputStyle} />
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {categories.map(c => (
                <li key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '6px', marginBottom: '10px' }}>
                  <span>{c.name}</span>
                  <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#4b5563' }}>
                  <th style={{ padding: '12px' }}>Delivery ID</th>
                  <th style={{ padding: '12px' }}>Customer ID</th>
                  <th style={{ padding: '12px' }}>Items</th>
                  <th style={{ padding: '12px' }}>Qty</th>
                  <th style={{ padding: '12px' }}>Total</th>
                  <th style={{ padding: '12px' }}>Address</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.length === 0 ? (
    <tr>
        <td colSpan="8" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
            No orders yet.
        </td>
    </tr>
) : deliveries.map(order => {
    const statusColors = order.status === 'Delivered' ? { bg: '#d1fae5', text: '#065f46' }
                       : order.status === 'In-Transit' ? { bg: '#dbeafe', text: '#1e40af' }
                       : { bg: '#fef3c7', text: '#92400e' };
    const itemSummary = order.items && order.items.length > 0
        ? order.items.map(i => `${i.name} (×${i.quantity})`).join(', ')
        : '—';
    return (
        <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
            <td style={{ padding: '12px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                #{order._id.substring(0, 8).toUpperCase()}
            </td>
            <td style={{ padding: '12px' }}>{order.userName || 'Guest'}</td>
            <td style={{ padding: '12px', maxWidth: '200px' }}>{itemSummary}</td>
            <td style={{ padding: '12px' }}>
                {order.items ? order.items.reduce((sum, i) => sum + i.quantity, 0) : 0}
            </td>
            <td style={{ padding: '12px', fontWeight: 'bold', color: '#10b981' }}>
                ${order.totalPrice?.toLocaleString()}
            </td>
            <td style={{ padding: '12px', maxWidth: '150px', fontSize: '13px' }}>
                {order.deliveryAddress || '—'}
            </td>
            <td style={{ padding: '12px' }}>
                <span style={{ padding: '4px 10px', borderRadius: '4px', backgroundColor: statusColors.bg, color: statusColors.text, fontWeight: 'bold', fontSize: '12px' }}>
                    {order.status || 'Processing'}
                </span>
            </td>
            <td style={{ padding: '12px' }}>
                <button
                    onClick={() => toggleDeliveryStatus(order)}
                    style={{ padding: '6px 12px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                    Next Status →
                </button>
            </td>
        </tr>
    );
})}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'comments' && (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {comments.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>
          No pending comments to review.
        </p>
      ) : comments.map(c => (
        <div key={c._id} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>
              From: <strong>{c.userName}</strong>
              <span style={{ marginLeft: '15px', color: '#fbbf24' }}>
                {'★'.repeat(c.rating)}{'☆'.repeat(5 - c.rating)}
              </span>
            </div>
            <div style={{ fontSize: '16px', color: '#111827' }}>"{c.comment}"</div>
            <div style={{ fontSize: '12px', marginTop: '8px', fontWeight: 'bold', textTransform: 'uppercase', color: '#d97706' }}>
              Status: Pending
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => handleCommentStatus(c._id, 'approved')} style={{ padding: '8px 16px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Approve
            </button>
            <button onClick={() => handleCommentStatus(c._id, 'disapproved')} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
)}
      </div>
    </div>
  );
}