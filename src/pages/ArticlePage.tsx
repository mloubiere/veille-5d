import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { ArrowLeft } from 'lucide-react';
import LikeButton from '../components/LikeButton';
import { formatNotionContentForDisplay } from '../utils/notionFormatter';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  image_url: string;
  created_at: string;
  link: string;
}

const ArticlePage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [article, setArticle] = useState<Article | null>(null);
  const [formattedContent, setFormattedContent] = useState<string>('');
  const [similarArticles, setSimilarArticles] = useState<Article[]>([]);

  useEffect(() => {
    // Reset scroll position when the location (URL) changes
    window.scrollTo(0, 0);
    fetchArticle();
  }, [id, location.pathname]);

  const fetchArticle = async () => {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching article:', error);
      return;
    }

    setArticle(data);
    if (data?.content) {
      formatContent(data.content);
      fetchSimilarArticles(data);
    }
  };

  const fetchSimilarArticles = async (currentArticle: Article) => {
    const commonWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'et', 'ou', 'mais', 'donc', 'car', 'ni', 'or', 'de', 'à', 'pour', 'dans', 'par', 'sur', 'en']);
    const words = [...currentArticle.title.toLowerCase().split(/\W+/), ...currentArticle.content.toLowerCase().split(/\W+/)]
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    const uniqueWords = Array.from(new Set(words)).slice(0, 5);
    
    const searchConditions = uniqueWords.map(word => `content.ilike.%${word}%`).join(',');
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .or(`category.eq.${currentArticle.category},${searchConditions}`)
      .neq('id', currentArticle.id)
      .limit(3);

    if (error) {
      console.error('Error fetching similar articles:', error);
      return;
    }

    setSimilarArticles(data || []);
  };

  const formatContent = (content: string) => {
    try {
      // Try to parse as JSON first (Notion format)
      const parsedContent = JSON.parse(content);
      const formatted = formatNotionContentForDisplay(parsedContent);
      setFormattedContent(formatted);
    } catch (e) {
      // If not JSON, treat as legacy markdown/text content
      const sections = content.split(/(?=# |## |### )/);
      
      const formattedSections = sections.map(section => {
        if (section.startsWith('# ')) {
          return `<h1 class="text-3xl font-bold mt-8 mb-4">${section.substring(2)}</h1>`;
        }
        if (section.startsWith('## ')) {
          return `<h2 class="text-2xl font-bold mt-6 mb-3">${section.substring(3)}</h2>`;
        }
        if (section.startsWith('### ')) {
          return `<h3 class="text-xl font-semibold mt-4 mb-2">${section.substring(4)}</h3>`;
        }

        const paragraphs = section.split('\n\n');
        
        return paragraphs.map(paragraph => {
          if (!paragraph.trim()) return '';

          // Handle bold text
          let processedParagraph = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          
          // Handle italic text
          processedParagraph = processedParagraph.replace(/\*(.*?)\*/g, '<em>$1</em>');
          
          // Handle links
          const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
          processedParagraph = processedParagraph.replace(urlRegex, url => {
            return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-[#005953] hover:underline">${url}</a>`;
          });

          // Handle markdown-style links [text](url)
          processedParagraph = processedParagraph.replace(/\[([^\]]+)\]\(([^)]+)\)/g, 
            '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#005953] hover:underline">$1</a>'
          );

          return `<p class="mb-4 leading-relaxed">${processedParagraph}</p>`;
        }).join('\n');
      });

      setFormattedContent(formattedSections.join('\n'));
    }
  };

  if (!article) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#005953]"></div>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto">
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-gray-600 hover:text-gray-900 transition-colors duration-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l'accueil
      </Link>
      {article.image_url && (
        <img
          src={article.image_url.startsWith('http') ? article.image_url : `/assets.veille.5d/${article.image_url}`}
          alt={article.title}
          className="w-full h-64 object-cover rounded-lg mb-8"
        />
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-[#005953] font-medium">
            {article.category}
          </div>
          <LikeButton articleId={article.id} variant="article" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          {article.title}
        </h1>
        <div className="text-gray-500">
          {format(new Date(article.created_at), 'dd MMMM yyyy', { locale: fr })}
        </div>
        {article.link && (
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 bg-[#005953] text-white rounded-md hover:bg-[#004440] transition-colors duration-200"
          >
            Découvrir la ressource
          </a>
        )}
        <div 
          className="prose prose-lg max-w-none mt-8 [&>*]:max-w-none"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      </div>

      {/* Similar Articles Section */}
      {similarArticles.length > 0 && (
        <div className="mt-16 border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Articles similaires</h2>
          <div className="space-y-6">
            {similarArticles.map((similarArticle) => (
              <Link
                key={similarArticle.id}
                to={`/article/${similarArticle.id}`}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center">
                  {similarArticle.image_url && (
                    <div className="w-32 h-24">
                      <img
                        src={similarArticle.image_url.startsWith('http') ? similarArticle.image_url : `/assets.veille.5d/${similarArticle.image_url}`}
                        alt={similarArticle.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-[#005953] font-medium">
                        {similarArticle.category}
                      </div>
                      <LikeButton articleId={similarArticle.id} variant="card" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {similarArticle.title}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {format(new Date(similarArticle.created_at), 'dd MMMM yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default ArticlePage;