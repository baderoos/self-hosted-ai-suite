/*
  # Add knowledge base related content table

  1. New Tables
    - `knowledge_base_related_content`
      - `id` (uuid, primary key)
      - `article_id` (uuid, foreign key to knowledge_base_articles)
      - `related_article_id` (uuid, foreign key to knowledge_base_articles)
      - `relationship_type` (text, e.g., 'related', 'prerequisite', 'next-step')
      - `position` (integer, for ordering related content)
      - `created_at` (timestamptz)
      - `created_by` (uuid, foreign key to users)
  
  2. Security
    - Enable RLS on `knowledge_base_related_content` table
    - Add policy for viewing related content
    - Add policy for managing related content
  
  3. Indexes
    - Add index for article_id
    - Add index for related_article_id
    - Add unique constraint for article_id + related_article_id
*/

-- Create knowledge base related content table
CREATE TABLE IF NOT EXISTS knowledge_base_related_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES knowledge_base_articles(id) ON DELETE CASCADE,
  related_article_id UUID NOT NULL REFERENCES knowledge_base_articles(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN ('related', 'prerequisite', 'next-step', 'see-also')),
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(article_id, related_article_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_related_content_article_id ON knowledge_base_related_content(article_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_related_content_related_article_id ON knowledge_base_related_content(related_article_id);

-- Enable RLS
ALTER TABLE knowledge_base_related_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Knowledge base related content is viewable by all" 
  ON knowledge_base_related_content FOR SELECT 
  USING (true);

CREATE POLICY "Knowledge base related content is insertable by authenticated users" 
  ON knowledge_base_related_content FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Knowledge base related content is updatable by creator" 
  ON knowledge_base_related_content FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Knowledge base related content is deletable by creator" 
  ON knowledge_base_related_content FOR DELETE 
  USING (auth.uid() = created_by);

-- Create function to prevent self-referential relationships
CREATE OR REPLACE FUNCTION prevent_self_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.article_id = NEW.related_article_id THEN
    RAISE EXCEPTION 'An article cannot be related to itself';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to prevent self-referential relationships
CREATE TRIGGER prevent_self_reference_trigger
  BEFORE INSERT OR UPDATE ON knowledge_base_related_content
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_reference();

-- Create function to automatically create reciprocal relationships
CREATE OR REPLACE FUNCTION create_reciprocal_relationship()
RETURNS TRIGGER AS $$
BEGIN
  -- Skip if this is already a reciprocal insert
  IF TG_ARGV[0]::boolean = TRUE THEN
    RETURN NEW;
  END IF;

  -- For 'related' and 'see-also' relationship types, create a reciprocal relationship
  IF NEW.relationship_type IN ('related', 'see-also') THEN
    -- Check if the reciprocal relationship already exists
    IF NOT EXISTS (
      SELECT 1 FROM knowledge_base_related_content
      WHERE article_id = NEW.related_article_id AND related_article_id = NEW.article_id
    ) THEN
      -- Insert the reciprocal relationship with a flag to prevent infinite recursion
      INSERT INTO knowledge_base_related_content (
        article_id, 
        related_article_id, 
        relationship_type, 
        position, 
        created_by
      )
      VALUES (
        NEW.related_article_id,
        NEW.article_id,
        NEW.relationship_type,
        NEW.position,
        NEW.created_by
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reciprocal relationships
CREATE TRIGGER create_reciprocal_relationship_trigger
  AFTER INSERT ON knowledge_base_related_content
  FOR EACH ROW
  EXECUTE FUNCTION create_reciprocal_relationship(FALSE);