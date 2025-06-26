/*
  # Support Center Schema for Nexus Platform

  1. New Tables
    - `knowledge_base_categories` - Categories for knowledge base articles
    - `knowledge_base_articles` - Knowledge base articles
    - `knowledge_base_article_tags` - Tags for knowledge base articles
    - `knowledge_base_article_views` - Article view tracking
    - `knowledge_base_article_feedback` - User feedback on articles
    - `community_questions` - Community forum questions
    - `community_answers` - Answers to community questions
    - `community_votes` - Votes on questions and answers
    - `community_tags` - Tags for community questions

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for proper data access control

  3. Changes
    - Extends the support center capabilities
*/

-- KNOWLEDGE BASE TABLES
--------------------------------------------------------------------------------

-- Knowledge base categories
CREATE TABLE IF NOT EXISTS knowledge_base_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES knowledge_base_categories(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge base articles
CREATE TABLE IF NOT EXISTS knowledge_base_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES knowledge_base_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  view_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  not_helpful_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Knowledge base article tags
CREATE TABLE IF NOT EXISTS knowledge_base_article_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES knowledge_base_articles(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(article_id, tag)
);

-- Knowledge base article views
CREATE TABLE IF NOT EXISTS knowledge_base_article_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES knowledge_base_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Knowledge base article feedback
CREATE TABLE IF NOT EXISTS knowledge_base_article_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID NOT NULL REFERENCES knowledge_base_articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_helpful BOOLEAN NOT NULL,
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- COMMUNITY FORUM TABLES
--------------------------------------------------------------------------------

-- Community questions
CREATE TABLE IF NOT EXISTS community_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'answered', 'closed')),
  view_count INTEGER NOT NULL DEFAULT 0,
  vote_count INTEGER NOT NULL DEFAULT 0,
  answer_count INTEGER NOT NULL DEFAULT 0,
  accepted_answer_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community answers
CREATE TABLE IF NOT EXISTS community_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  vote_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community votes
CREATE TABLE IF NOT EXISTS community_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('question', 'answer')),
  content_id UUID NOT NULL,
  vote_type INTEGER NOT NULL CHECK (vote_type IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Community tags
CREATE TABLE IF NOT EXISTS community_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Community question tags
CREATE TABLE IF NOT EXISTS community_question_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES community_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(question_id, tag_id)
);

-- SECURITY POLICIES
--------------------------------------------------------------------------------

-- Enable Row Level Security on all tables
ALTER TABLE knowledge_base_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_article_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_article_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_question_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for knowledge_base_categories table
CREATE POLICY "Knowledge base categories are viewable by all" 
  ON knowledge_base_categories FOR SELECT 
  USING (true);

-- Create policies for knowledge_base_articles table
CREATE POLICY "Published knowledge base articles are viewable by all" 
  ON knowledge_base_articles FOR SELECT 
  USING (status = 'published');

CREATE POLICY "Draft knowledge base articles are viewable by author" 
  ON knowledge_base_articles FOR SELECT 
  USING (status = 'draft' AND author_id = auth.uid());

-- Create policies for knowledge_base_article_tags table
CREATE POLICY "Knowledge base article tags are viewable by all" 
  ON knowledge_base_article_tags FOR SELECT 
  USING (true);

-- Create policies for knowledge_base_article_views table
CREATE POLICY "Knowledge base article views are insertable by all" 
  ON knowledge_base_article_views FOR INSERT 
  WITH CHECK (true);

-- Create policies for knowledge_base_article_feedback table
CREATE POLICY "Knowledge base article feedback is insertable by all" 
  ON knowledge_base_article_feedback FOR INSERT 
  WITH CHECK (true);

-- Create policies for community_questions table
CREATE POLICY "Community questions are viewable by all" 
  ON community_questions FOR SELECT 
  USING (true);

CREATE POLICY "Community questions are insertable by authenticated users" 
  ON community_questions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Community questions are updatable by author" 
  ON community_questions FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for community_answers table
CREATE POLICY "Community answers are viewable by all" 
  ON community_answers FOR SELECT 
  USING (true);

CREATE POLICY "Community answers are insertable by authenticated users" 
  ON community_answers FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Community answers are updatable by author" 
  ON community_answers FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for community_votes table
CREATE POLICY "Community votes are viewable by all" 
  ON community_votes FOR SELECT 
  USING (true);

CREATE POLICY "Community votes are insertable by authenticated users" 
  ON community_votes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Community votes are updatable by voter" 
  ON community_votes FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Community votes are deletable by voter" 
  ON community_votes FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for community_tags table
CREATE POLICY "Community tags are viewable by all" 
  ON community_tags FOR SELECT 
  USING (true);

-- Create policies for community_question_tags table
CREATE POLICY "Community question tags are viewable by all" 
  ON community_question_tags FOR SELECT 
  USING (true);

-- INDEXES
--------------------------------------------------------------------------------

