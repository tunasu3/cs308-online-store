import React, { useState, useEffect } from 'react';

export default function ProductManager({ products, categories = [], fetchData, deleteProduct }) {
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', category: '', description: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);


  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {}
  };

  const fetchPendingReviews = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/comments/pending');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchOrders();
    fetchPendingReviews();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const url = editingId
        ? `http://localhost:8000/api/products/${editingId}`
        : 'http://localhost:8000/api/products';
      const method = editingId ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });

      const currentProduct = products.find(p => p._id === editingId);
      if (editingId && currentProduct && Number(currentProduct.stock) === 0 && Number(newProduct.stock) > 0) {
        localStorage.setItem("wishlist_seen", "false");
      }
      
      fetchData();
      setNewProduct({ name: '', price: '', stock: '', category: '', description: '' });
      setEditingId(null);
    } catch (err) { console.error(err); }
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setNewProduct({
      name: p.name || '',
      price: p.price || '',
      stock: p.stock || '',
      category: p.category || '',
      description: p.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewProduct({ name: '', price: '', stock: '', category: '', description: '' });
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
    } catch (err) {}
  };

  const updateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {}
  };

  // Fatura PDF dosyasını yeni sekmede açma fonksiyonu
  const handleViewInvoice = (orderId) => {
    window.open(`http://localhost:8000/api/orders/${orderId}/invoice`, '_blank');
  };

  const handleApprove = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/comments/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== id));
        if (fetchData) fetchData(); 
      }
    } catch (err) {}
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`http://localhost:8000/api/comments/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== id));
      }
    } catch (err) {}
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
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '14px'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        <button style={tabStyle('products')} onClick={() => setActiveTab('products')}>Products & Stock</button>
        <button style={tabStyle('categories')} onClick={() => setActiveTab('categories')}>Categories</button>
        <button style={tabStyle('deliveries')} onClick={() => setActiveTab('deliveries')}>Deliveries</button>
        <button style={tabStyle('comments')} onClick={() => setActiveTab('comments')}>Comments</button>
      </div>

      <div style={{ padding: '30px' }}>
        
        {activeTab === 'products' && (
          <div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px', backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '15px' }}>
                <input type="text" placeholder="Product Name" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={inputStyle} />
                <input type="number" placeholder="Price ($)" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} style={inputStyle} />
                <input type="number" placeholder="Stock Qty" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} style={inputStyle} />
                <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={inputStyle}>
                  <option value="">Select Category</option>
                  {categories && categories.length > 0 && categories.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <textarea placeholder="Enter product description here..." required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ ...inputStyle, minHeight: '80px', flexGrow: 1, resize: 'vertical' }} />
                <button type="submit" style={{ padding: '0 40px', height: '80px', backgroundColor: editingId ? '#10b981' : '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
                  {editingId ? 'Save Changes' : 'Publish'}
                </button>
                {editingId && (
                  <button type="button" onClick={cancelEdit} style={{ padding: '0 30px', height: '80px', backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#4b5563', fontSize: '14px' }}>
                  <th style={{ padding: '15px' }}>Product Details</th>
                  <th style={{ padding: '15px' }}>Price</th>
                  <th style={{ padding: '15px' }}>Stock</th>
                  <th style={{ padding: '15px' }}>Category</th>
                  <th style={{ padding: '15px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products && products.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#111827', marginBottom: '4px' }}>{p.name}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description || 'No description available.'}</div>
                    </td>
                    <td style={{ padding: '15px', fontWeight: '500' }}>${p.price}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ padding: '6px 10px', borderRadius: '6px', backgroundColor: p.stock > 0 ? '#d1fae5' : '#fee2e2', color: p.stock > 0 ? '#065f46' : '#991b1b', fontWeight: 'bold', fontSize: '12px' }}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => startEdit(p)} style={{ color: '#1d4ed8', background: '#eff6ff', border: 'none', cursor: 'pointer', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' }}>Edit</button>
                        <button onClick={() => deleteProduct(p._id)} style={{ color: '#ef4444', background: '#fef2f2', border: 'none', cursor: 'pointer', fontWeight: '600', padding: '8px 12px', borderRadius: '6px' }}>Delete</button>
                      </div>
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
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Add</button>
            </form>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {categories && categories.length > 0 && categories.map(c => (
                <li key={c._id || c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#f9fafb' }}>
                  <span style={{ fontWeight: '500' }}>{c.name}</span>
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
                  <th style={{ padding: '15px' }}>Delivery ID</th>
                  <th style={{ padding: '15px' }}>Customer ID</th>
                  <th style={{ padding: '15px' }}>Products (ID & Qty)</th>
                  <th style={{ padding: '15px' }}>Total Price</th>
                  <th style={{ padding: '15px' }}>Delivery Address</th>
                  <th style={{ padding: '15px' }}>Status / Action</th>
                  <th style={{ padding: '15px' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    {}
                    <td style={{ padding: '15px', fontMono: 'monospace', fontSize: '12px' }}>#{order._id}</td>
                    
                    {}
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '600', color: '#111827' }}>{order.userName || 'Guest'}</div>
                      <div style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>ID: {order.user || 'N/A'}</div>
                    </td>

                    {}
                    <td style={{ padding: '15px' }}>
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} style={{ marginBottom: '6px', fontSize: '12px', color: '#374151' }}>
                          <div style={{ fontWeight: '500' }}>{item.name}</div>
                          <div style={{ color: '#6b7280', fontSize: '11px', fontFamily: 'monospace' }}>PID: {item.productId}</div>
                          <div style={{ color: '#2563eb', fontWeight: 'bold' }}>Qty: x{item.quantity}</div>
                        </div>
                      ))}
                    </td>

                    {}
                    <td style={{ padding: '15px', fontWeight: '600' }}>${order.totalPrice || order.totalAmount}</td>
                    
                    {}
                    <td style={{ padding: '15px', maxWidth: '200px', wordBreak: 'break-word' }}>{order.deliveryAddress}</td>
                    
                    {}
                    <td style={{ padding: '15px' }}>
                      <select 
                        value={order.status || 'Processing'} 
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', cursor: 'pointer', fontWeight: '600' }}
                      >
                        <option value="Processing">Processing</option>
                        <option value="In-Transit">In-Transit</option>
                        <option value="Delivered">Delivered (Completed)</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    {}
                    <td style={{ padding: '15px' }}>
                      <button 
                        onClick={() => handleViewInvoice(order._id)}
                        style={{ padding: '8px 12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '12px' }}
                      >
                        View Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>No orders found.</p>}
          </div>
        )}

        {activeTab === 'comments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reviews.length === 0 ? (
              <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px' }}>No new reviews pending approval.</p>
            ) : (
              reviews.map(c => (
                <div key={c._id} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>Review from <strong>{c.userName}</strong> on <strong>{c.productId?.name || 'Product'}</strong></div>
                    <div style={{ fontSize: '16px', color: '#111827', fontStyle: 'italic' }}>"{c.comment}"</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleApprove(c._id)} style={{ padding: '10px 16px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Approve</button>
                    <button onClick={() => handleReject(c._id)} style={{ padding: '10px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}