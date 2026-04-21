import React from 'react';

export default function AuthCard({ view, setView, handleLogin, handleRegister, authData, setAuthData }) {
  const isLogin = view === 'login';

  
  const safeAuthData = authData || { email: '', password: '', fullName: '', taxId: '', address: '' };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '40px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{isLogin ? 'Customer Login' : 'Customer Registration'}</h2>
      
      <form onSubmit={isLogin ? handleLogin : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/*  */}
        {!isLogin && (
          <>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={safeAuthData.fullName} 
              onChange={(e) => setAuthData({...safeAuthData, fullName: e.target.value})} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
              required 
            />
            <input 
              type="text" 
              placeholder="Tax ID" 
              value={safeAuthData.taxId} 
              onChange={(e) => setAuthData({...safeAuthData, taxId: e.target.value})} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
              required 
            />
            <textarea 
              placeholder="Home Address" 
              value={safeAuthData.address} 
              onChange={(e) => setAuthData({...safeAuthData, address: e.target.value})} 
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px', fontFamily: 'inherit' }} 
              required 
            />
          </>
        )}
        
        {/*  */}
        <input 
          type="email" 
          placeholder="Email Address" 
          value={safeAuthData.email} 
          onChange={(e) => setAuthData({...safeAuthData, email: e.target.value})} 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={safeAuthData.password} 
          onChange={(e) => setAuthData({...safeAuthData, password: e.target.value})} 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} 
          required 
        />
        
        <button type="submit" style={{ padding: '15px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
          {isLogin ? 'Login' : 'Register Account'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button type="button" onClick={() => setView(isLogin ? 'register' : 'login')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}>
          {isLogin ? "Don't have an account? Register here" : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}