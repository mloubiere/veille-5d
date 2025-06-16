import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:id" element={
            <main className="container mx-auto px-4 py-8">
              <ArticlePage />
            </main>
          } />
          <Route path="/search" element={<SearchResults />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;