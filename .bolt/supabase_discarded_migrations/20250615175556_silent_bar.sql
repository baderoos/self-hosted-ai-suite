/*
  # Marketplace Schema for Nexus Platform

  1. New Tables
    - `marketplace_categories` - Categories for marketplace items
    - `marketplace_tags` - Tags for marketplace items
    - `marketplace_item_tags` - Many-to-many relationship between items and tags
    - `marketplace_collections` - Curated collections of marketplace items
    - `marketplace_collection_items` - Items in collections
    - `marketplace_wishlists` - User wishlists
    - `marketplace_wishlist_items` - Items in wishlists

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for proper data access control

  3. Changes
    - Extends the marketplace schema with additional features
*/

-- MARKETPLACE EXTENSION TABLES
--------------------------------------------------------------------------------

-- Marketplace categories
CREATE TABLE IF NOT EXISTS marketplace_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  parent_id UUID REFERENCES marketplace_categories(id) ON DELETE SET NULL,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketplace tags
CREATE TABLE IF NOT EXISTS marketplace_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketplace item tags (many-to-many)
CREATE TABLE IF NOT EXISTS marketplace_item_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES marketplace_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(item_id, tag_id)
);

-- Marketplace collections (curated sets of items)
CREATE TABLE IF NOT EXISTS marketplace_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT NOT NULL UNIQUE,
  thumbnail_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketplace collection items
CREATE TABLE IF NOT EXISTS marketplace_collection_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES marketplace_collections(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(collection_id, item_id)
);

-- Marketplace wishlists
CREATE TABLE IF NOT EXISTS marketplace_wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, is_default) WHERE is_default = true
);

-- Marketplace wishlist items
CREATE TABLE IF NOT EXISTS marketplace_wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES marketplace_wishlists(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(wishlist_id, item_id)
);

-- Marketplace item installations
CREATE TABLE IF NOT EXISTS marketplace_installations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('installed', 'pending', 'failed', 'uninstalled')),
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id, item_id)
);

-- SECURITY POLICIES
--------------------------------------------------------------------------------

-- Enable Row Level Security on all tables
ALTER TABLE marketplace_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_installations ENABLE ROW LEVEL SECURITY;

-- Create policies for marketplace_categories table
CREATE POLICY "Marketplace categories are viewable by all" 
  ON marketplace_categories FOR SELECT 
  USING (true);

-- Create policies for marketplace_tags table
CREATE POLICY "Marketplace tags are viewable by all" 
  ON marketplace_tags FOR SELECT 
  USING (true);

-- Create policies for marketplace_item_tags table
CREATE POLICY "Marketplace item tags are viewable by all" 
  ON marketplace_item_tags FOR SELECT 
  USING (true);

-- Create policies for marketplace_collections table
CREATE POLICY "Public marketplace collections are viewable by all" 
  ON marketplace_collections FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Private marketplace collections are viewable by creator" 
  ON marketplace_collections FOR SELECT 
  USING (auth.uid() = created_by);

-- Create policies for marketplace_collection_items table
CREATE POLICY "Marketplace collection items are viewable by all" 
  ON marketplace_collection_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_collections c
      WHERE c.id = collection_id AND (c.is_public = true OR c.created_by = auth.uid())
    )
  );

-- Create policies for marketplace_wishlists table
CREATE POLICY "Marketplace wishlists are viewable by owner" 
  ON marketplace_wishlists FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Marketplace wishlists are insertable by owner" 
  ON marketplace_wishlists FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Marketplace wishlists are updatable by owner" 
  ON marketplace_wishlists FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Marketplace wishlists are deletable by owner" 
  ON marketplace_wishlists FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for marketplace_wishlist_items table
CREATE POLICY "Marketplace wishlist items are viewable by owner" 
  ON marketplace_wishlist_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_wishlists w
      WHERE w.id = wishlist_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Marketplace wishlist items are insertable by owner" 
  ON marketplace_wishlist_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM marketplace_wishlists w
      WHERE w.id = wishlist_id AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Marketplace wishlist items are deletable by owner" 
  ON marketplace_wishlist_items FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_wishlists w
      WHERE w.id = wishlist_id AND w.user_id = auth.uid()
    )
  );

