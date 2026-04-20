import React from 'react';
import { styles } from '../styles/theme';

function AdminDashboard({ 
  view, products, orders, categories, 
  handleProductFieldChange, saveProductChanges, deleteProduct, 
  updateStatus, approveComment, rejectComment, pendingComments 
}) {
  return (
    <div style={styles.panel}>
      {/* */}
      {view === 'products' && (
        <>
          <h2>Stock & Product Management</h2>
          <table style={styles.table}>
            <thead>
              <tr style={{background:'#f4f4f4'}}>
                <th>Product</th><th>Price</th><th>Stock</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} style={{borderBottom:'1px solid #eee'}}>
                  <td>{p.name}</td>
                  <td><input type="number" defaultValue={p.price} style={{width:'80px'}} onChange={(e) => handleProductFieldChange(p._id, 'price', e.target.value)} /></td>
                  <td><input type="number" defaultValue={p.stock} style={{width:'60px'}} onChange={(e) => handleProductFieldChange(p._id, 'stock', e.target.value)} /></td>
                  <td>
                    <button onClick={() => saveProductChanges(p)} style={{background:'green', color:'white', marginRight:'5px'}}>Save</button>
                    <button onClick={() => deleteProduct(p._id)} style={{background:'red', color:'white'}}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/*  */}
      {view === 'delivery' && (
        <>
          <h2>Delivery Tracking</h2>
          <table style={styles.table}>
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td>{o._id.slice(-6)}</td>
                  <td>{o.userName}</td>
                  <td>
                    <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="In-Transit">In-Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;