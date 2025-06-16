/*
  # Add likes functionality

  1. New Tables
    - `article_likes`
      - `id` (uuid, primary key)
      - `article_id` (bigint, foreign key to articles)
      - `user_session` (text, to track anonymous users)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `article_likes` table
    - Add policy for public read/write access

  3. Changes
    - Add likes_count column to articles table for performance
*/

-- Create article_likes table
CREATE TABLE IF NOT EXISTS article_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id bigint NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_session text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(article_id, user_session)
);

-- Add likes_count column to articles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'likes_count'
  ) THEN
    ALTER TABLE articles ADD COLUMN likes_count integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE article_likes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to likes"
  ON article_likes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert likes"
  ON article_likes
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public delete own likes"
  ON article_likes
  FOR DELETE
  TO public
  USING (true);

-- Create function to update likes count
CREATE OR REPLACE FUNCTION update_article_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.article_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE articles 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.article_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_likes_count ON article_likes;
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON article_likes
  FOR EACH ROW EXECUTE FUNCTION update_article_likes_count();

-- Initialize likes_count for existing articles
UPDATE articles 
SET likes_count = (
  SELECT COUNT(*) 
  FROM article_likes 
  WHERE article_likes.article_id = articles.id
);