-- Create policies for marketplace_installations table
CREATE POLICY "Marketplace installations are viewable by owner" 
  ON marketplace_installations FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Marketplace installations are insertable by owner" 
  ON marketplace_installations FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Marketplace installations are updatable by owner" 
  ON marketplace_installations FOR UPDATE 
  USING (auth.uid() = user_id);

-- INDEXES
--------------------------------------------------------------------------------

CREATE INDEX idx_marketplace_categories_parent_id ON marketplace_categories(parent_id);
CREATE INDEX idx_marketplace_categories_slug ON marketplace_categories(slug);
CREATE INDEX idx_marketplace_tags_slug ON marketplace_tags(slug);
CREATE INDEX idx_marketplace_item_tags_item_id ON marketplace_item_tags(item_id);
CREATE INDEX idx_marketplace_item_tags_tag_id ON marketplace_item_tags(tag_id);
CREATE INDEX idx_marketplace_collections_slug ON marketplace_collections(slug);
CREATE INDEX idx_marketplace_collections_is_featured ON marketplace_collections(is_featured);
CREATE INDEX idx_marketplace_collection_items_collection_id ON marketplace_collection_items(collection_id);
CREATE INDEX idx_marketplace_wishlists_user_id ON marketplace_wishlists(user_id);
CREATE INDEX idx_marketplace_wishlist_items_wishlist_id ON marketplace_wishlist_items(wishlist_id);
CREATE INDEX idx_marketplace_installations_user_id ON marketplace_installations(user_id);
CREATE INDEX idx_marketplace_installations_item_id ON marketplace_installations(item_id);

-- FUNCTIONS & TRIGGERS
--------------------------------------------------------------------------------

-- Function to create default wishlist for new users
CREATE OR REPLACE FUNCTION create_default_wishlist_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO marketplace_wishlists (user_id, name, is_default)
  VALUES (NEW.id, 'Favorites', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default wishlist for new users
CREATE TRIGGER on_user_created_create_default_wishlist
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_wishlist_for_new_user();

-- Function to update updated_at timestamp
CREATE TRIGGER set_marketplace_categories_updated_at
  BEFORE UPDATE ON marketplace_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_marketplace_collections_updated_at
  BEFORE UPDATE ON marketplace_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_marketplace_wishlists_updated_at
  BEFORE UPDATE ON marketplace_wishlists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- INITIAL DATA
--------------------------------------------------------------------------------

-- Insert marketplace categories
INSERT INTO marketplace_categories (name, slug, description, icon, position)
VALUES 
  ('AI Models', 'ai-models', 'AI models for content generation and processing', 'Brain', 1),
  ('Workflows', 'workflows', 'Pre-configured automation workflows', 'Workflow', 2),
  ('Agents', 'agents', 'Specialized AI agents for specific tasks', 'Package', 3),
  ('Templates', 'templates', 'Content templates and presets', 'FileText', 4);

-- Insert marketplace tags
INSERT INTO marketplace_tags (name, slug)
VALUES 
  ('Video Generation', 'video-generation'),
  ('Audio Processing', 'audio-processing'),
  ('Image Generation', 'image-generation'),
  ('Text Processing', 'text-processing'),
  ('Editing', 'editing'),
  ('Social Media', 'social-media'),
  ('Podcast', 'podcast'),
  ('Beginner', 'beginner'),
  ('Advanced', 'advanced'),
  ('Free', 'free');

-- Insert featured collection
INSERT INTO marketplace_collections (name, description, slug, is_featured, created_by)
VALUES 
  ('Staff Picks', 'Curated selection of our favorite marketplace items', 'staff-picks', true, NULL),
  ('Getting Started', 'Essential items for new users', 'getting-started', true, NULL),
  ('Content Creator Essentials', 'Must-have tools for content creators', 'content-creator-essentials', true, NULL);