import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import Highlighter from 'react-highlight-words';
import { ArrowLeft } from 'lucide-react';
import SearchBar from '../components/SearchBar';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  created_at: string;
}

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const searchArticles = async () => {
      setLoading(true);
      
      if (!query.trim()) {
        setArticles([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`);

      if (error) {
        console.error('Error searching articles:', error);
        setArticles([]);
      } else {
        setArticles(data || []);
      }
      
      setLoading(false);
    };

    searchArticles();
  }, [query]);

  const getContentPreview = (content: string) => {
    if (!content) return '';
    
    // Remove HTML tags for the preview
    const textContent = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    const index = textContent.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return textContent.slice(0, 200) + '...';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(textContent.length, index + 150);
    return `...${textContent.slice(start, end)}...`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l'accueil
      </Link>

      <div className="mb-8">
        <SearchBar />
      </div>

      <h1 className="text-3xl font-bold mb-6">
        Résultats pour "{query}"
      </h1>

      {loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#005953]"></div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">Aucun résultat trouvé</p>
        </div>
      ) : (
        <div className="space-y-8">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.id}`}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row">
                {article.image_url && (
                  <div className="w-full md:w-48 h-48">
                    <img
                      src={article.image_url.startsWith('http') ? article.image_url : `/assets.veille.5d/${article.image_url}`}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="text-sm text-[#005953] font-medium mb-2">
                    <Highlighter
                      highlightClassName="bg-yellow-200"
                      searchWords={[query]}
                      autoEscape={true}
                      textToHighlight={article.category || ''}
                    />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    <Highlighter
                      highlightClassName="bg-yellow-200"
                      searchWords={[query]}
                      autoEscape={true}
                      textToHighlight={article.title}
                    />
                  </h2>
                  <p className="text-gray-600 mb-4">
                    <Highlighter
                      highlightClassName="bg-yellow-200"
                      searchWords={[query]}
                      autoEscape={true}
                      textToHighlight={getContentPreview(article.content)}
                    />
                  </p>
                  <div className="text-sm text-gray-500">
                    {format(new Date(article.created_at), 'dd MMMM yyyy', {
                      locale: fr,
                    })}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;