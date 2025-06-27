
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext'; // ✅ Add this line

// CartContext for managing the shopping cart state
export const CartContext = createContext();

// CartProvider for managing cart logic and state
export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext); // ✅ Use AuthContext to get the current user
  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem('ai_booknest_cart');
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Update localStorage whenever cartItems change
  useEffect(() => {
    localStorage.setItem('ai_booknest_cart', JSON.stringify(cartItems));
  }, [cartItems]);
  useEffect(() => {
  if (!user) {
    setCartItems([]); // clear cart on logout
  }
}, [user]);


  // Add item to cart
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

  // Remove item from cart (or decrease quantity)
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

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal, setCartItems }}>

      {children}
    </CartContext.Provider>
  );
};
