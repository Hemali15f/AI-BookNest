import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Create CartContext
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, dbInstance } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('ai_booknest_cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // 🟢 Load cart from Firestore on login
  useEffect(() => {
    const loadCart = async () => {
      if (user && dbInstance) {
        try {
          const cartRef = doc(dbInstance, 'carts', user.uid);
          const docSnap = await getDoc(cartRef);
          if (docSnap.exists()) {
            setCartItems(docSnap.data().items || []);
          }
        } catch (err) {
          console.error('Error loading cart from Firestore:', err);
        }
      }
    };
    loadCart();
  }, [user, dbInstance]);

  // 🟢 Save cart to Firestore when it changes
  useEffect(() => {
    if (user && dbInstance) {
      const cartRef = doc(dbInstance, 'carts', user.uid);
      setDoc(cartRef, { items: cartItems }, { merge: true });
    }
  }, [cartItems, user, dbInstance]);

  // 🟢 Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem('ai_booknest_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // 🔴 Clear cart on logout
  useEffect(() => {
    if (!user) {
      setCartItems([]);
    }
  }, [user]);

  // ➕ Add item
  const addToCart = (book) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === book.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...book, quantity: 1 }];
    });
  };

  // ➖ Remove item
  const removeFromCart = (bookId) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === bookId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.id === bookId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevItems.filter(item => item.id !== bookId);
    });
  };

  // ❌ Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // 💵 Total price
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        setCartItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
