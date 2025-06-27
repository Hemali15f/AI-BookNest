import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { searchBooks } from '../../services/googleBooksApi';
import BookCard from './BookCard';
import Spinner from '../Common/Spinner';
import { Search } from 'lucide-react';

const Home = ({ navigate, setSelectedBook }) => {
  const { user } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndSetBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        let query = searchTerm;

        if (!searchTerm && user?.genres && user.genres.length > 0) {
          query = user.genres.slice(0, 3).join(' OR ');
        } else if (!searchTerm) {
          query = 'bestsellers'; // Changed default query to be more general
        }

        const fetchedBooks = await searchBooks(query, 20);
        setBooks(fetchedBooks);
      } catch (err) {
        setError('Failed to fetch books. Please try again.');
        console.error("Error in Home component fetching books:", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceSearch = setTimeout(() => {
      fetchAndSetBooks();
    }, 500);

    return () => clearTimeout(debounceSearch);
  }, [searchTerm, user]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-20">
      <div className="container mx-auto py-8">
        <h1 className="text-5xl font-extrabold text-center text-gray-900 mb-12 animate-fade-in-down">
          Welcome to AI BOOKNEST!
        </h1>

        <div className="max-w-xl mx-auto mb-10">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search books by title, author, or genre..."
              className="w-full px-5 py-3 pr-12 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md text-lg transition duration-200"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute right-4 text-gray-500 w-6 h-6" />
          </div>
        </div>

        {user?.genres && user.genres.length > 0 && (
          <div className="mb-8 text-center bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg shadow-sm">
            <p className="font-semibold text-lg">Your Preferred Genres:</p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {user.genres.map(genre => (
                <span key={genre} className="bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading && <Spinner />}

        {error && (
          <p className="text-center text-red-500 text-xl mt-10">{error}</p>
        )}

        {!loading && !error && books.length === 0 && (
          <p className="text-center text-gray-600 text-xl mt-10">No books found matching your criteria. Try a different search!</p>
        )}
https://github.com/Hemali15f/AI-BookNest/blob/main/src/components/Books/Home.jsx
        {!loading && !error && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {books.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onClick={() => {
                  setSelectedBook(book);
                  navigate('bookDetail');
                }}
                userCurrencySymbol={user?.currencySymbol || '$'} // Pass currency symbol
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
