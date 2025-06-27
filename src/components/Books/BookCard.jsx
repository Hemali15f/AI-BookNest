import React from 'react';
import { convertPrice, MOCK_EXCHANGE_RATES } from '../../utils/currencyRates';

const BookCard = ({ book, onClick, userCurrencySymbol }) => {
  // `displayPrice` variable was declared but `finalDisplayPrice` was used.
  // Removed the redundant `displayPrice` declaration.

  // Determine the currency code based on the symbol provided by the user context.
  // Default to 'USD' if no specific mapping is found.
  const userCurrencyCode = Object.keys(MOCK_EXCHANGE_RATES).find(key => MOCK_EXCHANGE_RATES[key] === (MOCK_EXCHANGE_RATES[userCurrencySymbol] || 1.0)) || 'USD';
  
  // Calculate the final price to display, formatted with the correct symbol and 2 decimal places.
  const finalDisplayPrice = `${userCurrencySymbol || '$'}${convertPrice(book.priceUSD, userCurrencyCode).toFixed(2)}`;

  return (
    <div
      className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out cursor-pointer border border-gray-100"
      onClick={onClick}
    >
      <img
  src={book.imageUrl?.replace(/^http:/, 'https:')}
  alt={book.title}
  className="w-full h-64 object-cover"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = `https://placehold.co/150x200/cccccc/333333?text=${encodeURIComponent(book.title?.substring(0, 10) || 'Book')}`;
  }}
/>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">{book.title}</h3>
        <p className="text-gray-600 text-sm mb-2 truncate">by {book.author}</p>
        <div className="flex items-center text-yellow-500 text-sm mb-2">
          {'★'.repeat(Math.floor(book.rating))}
          {'☆'.repeat(5 - Math.floor(book.rating))}
          <span className="ml-1 text-gray-600">({book.rating})</span>
        </div>
        <p className="text-green-600 font-semibold text-lg">{finalDisplayPrice}</p>
      </div>
    </div>
  );
};

export default BookCard;
