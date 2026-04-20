import React from 'react';
import { styles } from '../../styles/theme';

function Navbar({ user, setView, cartCount, setIsMenuOpen, isMenuOpen, setSearchTerm }) {
  return (
    <>
      {/* SIDEBAR */}
      <div style={{...styles.sidebar, left: isMenuOpen ? '0' : '-280px'}}>
        <button onClick={() => setIsMenuOpen(false)} style={{float:'right', background:'none', border:'none', fontSize:'24px'}}>×</button>
        <div style={{padding:'20px 0'}}><h3>{user ? user.name : "Guest"}</h3></div>
        
        <div style={styles.menuItem} onClick={() => {setView('shop'); setIsMenuOpen(false)}}>Shop</div>
        {user?.role === 'Customer' && (
          <div style={styles.menuItem} onClick={() => {setView('cart'); setIsMenuOpen(false)}}>My Cart ({cartCount})</div>
        )}
        
        {user?.role === 'ProductManager' && (
          <div style={styles.menuItem} onClick={() => {setView('products'); setIsMenuOpen(false)}}>Manager Panel</div>
        )}

        {!user ? 
          <div style={styles.menuItem} onClick={() => {setView('login'); setIsMenuOpen(false)}}>Sign In</div> : 
          <div style={{...styles.menuItem, color:'red'}} onClick={() => { window.location.reload(); }}>Logout</div>
        }
      </div>

      <nav style={styles.navbar}>
        <button onClick={() => setIsMenuOpen(true)} style={{background:'none', border:'none', fontSize:'24px', cursor:'pointer'}}>☰</button>
        <h2 onClick={() => setView('shop')} style={{cursor:'pointer'}}>TECH<span style={{color:'#007AFF'}}>STORE</span></h2>
        <div style={styles.navTools}>
          <input placeholder="Search..." style={styles.search} onChange={e => setSearchTerm(e.target.value)} />
          <div onClick={() => setView('cart')} style={{cursor:'pointer'}}>🛒 <span>{cartCount}</span></div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;