import React, { useState, useContext } from 'react';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext'; // NEW: Import AuthContext
import { CreditCard, CheckCircle, XCircle, ShoppingCart } from 'lucide-react';

const Checkout = ({ navigate }) => {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { incrementOrderStats } = useContext(AuthContext); // NEW: Get incrementOrderStats
  
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'failure', null

  const formatCardNumber = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    const formatted = digitsOnly.match(/.{1,4}/g)?.join(' ') || '';
    return formatted.substring(0, 19);
  };

  const formatExpiryDate = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length > 2) {
      return `${digitsOnly.substring(0, 2)}/${digitsOnly.substring(2, 4)}`;
    }
    return digitsOnly.substring(0, 4);
  };

  const handleSimulatePayment = async (e) => { // Made async
    e.preventDefault();
    setProcessing(true);
    setPaymentStatus(null);

    const isValid = cardNumber.replace(/\s/g, '').length === 16 &&
                    expiryDate.length === 5 &&
                    cvv.length === 3 &&
                    cardHolder.trim() !== '';

    setTimeout(async () => { // Keep async inside setTimeout for delay
      if (isValid) {
        setPaymentStatus('success');
        clearCart(); // Clear cart on successful 'payment'
        
        // NEW: Increment order statistics in Firestore
        // Note: cartTotal from CartContext is already in USD because that's how it's stored
        await incrementOrderStats(cartTotal); 

      } else {
        setPaymentStatus('failure');
      }
      setProcessing(false);
    }, 2000); // Simulate network delay
  };

  if (cartItems.length === 0 && paymentStatus !== 'success') {
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
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12">Simulated Checkout</h1>

        {paymentStatus === 'success' ? (
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-xl mx-auto text-center border border-green-200">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
            <p className="text-xl text-gray-700 mb-8">Thank you for your purchase. Your order has been placed.</p>
            <button
              onClick={() => navigate('home')}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 text-xl font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        ) : paymentStatus === 'failure' ? (
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-xl mx-auto text-center border border-red-200">
            <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Payment Failed!</h2>
            <p className="text-xl text-gray-700 mb-8">There was an issue processing your payment. Please try again.</p>
            <button
              onClick={() => setPaymentStatus(null)}
              className="bg-red-600 text-white px-8 py-4 rounded-lg shadow-md hover:bg-red-700 transition duration-300 transform hover:scale-105 text-xl font-semibold"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('cart')}
              className="ml-4 bg-gray-200 text-gray-700 px-8 py-4 rounded-lg shadow-md hover:bg-gray-300 transition duration-300 transform hover:scale-105 text-xl font-semibold"
            >
              Back to Cart
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto border border-gray-100">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8 flex items-center justify-center">
              <CreditCard className="w-8 h-8 mr-3 text-blue-600" /> Payment Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Order Summary */}
              <div>
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Order Summary</h3>
                <ul className="space-y-3">
                  {cartItems.map(item => (
                    <li key={item.id} className="flex justify-between text-lg text-gray-700 border-b border-gray-100 pb-2">
                      <span>{item.title} x {item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between text-xl font-bold text-gray-900 pt-4">
                    <span>Total:</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </li>
                </ul>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSimulatePayment} className="space-y-5">
                <div>
                  <label htmlFor="cardHolder" className="block text-gray-700 text-sm font-semibold mb-2">
                    Card Holder Name
                  </label>
                  <input
                    type="text"
                    id="cardHolder"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cardNumber" className="block text-gray-700 text-sm font-semibold mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg"
                    value={formatCardNumber(cardNumber)}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="XXXX XXXX XXXX XXXX"
                    maxLength="19"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiryDate" className="block text-gray-700 text-sm font-semibold mb-2">
                      Expiry Date (MM/YY)
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg"
                      value={formatExpiryDate(expiryDate)}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      placeholder="MM/YY"
                      maxLength="5"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-gray-700 text-sm font-semibold mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 text-lg"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                      placeholder="XXX"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={processing}
                  className={`w-full ${
                    processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg text-lg transform hover:scale-105 flex items-center justify-center`}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Simulate Payment'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
