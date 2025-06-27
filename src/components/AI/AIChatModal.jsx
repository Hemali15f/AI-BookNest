import React, { useState, useContext, useRef, useEffect } from 'react';
import { X, Send, Bot, User, BookText } from 'lucide-react';
import { AuthContext } from '../../contexts/AuthContext'; // To get userId and appId

// IMPORTANT: Replace with your actual deployed Cloud Function URL
const AI_CLOUD_FUNCTION_URL = "YOUR_FIREBASE_FUNCTION_URL_HERE"; 
// Example: "https://us-central1-your-project-id.cloudfunctions.net/generateBookRecommendation";

const AIChatModal = ({ isOpen, onClose }) => {
  const { user, userId, appId, isLoggedIn } = useContext(AuthContext); // Get user and app details
  const [messages, setMessages] = useState([]); // [{ type: 'ai'|'user', text: '', recommendation: {}|null }]
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      // Add initial welcome message from AI
      if (messages.length === 0) {
        setMessages([
          { type: 'ai', text: `Hello ${user?.name || 'there'}! I'm your AI BookNest recommender. Tell me your mood, interests, or what kind of story you're looking for!`, recommendation: null }
        ]);
      }
      scrollToBottom(); // Scroll to bottom when modal opens or messages update
    }
  }, [isOpen, messages, user?.name]);


  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { type: 'user', text: input.trim(), recommendation: null };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const promptForAI = userMessage.text;

    try {
      if (!isLoggedIn || !userId || !appId) {
        throw new Error("You must be logged in to use the AI recommender.");
      }
      if (!AI_CLOUD_FUNCTION_URL || AI_CLOUD_FUNCTION_URL === "YOUR_FIREBASE_FUNCTION_URL_HERE") {
        throw new Error("AI Cloud Function URL is not configured. Please update AIChatModal.jsx.");
      }

      console.log('AIChatModal: Sending request to AI Cloud Function:', promptForAI);
      const response = await fetch(AI_CLOUD_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Optionally, include Firebase ID Token for verification on backend
          // 'Authorization': `Bearer ${await auth.currentUser.getIdToken()}`
        },
        body: JSON.stringify({
          prompt: promptForAI,
          userId: userId,
          appId: appId
        }),
      });

      // --- ENHANCED ERROR HANDLING ---
      if (!response.ok) {
        let errorText = await response.text(); // Get raw text to see if it's HTML
        console.error('AIChatModal: Cloud Function responded with an error HTTP status:', response.status);
        console.error('AIChatModal: Cloud Function raw error response body:', errorText);
        
        let errorMessage = `AI service error (${response.status}): `;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += errorJson.message || JSON.stringify(errorJson);
        } catch (e) {
          // If it's not JSON, it's probably HTML or plain text error
          errorMessage += `Received non-JSON response (likely HTML error page). See console for details.`;
        }
        throw new Error(errorMessage);
      }
      // --- END ENHANCED ERROR HANDLING ---

      const data = await response.json();
      console.log('AIChatModal: AI Response Data:', data);

      const aiResponseText = data.recommendation?.summary || data.rawAIResponse || "I couldn't find a specific recommendation, please try rephrasing!";
      const recommendationDetails = data.recommendation;

      setMessages(prev => [...prev, { type: 'ai', text: aiResponseText, recommendation: recommendationDetails }]);

    } catch (error) {
      console.error('AIChatModal: Error in sendMessage:', error);
      setMessages(prev => [...prev, { type: 'ai', text: `Oops! There was an issue getting a recommendation: ${error.message}. Please try again.`, recommendation: null }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col vintage-card">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-f0e6d6 rounded-t-lg vintage-navbar">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Bot className="w-6 h-6 mr-2 text-purple-600" /> AI Book Recommender
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 transition duration-200 vintage-button bg-transparent hover:bg-gray-100 p-2 rounded-full"
            aria-label="Close Chat"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chat Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 vintage-bg">
          {!isLoggedIn && (
            <div className="text-center bg-yellow-100 border-yellow-400 border text-yellow-800 p-3 rounded-lg mb-4 text-sm">
              Please log in to save your AI recommendations to your personalized feed.
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
                msg.type === 'user' ? 'bg-blue-100 text-blue-800 vintage-button' : 'bg-gray-100 text-gray-800 vintage-card'
              }`}>
                <p className="font-semibold">{msg.type === 'user' ? 'You:' : 'AI BookNest:'}</p>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.recommendation && msg.recommendation.bookTitle && (
                  <div className="mt-2 p-3 bg-white border border-gray-200 rounded-md shadow-sm text-gray-800 vintage-card">
                    <h4 className="font-bold text-lg mb-1 flex items-center"><BookText className="w-5 h-5 mr-2 text-green-600"/>{msg.recommendation.bookTitle}</h4>
                    <p className="text-sm">by {msg.recommendation.author || 'N/A'}</p>
                    <p className="text-sm font-medium text-gray-600">Genre: {msg.recommendation.genre || 'N/A'}</p>
                    <p className="text-sm mt-2">{msg.recommendation.summary}</p>
                    <p className="text-xs italic mt-1 text-gray-500">Why: {msg.recommendation.whyThisBook}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg max-w-[70%] bg-gray-100 text-gray-800 shadow-sm vintage-card">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500 mr-2"></div>
                  AI is thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Scroll target */}
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-gray-200 flex vintage-navbar rounded-b-lg">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 vintage-input"
            placeholder="Ask me for a book recommendation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || input.trim() === ''}
            className="ml-3 bg-purple-600 text-white p-3 rounded-lg shadow-md hover:bg-purple-700 transition duration-300 transform hover:scale-105 vintage-button flex items-center justify-center"
            title="Send Message"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
