import React from 'react';
import { styles } from '../styles/theme';

function Auth({ isRegistering, setIsRegistering, authData, setAuthData, handleLogin, handleRegister, authError }) {
  return (
    <div style={styles.authCard}>
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        {isRegistering && (
          <input placeholder="Full Name" style={styles.input} 
            onChange={e => setAuthData({...authData, fullName: e.target.value})} required />
        )}
        <input placeholder="Email" type="email" style={styles.input} 
          onChange={e => setAuthData({...authData, email: e.target.value})} required />
        
        {isRegistering && (
          <>
            <input placeholder="Tax ID" style={styles.input} onChange={e => setAuthData({...authData, taxId: e.target.value})} />
            <input placeholder="Address" style={styles.input} onChange={e => setAuthData({...authData, address: e.target.value})} />
          </>
        )}

        <input type="password" placeholder="Password" style={styles.input} 
          onChange={e => setAuthData({...authData, password: e.target.value})} required />
        
        {authError && <p style={{color:'red', fontSize:'13px'}}>{authError}</p>}
        <button style={styles.primaryBtn} type="submit">{isRegistering ? 'Register' : 'Login'}</button>
      </form>
      <p onClick={() => setIsRegistering(!isRegistering)} style={{...styles.link, textAlign:'center', marginTop:'10px', cursor:'pointer', color:'#007AFF'}}>
        {isRegistering ? 'Already have an account? Login' : 'No account? Register'}
      </p>
    </div>
  );
}

export default Auth;