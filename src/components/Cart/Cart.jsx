import React, { useContext, useEffect } from 'react';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext';
import { ShoppingCart, X } from 'lucide-react';
import { convertPrice, MOCK_EXCHANGE_RATES } from '../../utils/currencyRates';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const Cart = ({ navigate }) => {
  const { cartItems, removeFromCart, clearCart, cartTotal, setCartItems } = useContext(CartContext);
  const { user, dbInstance } = useContext(AuthContext);

  // Load user's cart from Firestore
  useEffect(() => {
    const loadCart = async () => {
      if (user && dbInstance) {
        const cartRef = doc(dbInstance, 'carts', user.uid);
        const docSnap = await getDoc(cartRef);
        if (docSnap.exists()) {
          setCartItems(docSnap.data().items || []);
        }
      }
    };
    loadCart();
  }, [user, dbInstance, setCartItems]);

  // Save user's cart to Firestore on change
  useEffect(() => {
    const saveCart = async () => {
      if (user && dbInstance) {
        const cartRef = doc(dbInstance, 'carts', user.uid);
        await setDoc(cartRef, { items: cartItems }, { merge: true });
      }
    };
    saveCart();
  }, [cartItems, user, dbInstance]);

  const userCurrencySymbol = user?.currencySymbol || '$';
  const userCurrencyCode = Object.keys(MOCK_EXCHANGE_RATES).find(
    key => MOCK_EXCHANGE_RATES[key] === (MOCK_EXCHANGE_RATES[userCurrencySymbol] || 1.0)
  ) || 'USD';
  const displayCartTotal = `${userCurrencySymbol}${convertPrice(cartTotal, userCurrencyCode).toFixed(2)}`;

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 pt-20">
        <ShoppingCart className="w-24 h-24 text-gray-400 mb-6" />
        <p className="text-3xl font-semibold text-gray-700 mb-4">Your cart is empty!</p>
        <p className="text-lg text-gray-500 mb-8">Add items to proceed to checkout.</p>
        <button
          onClick={() => navigate('home')}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 text-xl font-semibold"
        >
          Browse Books
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="container mx-auto py-8">
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12">Your Shopping Cart</h1>

        <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-100">
          <div className="space-y-6">
            {cartItems.map(item => {
              const itemDisplayPrice = `${userCurrencySymbol}${(convertPrice(item.price, userCurrencyCode) * item.quantity).toFixed(2)}`;
              const singleItemDisplayPrice = `${userCurrencySymbol}${convertPrice(item.price, userCurrencyCode).toFixed(2)}`;
              return (
                <div key={item.id} className="flex items-center border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-24 h-32 object-cover rounded-lg shadow-sm mr-6"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/96x128/cccccc/333333?text=${encodeURIComponent(item.title.substring(0, 5))}`; }}
                  />
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{item.title}</h3>
                    <p className="text-gray-600 text-base">by {item.author}</p>
                    <p className="text-gray-700 font-semibold text-lg mt-2">
                      {singleItemDisplayPrice} x {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-700 font-bold text-xl">{itemDisplayPrice}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200 shadow-md"
                      title="Remove item"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t-2 border-gray-200 flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-3xl font-extrabold text-gray-900">Total: <span className="text-green-700">{displayCartTotal}</span></h2>
            <div className="flex space-x-4">
              <button
                onClick={clearCart}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 transform hover:scale-105 font-semibold"
              >
                Clear Cart
              </button>
              <button
                onClick={() => navigate('checkout')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
