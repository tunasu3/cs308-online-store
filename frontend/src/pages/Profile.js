import React, { useState } from 'react';

export default function Profile({ user, setUser, setView, sessionToken }) {
  const [name, setName] = useState(user?.name || '');
  const [homeAddress, setHomeAddress] = useState(user?.homeAddress || '');
  const [taxID, setTaxID] = useState(user?.taxID || '');
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Please log in</h2>
        <p>You need to be logged in to view your profile.</p>
        <button onClick={() => setView('login')} style={{ padding: '10px 20px', marginTop: '15px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Go to Login</button>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/updateProfile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: sessionToken, name, homeAddress, taxID })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Is the backend running?');
    }
    setSaving(false);
  };

  const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', width: '100%', boxSizing: 'border-box' };
  const labelStyle = { fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '6px', display: 'block' };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Profile Settings</h2>
      <p style={{ color: '#64748b', marginBottom: '30px', fontSize: '14px' }}>Manage your account details below.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Email (cannot be changed)</label>
          <input type="email" value={user.email || ''} disabled style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} />
        </div>

        <div>
          <label style={labelStyle}>Tax ID</label>
          <input type="text" value={taxID} onChange={(e) => setTaxID(e.target.value)} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Home Address</label>
          <textarea value={homeAddress} onChange={(e) => setHomeAddress(e.target.value)} style={{ ...inputStyle, minHeight: '90px', resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        <div>
          <label style={labelStyle}>Account Role</label>
          <input type="text" value={user.role || 'Customer'} disabled style={{ ...inputStyle, backgroundColor: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} />
        </div>

        <button onClick={handleSave} disabled={saving} style={{ padding: '14px', backgroundColor: saving ? '#94a3b8' : '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}