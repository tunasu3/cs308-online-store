import React from 'react';

export default function AuthCard({ view, setView, handleLogin, handleRegister, authData, setAuthData, authError }) {
  const inputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc', boxSizing: 'border-box' };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }} className="pro-card">
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{view === 'login' ? 'Login' : 'Register'}</h2>
      
      {view === 'login' ? (
        <form onSubmit={handleLogin}>
          <input placeholder="Email" type="email" style={inputStyle} onChange={e => setAuthData({...authData, email: e.target.value})} required />
          <input type="password" placeholder="Password" style={inputStyle} onChange={e => setAuthData({...authData, password: e.target.value})} required />
          {authError && <p style={{ color: 'red', fontSize: '13px' }}>{authError}</p>}
          <button className="pro-btn" type="submit">Login</button>
          <p onClick={() => setView('register')} style={{ textAlign: 'center', color: '#007AFF', cursor: 'pointer', marginTop: '15px' }}>Don't have an account? Register</p>
        </form>
      ) : (
        <form onSubmit={handleRegister}>
          <input placeholder="Full Name" style={inputStyle} onChange={e => setAuthData({...authData, fullName: e.target.value})} required />
          <input placeholder="Email" type="email" style={inputStyle} onChange={e => setAuthData({...authData, email: e.target.value})} required />
          <input type="password" style={inputStyle} placeholder="Password" onChange={e => setAuthData({...authData, password: e.target.value})} required />
          {authError && <p style={{ color: 'red', fontSize: '13px' }}>{authError}</p>}
          <button className="pro-btn" type="submit">Register</button>
          <p onClick={() => setView('login')} style={{ textAlign: 'center', color: '#007AFF', cursor: 'pointer', marginTop: '15px' }}>Already have an account? Login</p>
        </form>
      )}
    </div>
  );
}