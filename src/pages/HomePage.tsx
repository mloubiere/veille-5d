import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { Calendar, X, Filter } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import LikeButton from '../components/LikeButton';

interface Article {
  id: string;
  title: string;
  category: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

const HomePage = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [latestUpdate, setLatestUpdate] = useState<string>('');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    fetchArticles();
    // Restore scroll position when returning to the home page
    if (history.state?.scrollPosition) {
      window.scrollTo(0, history.state.scrollPosition);
    }
  }, [selectedCategories, startDate, endDate]);

  const fetchArticles = async () => {
    const { data: latestUpdateData, error: latestUpdateError } = await supabase
      .from('articles')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    if (latestUpdateError) {
      console.error('Error fetching latest update:', latestUpdateError);
    } else if (latestUpdateData && latestUpdateData.length > 0) {
      setLatestUpdate(latestUpdateData[0].updated_at);
    }

    let query = supabase
      .from('articles')
      .select('*')
      .order('created_at', { ascending: false });

    if (selectedCategories.length > 0) {
      query = query.in('category', selectedCategories);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return;
    }

    const { data: allArticles } = await supabase
      .from('articles')
      .select('category')
      .order('created_at', { ascending: false });

    setArticles(data || []);

    const uniqueCategories = [
      ...new Set(allArticles?.map((article) => article.category) || []),
    ];
    setCategories(uniqueCategories);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setIsDateModalOpen(false);
  };

  const clearCategoryFilter = () => {
    setSelectedCategories([]);
    setIsCategoryModalOpen(false);
  };

  const applyDateFilter = () => {
    setIsDateModalOpen(false);
  };

  const applyCategoryFilter = () => {
    setIsCategoryModalOpen(false);
  };

  // Save scroll position before navigating to an article
  const handleArticleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    history.replaceState({ scrollPosition: window.scrollY }, '');
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[200px] w-full">
        <img
          src="https://uispveoqrumgfbfwxxwr.supabase.co/storage/v1/object/sign/assets.veille.5d/Ux_Design_Isometric.jpg?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhc3NldHMudmVpbGxlLjVkL1V4X0Rlc2lnbl9Jc29tZXRyaWMuanBnIiwiaWF0IjoxNzQzNjQxMjY1LCJleHAiOjE3NzUxNzcyNjV9.s7MNqlJC3zt859HxeRPBtPb3Qdz1-HL4w4Epcg-1GBg"
          alt="Design Inspiration"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold text-white mb-6 leading-tight">
                Veille Practice Design
              </h1>
              <p className="text-m text-gray-200">
                Les dernières tendances en UX/UI Design, IA et technologies pour
                rester à la pointe de l'innovation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        <SearchBar />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>dernière mise à jour :</span>
            <span className="font-medium">
              {latestUpdate &&
                format(new Date(latestUpdate), 'dd MMMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex-1 min-w-0 flex flex-wrap gap-2">
            {/* Desktop Category Chips */}
            <div className="hidden sm:flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                    selectedCategories.includes(category)
                      ? 'bg-[#005953] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {/* Mobile Category Button */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className={`sm:hidden flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedCategories.length > 0
                  ? 'bg-[#005953] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtrer par catégorie
              {selectedCategories.length > 0 && (
                <span className="ml-1">({selectedCategories.length})</span>
              )}
            </button>
          </div>

          {/* Date Filter Button */}
          <button
            onClick={() => setIsDateModalOpen(true)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              startDate || endDate
                ? 'bg-[#005953] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-4 w-4" />
            Filtrer par date
            {(startDate || endDate) && (
              <span className="text-xs ml-2">
                {startDate && format(new Date(startDate), 'dd/MM/yy')}
                {startDate && endDate && ' - '}
                {endDate && format(new Date(endDate), 'dd/MM/yy')}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              onClick={handleArticleClick}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {article.image_url && (
                <img
                  src={article.image_url.startsWith('http') ? article.image_url : `/assets.veille.5d/${article.image_url}`}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-[#005953] font-medium">
                    {article.category}
                  </div>
                  <LikeButton articleId={article.id} variant="card" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {article.title}
                </h2>
                <div className="text-sm text-gray-500">
                  {format(new Date(article.created_at), 'dd MMMM yyyy', {
                    locale: fr,
                  })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Date Filter Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:w-96 sm:rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filtrer par date</h3>
                <button
                  onClick={() => setIsDateModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={clearDateFilter}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Réinitialiser
              </button>
              <button
                onClick={applyDateFilter}
                className="px-4 py-2 text-sm font-medium bg-[#005953] text-white rounded-md hover:bg-[#004440]"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:w-96 sm:rounded-lg overflow-hidden">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filtrer par catégorie</h3>
                <button
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      selectedCategories.includes(category)
                        ? 'bg-[#005953] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={clearCategoryFilter}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Réinitialiser
              </button>
              <button
                onClick={applyCategoryFilter}
                className="px-4 py-2 text-sm font-medium bg-[#005953] text-white rounded-md hover:bg-[#004440]"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;