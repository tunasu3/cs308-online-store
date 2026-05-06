import React, { useEffect, useState, useRef } from 'react';

const formatPrice = (num) => {
  const value = Number(num);
  const rounded = Math.round(value * 100) / 100;

  return rounded % 1 === 0
    ? rounded.toLocaleString()
    : rounded.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
};

export default function Wishlist({ user, addToCart, setView, setSelectedProduct }) {
  const [items, setItems] = useState([]);
  const prevItemsRef = useRef([]);
  const [notification, setNotification] = useState('');
  const [flagsState, setFlagsState] = useState(
    JSON.parse(localStorage.getItem("wishlist_flags") || "{}")
  );

// eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
  if (!user) return;
  const stored = JSON.parse(localStorage.getItem("wishlist_discounts") || "{}");
  const flags = JSON.parse(localStorage.getItem("wishlist_flags") || "{}");
  const stockStored = JSON.parse(localStorage.getItem("wishlist_stock") || "{}");

  const fetchWishlist = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/wishlist/${user._id}`);
      const data = await res.json();

     

// detect new or increased discounts
data.forEach(newItem => {
  const id = String(newItem._id);
  const newDiscount = Number(newItem.discount);
  const oldDiscount = stored[id] !== undefined ? stored[id] : newDiscount;

  // discount logic only runs if discount changed
  if (oldDiscount !== newDiscount) {
    if (oldDiscount === 0 && newDiscount > 0 && !flags[id]) {
      flags[id] = "new";
      if (localStorage.getItem("wishlist_seen") !== "true") {
        localStorage.setItem("wishlist_seen", "false");
      }
    } else if (oldDiscount > 0 && newDiscount > oldDiscount && flags[id] !== "increase") {
      flags[id] = "increase";
      if (localStorage.getItem("wishlist_seen") !== "true") {
        localStorage.setItem("wishlist_seen", "false");
      }
    } else if (oldDiscount > 0 && newDiscount === 0) {
      delete flags[id];
    } else if (oldDiscount > newDiscount) {
      delete flags[id];
    }
    stored[id] = newDiscount;
  }

  // BACK IN STOCK
  const oldStock = stockStored[id] !== undefined ? stockStored[id] : newItem.stock;
  const newStock = Number(newItem.stock);

  if (oldStock === 0 && newStock > 0 && !flags[id + "_stock"]) {
    flags[id + "_stock"] = "back_in_stock";
    if (localStorage.getItem("wishlist_seen") !== "true") {
      localStorage.setItem("wishlist_seen", "false");
    }
  } else if (newStock === 0) {
    delete flags[id + "_stock"];
  }

  stockStored[id] = newStock;
});

localStorage.setItem("wishlist_discounts", JSON.stringify(stored));
localStorage.setItem("wishlist_flags", JSON.stringify(flags));
localStorage.setItem("wishlist_stock", JSON.stringify(stockStored));
setFlagsState({ ...flags });

      setItems(data);
      prevItemsRef.current = data;

    } catch (err) {
      console.error(err);
    }
  };

  fetchWishlist(); // initial load

  const interval = setInterval(fetchWishlist, 5000); // 🔥 every 5 sec

  return () => clearInterval(interval);

}, [user]);

useEffect(() => {
  if (notification) {
    const timer = setTimeout(() => {
      setNotification('');
    }, 4000);

    return () => clearTimeout(timer);
  }
}, [notification]);

  const removeFromWishlist = async (productId) => {
    try {
      await fetch(`http://localhost:8000/api/wishlist/${user._id}/${productId}`, {
        method: "DELETE"
      });

      setItems(prev => prev.filter(item => item._id !== productId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>My Wishlist</h2>

      {notification && (
  <div style={{
    position: 'fixed',
    top: '90px',
    right: '20px',
    background: '#111827',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: '10px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
    fontSize: '14px',
    fontWeight: '600',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }}>
    🔔 {notification}
  </div>
)}

      {items.length === 0 ? (
        <p>No items in wishlist.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {items.map(product => (
            <div key={product._id} style={{
              background: '#fff',
              padding: '15px',
              borderRadius: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              cursor: 'pointer'
            }}>
              
             <div style={{ position: 'relative' }}>
                
                <img 
                src={product.image || product.imageUrl} 
                alt={product.name}
                style={{ width: '100%', height: '150px', objectFit: 'contain' }}
                onClick={() => {
                    setSelectedProduct(product);
                    setView('productDetail');
                }}
                /> {flagsState[String(product._id)] && (
  <div style={{
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    background: 'rgba(254, 243, 199, 0.95)',
    color: '#92400e',
    fontSize: '12px',
    padding: '6px 0',
    textAlign: 'center',
    fontWeight: '600',
    borderBottomLeftRadius: '10px',
borderBottomRightRadius: '10px'
  }}>
    {flagsState[String(product._id)] === "new"
      ? "Now on Sale"
      : "Price Dropped Further"}
  </div>
)}

{flagsState[String(product._id) + "_stock"] === "back_in_stock" && (
  <div style={{
    position: 'absolute',
    bottom: '0',
    left: '0',
    width: '100%',
    background: 'rgba(209, 250, 229, 0.95)',
    color: '#065f46',
    fontSize: '12px',
    padding: '6px 0',
    textAlign: 'center',
    fontWeight: '600',
    borderBottomLeftRadius: '10px',
    borderBottomRightRadius: '10px'
  }}>
    Back in Stock
  </div>
)}
                {Number(product.discount) > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontWeight: '700'
                        }}>
                            %{product.discount} OFF
                            </span>
                        )}

                        {product.stock === 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '10px',
                            left: '10px',
                            background: '#6b7280',
                            color: '#fff',
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: '700'
                            }}>
                              Sold Out
                              </span>
                            )}

                        <button
                            
                            onClick={(e) => {
                                e.stopPropagation();
                                removeFromWishlist(product._id);
                            }}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(255,255,255,0.9)',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                                }}
                                >
                                    ✕
                                    </button>

                        </div>

              <h4>{product.name}</h4>
              
              {Number(product.discount) > 0 ? (
                <div>
                    <span style={{ textDecoration: 'line-through', color: '#9ca3af', fontSize: '13px' }}> ${formatPrice(product.price)} </span>
                    <div style={{ fontWeight: '700', fontSize: '18px', color: '#111827' }}> ${formatPrice(product.price * (1 - product.discount / 100))} </div>
                            </div>
                            ) : (
                            <p style={{ fontWeight: '700', fontSize: '18px', color: '#111827' }}> ${formatPrice(product.price)} </p>
                            )}

                            <button
                            onClick={(e) => { e.stopPropagation(); 
                              const discountedProduct = {
                                ...product,
                                price: Number(product.discount) > 0
                                ? product.price * (1 - product.discount / 100)
                                : product.price
                              };
                              addToCart(discountedProduct);
                            }}
                            disabled={product.stock === 0}
                            style={{
                              width: '100%',
                              padding: '12px',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: product.stock === 0 ? '#ccc' : '#111',
                              color: '#fff',
                              fontWeight: '700',
                              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                              marginTop: '10px'
                              }}
                              >
                                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                                </button>
                                    </div>
                                ))}
                                </div>
                            )}
                            </div>
                            );
                        }