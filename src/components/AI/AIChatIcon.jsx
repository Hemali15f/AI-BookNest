import React from 'react';
import { Bot } from 'lucide-react'; // A nice icon for AI

const AIChatIcon = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-lg hover:bg-purple-700 transition duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300 z-50"
      aria-label="Open AI Chat"
      title="Chat with AI Book Recommender"
    >
      <Bot className="w-8 h-8" />
    </button>
  );
};

export default AIChatIcon;
