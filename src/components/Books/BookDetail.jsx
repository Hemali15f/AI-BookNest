import React, { useContext } from 'react';
import { CartContext } from '../../contexts/CartContext';
import { AuthContext } from '../../contexts/AuthContext'; // Import AuthContext for currency
import { ShoppingCart } from 'lucide-react';
import { convertPrice, MOCK_EXCHANGE_RATES } from '../../utils/currencyRates'; // Import conversion utility

const BookDetail = ({ book, navigate }) => {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext); // Access user for currency info

  if (!book) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 pt-20">
        <div className="text-center text-gray-600">
          <p className="text-2xl mb-4">No book selected.</p>
          <button
            onClick={() => navigate('home')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 transform hover:scale-105 text-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    // When adding to cart, store the base USD price
    addToCart({ ...book, price: book.priceUSD });
    alert(`${book.title} added to cart!`); // Use a custom modal in a real app
  };

  // Get the user's currency symbol for display
  const userCurrencySymbol = user?.currencySymbol || '$';
  const userCurrencyCode = Object.keys(MOCK_EXCHANGE_RATES).find(key => MOCK_EXCHANGE_RATES[key] === (MOCK_EXCHANGE_RATES[userCurrencySymbol] || 1.0)) || 'USD';
  const displayPrice = `${userCurrencySymbol}${convertPrice(book.priceUSD, userCurrencyCode).toFixed(2)}`;


  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="container mx-auto py-8">
        <button
          onClick={() => navigate('home')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Books
        </button>

        <div className="bg-white rounded-lg shadow-xl p-6 lg:flex lg:space-x-8 border border-gray-100">
          <div className="lg:w-1/3 flex justify-center items-start mb-6 lg:mb-0">
            <img
              src={book.imageUrl}
              alt={book.title}
              className="w-full max-w-xs lg:max-w-none rounded-lg shadow-md border border-gray-200 object-contain h-auto max-h-96"
              onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/300x400/cccccc/333333?text=${encodeURIComponent(book.title.substring(0, 15))}`; }}
            />
          </div>
          <div className="lg:w-2/3">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-700 mb-4">by <span className="font-semibold">{book.author}</span></p>
            <div className="flex items-center text-yellow-500 text-lg mb-4">
              {'★'.repeat(Math.floor(book.rating))}
              {'☆'.repeat(5 - Math.floor(book.rating))}
              <span className="ml-2 text-gray-600 font-medium">({book.rating} / 5)</span>
            </div>
            <p className="text-gray-800 text-lg leading-relaxed mb-6">
              <span className="font-semibold text-blue-700">Genre:</span> {book.genre}
              <br/>
              <span className="font-semibold text-blue-700">Description:</span> {book.description}
            </p>
            <div className="flex items-center justify-between mb-8">
              <span className="text-green-700 text-4xl font-bold">{displayPrice}</span> {/* Display converted price */}
              <button
                onClick={handleAddToCart}
                className="bg-purple-600 text-white px-8 py-4 rounded-lg shadow-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105 flex items-center text-xl font-semibold"
              >
                <ShoppingCart className="w-6 h-6 mr-2" /> Add to Cart
              </button>
            </div>
            <div className="text-gray-600 text-sm">
              <p>Delivery usually takes 3-5 business days.</p>
              <p>Free shipping on orders over {userCurrencySymbol || '$'}50.</p> {/* Update this text too */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;