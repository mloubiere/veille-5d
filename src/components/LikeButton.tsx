import React from 'react';
import { Heart } from 'lucide-react';
import { useLikes } from '../hooks/useLikes';

interface LikeButtonProps {
  articleId: string;
  variant?: 'card' | 'article';
  className?: string;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  articleId, 
  variant = 'card',
  className = '' 
}) => {
  const { likesCount, isLiked, loading, toggleLike } = useLikes(articleId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike();
  };

  const baseClasses = "flex items-center gap-1 transition-all duration-200";
  const variantClasses = {
    card: "text-sm",
    article: "text-base"
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
      }`}
      aria-label={isLiked ? 'Retirer le like' : 'Liker cet article'}
    >
      <Heart
        className={`h-5 w-5 transition-colors duration-200 ${
          isLiked 
            ? 'fill-red-500 text-red-500' 
            : 'text-red-500 hover:fill-red-100'
        }`}
      />
      {likesCount > 0 && (
        <span className={`font-medium ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
          {likesCount}
        </span>
      )}
    </button>
  );
};

export default LikeButton;