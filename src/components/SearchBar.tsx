import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher des articles, tags..."
          className="w-full px-4 py-3 pr-12 bg-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#005953] focus:ring-opacity-50"
        />
        <button
          type="submit"
          className="absolute right-2 p-2 text-white bg-[#005953] rounded-md hover:bg-[#004440] transition-colors duration-200"
          aria-label="Rechercher"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;