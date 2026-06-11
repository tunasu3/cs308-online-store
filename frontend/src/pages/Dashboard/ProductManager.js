import React, { useState, useEffect } from 'react';

export default function ProductManager({ products, categories = [], fetchData, deleteProduct }) {
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  const [newProduct, setNewProduct] = useState({ name: '', stock: '', category: '', description: '' });
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [editingId, setEditingId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

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

      const payload = { ...newProduct };
      if (!editingId) {
        payload.price = 0; 
      } else {
        const currentProduct = products.find(p => p._id === editingId);
        payload.price = currentProduct ? currentProduct.price : 0;
      }

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const currentProduct = products.find(p => p._id === editingId);
      if (editingId && currentProduct && Number(currentProduct.stock) === 0 && Number(newProduct.stock) > 0) {
        localStorage.setItem("wishlist_seen", "false");
      }
      
      fetchData();
      setNewProduct({ name: '', stock: '', category: '', description: '' });
      setEditingId(null);
    } catch (err) {}
  };

  const startEdit = (p) => {
    setEditingId(p._id);
    setNewProduct({
      name: p.name || '',
      stock: p.stock || '',
      category: p.category || '',
      description: p.description || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewProduct({ name: '', stock: '', category: '', description: '' });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const url = editingCategoryId 
        ? `http://localhost:8000/api/categories/${editingCategoryId}` 
        : 'http://localhost:8000/api/categories';
      const method = editingCategoryId ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      fetchData();
      setNewCategory({ name: '' });
      setEditingCategoryId(null);
    } catch (err) {}
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/categories/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (fetchData) fetchData();
      }
    } catch (err) {}
  };

  const startCategoryEdit = (c) => {
    setEditingCategoryId(c._id);
    setNewCategory({ name: c.name || '' });
  };

  const cancelCategoryEdit = () => {
    setEditingCategoryId(null);
    setNewCategory({ name: '' });
  };

  const updateItemStatus = async (orderId, itemId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemStatus: newStatus })
      });
      if (res.ok) {
        fetchOrders();
      }
    } catch (err) {}
  };

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
    padding: '14px 28px',
    cursor: 'pointer',
    borderBottom: activeTab === tabName ? '3px solid #3b82f6' : '3px solid transparent',
    color: activeTab === tabName ? '#1e3a8a' : '#6b7280',
    fontWeight: activeTab === tabName ? '600' : '500',
    background: 'none',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    fontSize: '15px',
    transition: 'all 0.2s ease'
  });

  const inputStyle = {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '14px',
    backgroundColor: '#fff',
    transition: 'border-color 0.2s'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
        <button style={tabStyle('products')} onClick={() => setActiveTab('products')}>Products & Stock</button>
        <button style={tabStyle('categories')} onClick={() => setActiveTab('categories')}>Categories</button>
        <button style={tabStyle('deliveries')} onClick={() => setActiveTab('deliveries')}>Deliveries</button>
        <button style={tabStyle('comments')} onClick={() => setActiveTab('comments')}>Comments</button>
      </div>

      <div style={{ padding: '35px' }}>
        
        {activeTab === 'products' && (
          <div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '40px', backgroundColor: '#f8fafc', padding: '25px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#1e293b', fontSize: '16px', fontWeight: '600' }}>
                {editingId ? '📝 Edit Product Details' : '✨ Publish New Product'}
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr', gap: '15px' }}>
                <input type="text" placeholder="Product Name" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} style={inputStyle} />
                <input type="number" placeholder="Stock Qty" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} style={inputStyle} />
                <select required value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} style={inputStyle}>
                  <option value="">Select Category</option>
                  {categories && categories.length > 0 && categories.map(c => <option key={c._id || c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                <textarea placeholder="Enter product description here..." required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} style={{ ...inputStyle, minHeight: '90px', flexGrow: 1, resize: 'vertical' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '90px' }}>
                  <button type="submit" style={{ padding: '0 35px', height: editingId ? '40px' : '90px', backgroundColor: editingId ? '#10b981' : '#1e3a8a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    {editingId ? 'Save Changes' : 'Publish'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} style={{ padding: '0 35px', height: '40px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </form>

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #edf2f7', color: '#64748b', fontSize: '14px' }}>
                  <th style={{ padding: '16px' }}>Product Details</th>
                  <th style={{ padding: '16px' }}>Current Price</th>
                  <th style={{ padding: '16px' }}>Stock Status</th>
                  <th style={{ padding: '16px' }}>Category</th>
                  <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products && products.map(p => (
                  <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>{p.name}</div>
                      <div style={{ fontSize: '13px', color: '#64748b', maxWidth: '350px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description || 'No description available.'}</div>
                    </td>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#334155' }}>
                      {p.price === 0 ? (
                        <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 'normal', fontStyle: 'italic' }}>⚠️ Price Not Set</span>
                      ) : (
                        <span>${p.price}</span>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '20px', backgroundColor: p.stock > 0 ? '#ecfdf5' : '#fef2f2', color: p.stock > 0 ? '#047857' : '#b91c1c', fontWeight: '600', fontSize: '12px', display: 'inline-block' }}>
                        {p.stock > 0 ? `📦 ${p.stock} Available` : '🚨 Out of Stock'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '5px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>{p.category}</span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => startEdit(p)} style={{ color: '#2563eb', background: '#eff6ff', border: 'none', cursor: 'pointer', fontWeight: '600', padding: '8px 14px', borderRadius: '6px', transition: 'all 0.2s' }}>Edit</button>
                        <button onClick={() => deleteProduct(p._id)} style={{ color: '#dc2626', background: '#fef2f2', border: 'none', cursor: 'pointer', fontWeight: '600', padding: '8px 14px', borderRadius: '6px', transition: 'all 0.2s' }}>Delete</button>
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
              <input type="text" placeholder={editingCategoryId ? "Edit Category Name" : "New Category Name"} required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} style={inputStyle} />
              <button type="submit" style={{ padding: '10px 24px', backgroundColor: editingCategoryId ? '#10b981' : '#1e3a8a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minWidth: '90px' }}>
                {editingCategoryId ? 'Update' : 'Add'}
              </button>
              {editingCategoryId && (
                <button type="button" onClick={cancelCategoryEdit} style={{ padding: '10px 24px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  Cancel
                </button>
              )}
            </form>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {categories && categories.length > 0 && categories.map(c => (
                <li key={c._id || c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '10px', backgroundColor: '#f8fafc' }}>
                  <span style={{ fontWeight: '500', color: '#334155' }}>{c.name}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={() => startCategoryEdit(c)} style={{ color: '#2563eb', background: '#eff6ff', border: 'none', cursor: 'pointer', fontWeight: '600', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>
                      Edit
                    </button>
                    <button type="button" onClick={() => handleDeleteCategory(c._id)} style={{ color: '#dc2626', background: '#fef2f2', border: 'none', cursor: 'pointer', fontWeight: '600', padding: '6px 12px', borderRadius: '6px', fontSize: '13px' }}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #edf2f7', color: '#64748b' }}>
                  <th style={{ padding: '15px' }}>Delivery ID</th>
                  <th style={{ padding: '15px' }}>Customer Details</th>
<th style={{ padding: '15px' }}>Customer ID</th>
<th style={{ padding: '15px' }}>Products & Item Delivery Status</th>
                  <th style={{ padding: '15px' }}>Total Price</th>
                  <th style={{ padding: '15px' }}>Address</th>
                  <th style={{ padding: '15px', textAlign: 'right' }}>Invoice</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                    <td style={{ padding: '15px', fontFamily: 'monospace', fontSize: '12px', color: '#64748b', paddingTop: '20px' }}>#{order._id.substring(0,8)}...</td>
                    <td style={{ padding: '15px', paddingTop: '20px' }}>
  <div style={{ fontWeight: '600', color: '#0f172a' }}>{order.userName || 'Guest'}</div>
  <div style={{ fontSize: '12px', color: '#64748b' }}>{order.userEmail}</div>
</td>
<td style={{ padding: '15px', paddingTop: '20px', fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
  {order.user || 'N/A'}
</td>
                    <td style={{ padding: '15px', minWidth: '320px' }}>
                      {order.items && order.items.map((item, idx) => {
                        const isTerminalStatus = ['Cancelled', 'Refund Requested', 'Refunded', 'Refund Rejected'].includes(item.itemStatus);
                        
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #f1f5f9', gap: '15px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>
  {item.name} x<strong style={{ color: '#2563eb' }}>{item.quantity}</strong>
  <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>ID: {item.productId}</div>
</span>
                            
                            {isTerminalStatus ? (
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '600',
                                backgroundColor: item.itemStatus === 'Cancelled' ? '#fef2f2' : 
                                                item.itemStatus === 'Refund Requested' ? '#fffbeb' :
                                                item.itemStatus === 'Refunded' ? '#f0fdf4' : '#fef2f2',
                                color: item.itemStatus === 'Cancelled' ? '#ef4444' : 
                                      item.itemStatus === 'Refund Requested' ? '#d97706' :
                                      item.itemStatus === 'Refunded' ? '#16a34a' : '#dc2626',
                                border: '1px solid',
                                borderColor: item.itemStatus === 'Cancelled' ? '#fecaca' : 
                                            item.itemStatus === 'Refund Requested' ? '#fde68a' :
                                            item.itemStatus === 'Refunded' ? '#bbf7d0' : '#fca5a5'
                              }}>
                                {item.itemStatus === 'Cancelled' && '🚫 Cancelled'}
                                {item.itemStatus === 'Refund Requested' && '↩️ Refund Requested'}
                                {item.itemStatus === 'Refunded' && '💰 Refunded'}
                                {item.itemStatus === 'Refund Rejected' && '❌ Refund Rejected'}
                              </span>
                            ) : (
                              <select
                                value={item.itemStatus || 'Processing'}
                                onChange={(e) => updateItemStatus(order._id, item._id, e.target.value)}
                                style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: '500' }}
                              >
                                <option value="Processing">📦 Processing</option>
                                <option value="In-Transit">🚚 In-Transit</option>
                                <option value="Delivered">✅ Delivered</option>
                              </select>
                            )}
                          </div>
                        );
                      })}
                    </td>
                    <td style={{ padding: '15px', fontWeight: '600', color: '#0f172a', paddingTop: '20px' }}>${order.totalPrice || order.totalAmount}</td>
                    <td style={{ padding: '15px', color: '#475569', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingTop: '20px' }}>{order.deliveryAddress}</td>
                    
                    <td style={{ padding: '15px', textAlign: 'right', paddingTop: '20px' }}>
                      <button onClick={() => handleViewInvoice(order._id)} style={{ padding: '6px 12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '12px' }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>No orders found.</p>}
          </div>
        )}

        {activeTab === 'comments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {reviews.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>No new reviews pending approval.</p>
            ) : (
              reviews.map(c => (
                <div key={c._id} style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>Review from <strong>{c.userName}</strong> on <strong>{c.productId?.name || 'Product'}</strong></div>
                    <div style={{ fontSize: '15px', color: '#0f172a', fontStyle: 'italic' }}>"{c.comment}"</div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => handleApprove(c._id)} style={{ padding: '8px 14px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Approve</button>
                    <button onClick={() => handleReject(c._id)} style={{ padding: '8px 14px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Reject</button>
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