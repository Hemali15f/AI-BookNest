import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { Globe, Heart } from 'lucide-react';
import { COUNTRY_CURRENCY_MAP } from '../../utils/currencyRates';

const Onboarding = ({ navigate }) => {
  const { user, updateUserProfile } = useContext(AuthContext);
  // Initialize with existing user data if available
  const [selectedCountry, setSelectedCountry] = useState(user?.country || '');
  const [selectedGenres, setSelectedGenres] = useState(user?.genres || []);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); // NEW: loading state

  const countries = Object.keys(COUNTRY_CURRENCY_MAP).sort().map(countryName => ({
    name: countryName,
  }));

  const genres = [
    'Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Thriller',
    'Romance', 'Horror', 'Biography', 'History', 'Self-Help',
    'Business', 'Cooking', 'Art', 'Travel', 'Young Adult',
    'Children', 'Poetry', 'Philosophy', 'Science', 'Technology'
  ];

  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
  };

  const handleGenreToggle = (genre) => {
    setSelectedGenres(prevGenres =>
      prevGenres.includes(genre)
        ? prevGenres.filter(g => g !== genre)
        : [...prevGenres, genre]
    );
  };

  const handleNextStep = async () => { // Made async
    if (step === 1 && selectedCountry) {
      setLoading(true);
      // Pass only the update, AuthContext handles Firestore save and currency derivation
      const result = await updateUserProfile({ country: selectedCountry });
      if (result.success) {
        setStep(2);
      } else {
        console.error("Failed to save country:", result.error);
        // Show a user-friendly error message
      }
      setLoading(false);
    }
  };

  const handleFinishOnboarding = async () => { // Made async
    if (selectedGenres.length > 0) {
      setLoading(true);
      // Pass only the update, AuthContext handles Firestore save
      const result = await updateUserProfile({ genres: selectedGenres });
      if (result.success) {
        navigate('home');
      } else {
        console.error("Failed to save genres:", result.error);
        // Show a user-friendly error message
      }
      setLoading(false);
    } else {
      console.log('Please select at least one genre.'); // Replaced alert
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-teal-200 p-4 pt-20">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl border border-gray-200">
        <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">Personalize Your Experience</h2>
        <p className="text-center text-gray-600 mb-8">Help us tailor your book recommendations.</p>

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center justify-center"><Globe className="w-6 h-6 mr-2" /> Where are you from?</h3>
            <div className="relative">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 text-lg"
                value={selectedCountry}
                onChange={handleCountryChange}
              >
                <option value="">Select your country</option>
                {countries.map(country => (
                  <option key={country.name} value={country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.757 7.586 5.343 9l4.95 4.95z"/></svg>
              </div>
            </div>
            <button
              onClick={handleNextStep}
              disabled={!selectedCountry || loading} // Disable while loading
              className={`w-full ${(!selectedCountry || loading) ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'} text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg text-lg transform hover:scale-105 flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Next'
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 flex items-center justify-center"><Heart className="w-6 h-6 mr-2" /> What genres do you love?</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {genres.map(genre => (
                <button
                  key={genre}
                  className={`px-4 py-2 rounded-full border-2 ${
                    selectedGenres.includes(genre)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  } transition duration-200 text-base font-medium`}
                  onClick={() => handleGenreToggle(genre)}
                >
                  {genre}
                </button>
              ))}
            </div>
            <button
              onClick={handleFinishOnboarding}
              disabled={selectedGenres.length === 0 || loading} // Disable while loading
              className={`w-full ${selectedGenres.length > 0 && !loading ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'} text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-lg text-lg transform hover:scale-105 flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finishing...
                </>
              ) : (
                'Finish Onboarding'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;