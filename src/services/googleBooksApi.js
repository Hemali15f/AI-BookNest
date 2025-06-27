// src/services/googleBooksApi.js

// Removed MOCK_EXCHANGE_RATES import as it's not directly used for pricing logic here.
// Currency conversion logic resides in components and currencyRates.js
// import { MOCK_EXCHANGE_RATES } from '../utils/currencyRates';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

/**
 * Fetches books from the Google Books API based on a query.
 * @param {string} query The search query (e.g., "react programming", "harry potter").
 * @param {number} maxResults The maximum number of results to return (default: 20).
 * @returns {Array} An array of formatted book objects.
 */
export const searchBooks = async (query, maxResults = 20) => {
  if (!query) {
    return [];
  }
  try {
    const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data.items ? data.items.map(item => ({
      id: item.id,
      title: item.volumeInfo.title || 'No Title Available',
      author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
      genre: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'General',
      imageUrl: item.volumeInfo.imageLinks
        ? item.volumeInfo.imageLinks.thumbnail
        : 'https://placehold.co/150x200/cccccc/333333?text=No+Cover',
      description: item.volumeInfo.description || 'No description available.',
      // Generate price in USD, it will be converted for display later in components
      priceUSD: parseFloat((Math.random() * (30 - 8) + 8).toFixed(2)), // Random price between 8.00 and 30.00 USD
      rating: (Math.random() * (5 - 3) + 3).toFixed(1) // Random rating between 3.0 and 5.0
    })) : [];
  } catch (error) {
    console.error("Error fetching books:", error);
    return [];
  }
};

/**
 * Fetches a single book by its Google Books ID.
 * @param {string} bookId The Google Books volume ID.
 * @returns {Object|null} A formatted book object or null if not found.
 */
export const getBookById = async (bookId) => {
  if (!bookId) {
    return null;
  }
  try {
    const response = await fetch(`${BASE_URL}/${encodeURIComponent(bookId)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const item = await response.json();

    if (!item || !item.volumeInfo) return null;

    return {
      id: item.id,
      title: item.volumeInfo.title || 'No Title Available',
      author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown Author',
      genre: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'General',
      imageUrl: item.volumeInfo.imageLinks
        ? item.volumeInfo.imageLinks.thumbnail
        : 'https://placehold.co/150x200/cccccc/333333?text=No+Cover',
      description: item.volumeInfo.description || 'No description available.',
      priceUSD: parseFloat((Math.random() * (30 - 8) + 8).toFixed(2)),
      rating: (Math.random() * (5 - 3) + 3).toFixed(1)
    };
  } catch (error) {
    console.error("Error fetching book by ID:", error);
    return null;
  }
};