CREATE INDEX idx_knowledge_base_categories_slug ON knowledge_base_categories(slug);
CREATE INDEX idx_knowledge_base_categories_parent_id ON knowledge_base_categories(parent_id);
CREATE INDEX idx_knowledge_base_articles_category_id ON knowledge_base_articles(category_id);
CREATE INDEX idx_knowledge_base_articles_slug ON knowledge_base_articles(slug);
CREATE INDEX idx_knowledge_base_articles_status ON knowledge_base_articles(status);
CREATE INDEX idx_knowledge_base_article_tags_article_id ON knowledge_base_article_tags(article_id);
CREATE INDEX idx_knowledge_base_article_views_article_id ON knowledge_base_article_views(article_id);
CREATE INDEX idx_knowledge_base_article_feedback_article_id ON knowledge_base_article_feedback(article_id);
CREATE INDEX idx_community_questions_user_id ON community_questions(user_id);
CREATE INDEX idx_community_questions_status ON community_questions(status);
CREATE INDEX idx_community_answers_question_id ON community_answers(question_id);
CREATE INDEX idx_community_answers_user_id ON community_answers(user_id);
CREATE INDEX idx_community_votes_user_id ON community_votes(user_id);
CREATE INDEX idx_community_votes_content ON community_votes(content_type, content_id);
CREATE INDEX idx_community_tags_slug ON community_tags(slug);
CREATE INDEX idx_community_question_tags_question_id ON community_question_tags(question_id);
CREATE INDEX idx_community_question_tags_tag_id ON community_question_tags(tag_id);

-- FUNCTIONS & TRIGGERS
--------------------------------------------------------------------------------

-- Function to increment article view count
CREATE OR REPLACE FUNCTION increment_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE knowledge_base_articles
  SET view_count = view_count + 1
  WHERE id = NEW.article_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment article view count
CREATE TRIGGER on_article_view
  AFTER INSERT ON knowledge_base_article_views
  FOR EACH ROW
  EXECUTE FUNCTION increment_article_view_count();

-- Function to update article helpful count
CREATE OR REPLACE FUNCTION update_article_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_helpful THEN
    UPDATE knowledge_base_articles
    SET helpful_count = helpful_count + 1
    WHERE id = NEW.article_id;
  ELSE
    UPDATE knowledge_base_articles
    SET not_helpful_count = not_helpful_count + 1
    WHERE id = NEW.article_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update article helpful count
CREATE TRIGGER on_article_feedback
  AFTER INSERT ON knowledge_base_article_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_article_helpful_count();

-- Function to increment question view count
CREATE OR REPLACE FUNCTION increment_question_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_questions
  SET view_count = view_count + 1
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment question view count on select
CREATE TRIGGER on_question_view
  AFTER SELECT ON community_questions
  FOR EACH ROW
  EXECUTE FUNCTION increment_question_view_count();

-- Function to update vote counts
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content_type = 'question' THEN
    UPDATE community_questions
    SET vote_count = vote_count + NEW.vote_type
    WHERE id = NEW.content_id;
  ELSIF NEW.content_type = 'answer' THEN
    UPDATE community_answers
    SET vote_count = vote_count + NEW.vote_type
    WHERE id = NEW.content_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update vote counts
CREATE TRIGGER on_vote_created
  AFTER INSERT ON community_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_vote_counts();

-- Function to update answer count
CREATE OR REPLACE FUNCTION update_answer_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE community_questions
  SET answer_count = answer_count + 1
  WHERE id = NEW.question_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update answer count
CREATE TRIGGER on_answer_created
  AFTER INSERT ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_answer_count();

-- Function to update accepted answer
CREATE OR REPLACE FUNCTION update_accepted_answer()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_accepted THEN
    -- Update the question to mark this answer as accepted
    UPDATE community_questions
    SET 
      accepted_answer_id = NEW.id,
      status = 'answered'
    WHERE id = NEW.question_id;
    
    -- Ensure only one answer is marked as accepted
    UPDATE community_answers
    SET is_accepted = false
    WHERE question_id = NEW.question_id AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update accepted answer
CREATE TRIGGER on_answer_accepted
  AFTER UPDATE ON community_answers
  FOR EACH ROW
  WHEN (OLD.is_accepted = false AND NEW.is_accepted = true)
  EXECUTE FUNCTION update_accepted_answer();

-- Function to update updated_at timestamp
CREATE TRIGGER set_knowledge_base_categories_updated_at
  BEFORE UPDATE ON knowledge_base_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_knowledge_base_articles_updated_at
  BEFORE UPDATE ON knowledge_base_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_community_questions_updated_at
  BEFORE UPDATE ON community_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_community_answers_updated_at
  BEFORE UPDATE ON community_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_community_tags_updated_at
  BEFORE UPDATE ON community_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- INITIAL DATA
--------------------------------------------------------------------------------

-- Insert knowledge base categories
INSERT INTO knowledge_base_categories (name, slug, description, icon, position)
VALUES 
  ('Getting Started', 'getting-started', 'Basic tutorials and guides for new users', 'Book', 1),
  ('Content Creation', 'content-creation', 'Guides for creating and editing content', 'Video', 2),
  ('AI Workflows', 'ai-workflows', 'How to use AI workflows and automation', 'Workflow', 3),
  ('Marketplace', 'marketplace', 'Using the Nexus Marketplace', 'Store', 4),
  ('Echo AI', 'echo-ai', 'Working with Echo AI and personalization', 'Brain', 5);

-- Insert community tags
INSERT INTO community_tags (name, slug, description)
VALUES 
  ('General', 'general', 'General questions about Nexus'),
  ('Troubleshooting', 'troubleshooting', 'Help with technical issues'),
  ('Feature Requests', 'feature-requests', 'Suggestions for new features'),
  ('Echo AI', 'echo-ai', 'Questions about Echo AI'),
  ('Content Creation', 'content-creation', 'Content creation and editing'),
  ('Marketplace', 'marketplace', 'Questions about the Marketplace');