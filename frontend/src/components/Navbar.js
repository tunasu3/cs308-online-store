import React from 'react';

export default function Navbar({ setView, cart, user, setSearchTerm, setIsCartOpen, setIsMenuOpen, wishlistCount }) {
  const totalItems = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  const [hasWishlistNotification, setHasWishlistNotification] = React.useState(false);

  React.useEffect(() => {
    const checkWishlist = () => {
      const seen = localStorage.getItem("wishlist_seen") === "true";
      setHasWishlistNotification(!seen);
    };

    checkWishlist();

    const interval = setInterval(checkWishlist, 1000);
    return () => clearInterval(interval);
  }, []);

  const getFirstName = () => {
    if (!user) return 'Sign In';
    if (user.fullName) return user.fullName.split(' ')[0];
    if (user.email) return user.email.split('@')[0]; 
    return 'User'; 
  };

  return (
    <nav style={{ backgroundColor: '#fff', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 100 }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={() => setIsMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px', display: 'flex', alignItems: 'center', color: '#111827' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <h1 onClick={() => setView('shop')} style={{ margin: 0, cursor: 'pointer', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#111827' }}>
          Store
        </h1>
      </div>

      <div style={{ flex: '0 1 400px', position: 'relative' }}>
        <input 
          type="text" 
          placeholder="Search products, brands and more..." 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 20px 12px 40px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }}
        />
        <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        <div onClick={() => setView(user ? 'shop' : 'login')} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#4b5563', fontSize: '14px', fontWeight: '500' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          {getFirstName()}
        </div>

        <div onClick={() => { setView('wishlist'); localStorage.setItem("wishlist_seen", "true"); setHasWishlistNotification(false); }}
        style={{ 
          cursor: 'pointer', 
          display: 'flex', 
          alignItems: 'center',
          position: 'relative'
          }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#111827"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {wishlistCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-8px',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  height: '18px',
                  width: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  border: '2px solid white'
                }}
              >
                {wishlistCount}
              </span>
            )}
            {wishlistCount <= 0 && hasWishlistNotification && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  height: '12px',
                  width: '12px',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  border: '2px solid white'
                }}
              />
            )}
        </div>

        <button onClick={() => setIsCartOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#111827', fontWeight: '600', padding: '8px 12px', borderRadius: '6px', transition: 'background 0.2s' }}>
          <div style={{ position: 'relative' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            {totalItems > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', backgroundColor: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 'bold', height: '18px', width: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '2px solid white' }}>
                {totalItems}
              </span>
            )}
          </div>
          <span style={{ fontSize: '15px' }}>Cart</span>
        </button>
      </div>

    </nav>
  );
}