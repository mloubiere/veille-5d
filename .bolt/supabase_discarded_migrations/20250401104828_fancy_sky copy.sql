/*
  # Blog Schema Setup

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `content` (text, required)
      - `category` (text, required)
      - `image_url` (text)
      - `created_at` (timestamp with timezone)
      - `updated_at` (timestamp with timezone)

  2. Security
    - Enable RLS on `articles` table
    - Add policy for public read access
*/

CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON articles
  FOR SELECT
  TO public
  USING (true);