import React, { useState, useEffect } from 'react';

export default function ProductManager({ products, categories, fetchData, deleteProduct }) {
  const [activeTab, setActiveTab] = useState('products');
  const [deliveries, setDeliveries] = useState([
    { id: 'DEL-101', customerId: 'CUST-99', productId: 'PROD-1', quantity: 2, totalPrice: 240, address: '123 Main St, NY', isCompleted: false },
    { id: 'DEL-102', customerId: 'CUST-42', productId: 'PROD-3', quantity: 1, totalPrice: 50, address: '456 Oak Ave, CA', isCompleted: true }
  ]);
  const [comments, setComments] = useState([
    { id: 'COM-1', user: 'John Doe', product: 'Gaming Mouse', text: 'Amazing quality!', status: 'pending' },
    { id: 'COM-2', user: 'Jane Smith', product: 'Mechanical Keyboard', text: 'Keys are too loud.', status: 'pending' }
  ]);

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

  const toggleDeliveryStatus = (id) => {
    setDeliveries(deliveries.map(d => d.id === id ? { ...d, isCompleted: !d.isCompleted } : d));
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
                  <th style={{ padding: '12px' }}>Product ID</th>
                  <th style={{ padding: '12px' }}>Qty</th>
                  <th style={{ padding: '12px' }}>Total</th>
                  <th style={{ padding: '12px' }}>Address</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>{d.id}</td>
                    <td style={{ padding: '12px' }}>{d.customerId}</td>
                    <td style={{ padding: '12px' }}>{d.productId}</td>
                    <td style={{ padding: '12px' }}>{d.quantity}</td>
                    <td style={{ padding: '12px' }}>${d.totalPrice}</td>
                    <td style={{ padding: '12px', maxWidth: '150px' }}>{d.address}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: d.isCompleted ? '#d1fae5' : '#fef3c7', color: d.isCompleted ? '#065f46' : '#92400e', fontWeight: 'bold', fontSize: '12px' }}>
                        {d.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <button onClick={() => toggleDeliveryStatus(d.id)} style={{ padding: '6px 12px', backgroundColor: d.isCompleted ? '#f3f4f6' : '#059669', color: d.isCompleted ? '#9ca3af' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
                        {d.isCompleted ? 'Undo' : 'Mark Done'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'comments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {comments.map(c => (
              <div key={c.id} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: c.status === 'approved' ? '#f0fdf4' : c.status === 'disapproved' ? '#fef2f2' : '#fff' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>From: <strong>{c.user}</strong> | Product: <strong>{c.product}</strong></div>
                  <div style={{ fontSize: '16px', color: '#111827' }}>"{c.text}"</div>
                  <div style={{ fontSize: '12px', marginTop: '8px', fontWeight: 'bold', textTransform: 'uppercase', color: c.status === 'approved' ? '#166534' : c.status === 'disapproved' ? '#991b1b' : '#d97706' }}>Status: {c.status}</div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleCommentStatus(c.id, 'approved')} disabled={c.status === 'approved'} style={{ padding: '8px 16px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: c.status === 'approved' ? 'not-allowed' : 'pointer', opacity: c.status === 'approved' ? 0.5 : 1 }}>Approve</button>
                  <button onClick={() => handleCommentStatus(c.id, 'disapproved')} disabled={c.status === 'disapproved'} style={{ padding: '8px 16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: c.status === 'disapproved' ? 'not-allowed' : 'pointer', opacity: c.status === 'disapproved' ? 0.5 : 1 }}>Disapprove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}