import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Generate a unique session ID for anonymous users
const getSessionId = () => {
  let sessionId = localStorage.getItem('user_session_id');
  if (!sessionId) {
    sessionId = 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('user_session_id', sessionId);
  }
  return sessionId;
};

export const useLikes = (articleId: string) => {
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const sessionId = getSessionId();

  useEffect(() => {
    fetchLikeStatus();
  }, [articleId]);

  const fetchLikeStatus = async () => {
    try {
      // Get the current likes count from the articles table
      const { data: articleData, error: articleError } = await supabase
        .from('articles')
        .select('likes_count')
        .eq('id', articleId)
        .single();

      if (articleError) {
        console.error('Error fetching article likes count:', articleError);
        return;
      }

      setLikesCount(articleData?.likes_count || 0);

      // Check if current user has liked this article
      const { data: likeData, error: likeError } = await supabase
        .from('article_likes')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_session', sessionId)
        .limit(1);

      if (likeError) {
        console.error('Error checking like status:', likeError);
        return;
      }

      setIsLiked(likeData && likeData.length > 0);
    } catch (error) {
      console.error('Error in fetchLikeStatus:', error);
    }
  };

  const toggleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', articleId)
          .eq('user_session', sessionId);

        if (error) {
          console.error('Error removing like:', error);
          return;
        }

        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Add like
        const { error } = await supabase
          .from('article_likes')
          .insert({
            article_id: articleId,
            user_session: sessionId
          });

        if (error) {
          console.error('Error adding like:', error);
          return;
        }

        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error in toggleLike:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    likesCount,
    isLiked,
    loading,
    toggleLike
  };
};