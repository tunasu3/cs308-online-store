import React from 'react';

export default function ProductManager({ 
  products, categories, dashboardMsg, setShowAddProduct, setShowAddCategory,
  handleProductFieldChange, saveProductChanges, deleteProduct
}) {
  const inputStyle = { padding: '8px', width: '100%', boxSizing: 'border-box', border: '1px solid #ddd', borderRadius: '4px' };

  return (
    <div className="pro-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Product & Category Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="pro-btn" style={{ width: 'auto' }} onClick={() => setShowAddProduct(true)}>+ Add Product</button>
          <button className="pro-btn" style={{ width: 'auto', background: '#34c759' }} onClick={() => setShowAddCategory(true)}>+ Add Category</button>
        </div>
      </div>

      {dashboardMsg && <p style={{ color: dashboardMsg.startsWith('Error') ? 'red' : 'green' }}>{dashboardMsg}</p>}

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Product</th>
              <th style={{ padding: '12px', width: '100px' }}>Price</th>
              <th style={{ padding: '12px', width: '80px' }}>Stock</th>
              <th style={{ padding: '12px' }}>Image URL</th>
              <th style={{ padding: '12px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>{p.name}</td>
                <td style={{ padding: '12px' }}>
                  <input type="number" defaultValue={p.price} style={inputStyle} onChange={(e) => handleProductFieldChange(p._id, 'price', e.target.value)} />
                </td>
                <td style={{ padding: '12px' }}>
                  <input type="number" defaultValue={p.stock} style={inputStyle} onChange={(e) => handleProductFieldChange(p._id, 'stock', e.target.value)} />
                </td>
                <td style={{ padding: '12px' }}>
                  <input type="text" defaultValue={p.imageUrl || ''} placeholder="Paste URL" style={inputStyle} onChange={(e) => handleProductFieldChange(p._id, 'imageUrl', e.target.value)} />
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="pro-btn" style={{ width: 'auto', padding: '6px 12px' }} onClick={() => saveProductChanges(p)}>Save</button>
                    <button className="pro-btn" style={{ width: 'auto', padding: '6px 12px', background: '#ff3b30' }} onClick={() => deleteProduct(p._id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}