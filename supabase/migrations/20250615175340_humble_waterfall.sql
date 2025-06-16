/*
  # Initial Database Schema for Nexus Platform

  1. New Tables
    - `users` - User accounts and authentication
    - `profiles` - Extended user profile information
    - `subscriptions` - User subscription plans and billing
    - `content_items` - Media content (videos, images, audio)
    - `projects` - User projects containing multiple content items
    - `ai_models` - Available AI models for content generation
    - `model_versions` - Version history for AI models
    - `workflows` - AI workflow templates
    - `workflow_steps` - Individual steps in workflows
    - `workflow_executions` - Records of workflow runs
    - `marketplace_items` - Items available in the marketplace
    - `marketplace_reviews` - User reviews for marketplace items
    - `marketplace_purchases` - Record of user purchases
    - `social_accounts` - Connected social media accounts
    - `social_posts` - Posts scheduled or published to social media
    - `social_analytics` - Analytics data for social media performance
    - `support_tickets` - User support requests
    - `support_messages` - Messages in support conversations
    - `learning_insights` - AI-generated insights from Echo
    - `user_interactions` - User activity tracking for Echo AI learning
    - `user_preferences` - User preferences and settings

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for proper data access control
    - Role-based permissions (admin, creator, viewer)

  3. Changes
    - Initial schema creation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS & AUTHENTICATION
--------------------------------------------------------------------------------

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login TIMESTAMPTZ
);

-- User profiles with extended information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  website TEXT,
  company TEXT,
  job_title TEXT,
  location TEXT,
  timezone TEXT,
  preferences JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  interval TEXT NOT NULL CHECK (interval IN ('monthly', 'yearly')),
  features JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  payment_provider TEXT,
  payment_provider_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CONTENT MANAGEMENT
--------------------------------------------------------------------------------

-- Content items (videos, images, audio files)
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'image', 'audio', 'text', 'generated')),
  file_path TEXT,
  file_size BIGINT,
  mime_type TEXT,
  duration DECIMAL(10, 2),
  width INTEGER,
  height INTEGER,
  thumbnail_url TEXT,
  metadata JSONB DEFAULT '{}'::JSONB,
  is_generated BOOLEAN NOT NULL DEFAULT false,
  generation_model TEXT,
  generation_prompt TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Projects (collections of content)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Project content items (many-to-many)
CREATE TABLE IF NOT EXISTS project_content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, content_item_id)
);

-- Timeline clips
CREATE TABLE IF NOT EXISTS timeline_clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  content_item_id UUID REFERENCES content_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'audio', 'image', 'generated')),
  duration DECIMAL(10, 2) NOT NULL,
  start_time DECIMAL(10, 2) NOT NULL,
  end_time DECIMAL(10, 2) NOT NULL,
  track INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI MODELS & WORKFLOWS
--------------------------------------------------------------------------------

-- AI models
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video-generation', 'audio-processing', 'image-generation', 'text-processing', 'editing')),
  description TEXT,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  requirements JSONB NOT NULL DEFAULT '{}'::JSONB,
  performance JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_installed BOOLEAN NOT NULL DEFAULT false,
  size TEXT,
  license TEXT NOT NULL CHECK (license IN ('open-source', 'commercial', 'research')),
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI model versions
CREATE TABLE IF NOT EXISTS model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  release_notes TEXT,
  download_url TEXT,
  is_latest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow templates
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  estimated_duration TEXT,
  complexity TEXT CHECK (complexity IN ('beginner', 'intermediate', 'advanced')),
  required_inputs TEXT[] NOT NULL DEFAULT '{}',
  expected_outputs TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow steps
CREATE TABLE IF NOT EXISTS workflow_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  agent TEXT NOT NULL,
  estimated_time TEXT,
  position INTEGER NOT NULL,
  dependencies UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow executions
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('initiated', 'processing', 'completed', 'error')),
  progress INTEGER NOT NULL DEFAULT 0,
  current_step TEXT,
  logs JSONB[] NOT NULL DEFAULT '{}',
  result JSONB DEFAULT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- MARKETPLACE
--------------------------------------------------------------------------------

-- Marketplace items
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('model', 'workflow', 'agent', 'template')),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price_type TEXT NOT NULL CHECK (price_type IN ('free', 'paid', 'subscription')),
  price_amount DECIMAL(10, 2),
  price_currency TEXT DEFAULT 'USD',
  price_period TEXT CHECK (price_period IN ('monthly', 'yearly', 'one-time')),
  version TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  compatibility TEXT[] NOT NULL DEFAULT '{}',
  screenshots TEXT[] NOT NULL DEFAULT '{}',
  documentation TEXT,
  download_url TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Marketplace reviews
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  content TEXT,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  is_verified_purchase BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(item_id, user_id)
);

-- Marketplace purchases
CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES marketplace_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('completed', 'pending', 'refunded', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOCIAL MEDIA MANAGEMENT
--------------------------------------------------------------------------------

-- Social media accounts
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  account_id TEXT NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT,
  profile_url TEXT,
  avatar_url TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_connected BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

-- Social media posts
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  content TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  platform_post_id TEXT,
  scheduled_time TIMESTAMPTZ,
  published_time TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social media analytics
CREATE TABLE IF NOT EXISTS social_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  post_id UUID REFERENCES social_posts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Competitor tracking
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  accounts JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Competitor analytics
CREATE TABLE IF NOT EXISTS competitor_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  date DATE NOT NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SUPPORT & LEARNING
--------------------------------------------------------------------------------

-- Support tickets
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Support messages
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'support')),
  content TEXT NOT NULL,
  attachments TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tutorials
CREATE TABLE IF NOT EXISTS tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'article')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  view_count INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ECHO AI LEARNING
--------------------------------------------------------------------------------

-- User interactions for Echo AI learning
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::JSONB,
  outcome TEXT CHECK (outcome IN ('success', 'failure', 'abandoned')),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow patterns identified by Echo
CREATE TABLE IF NOT EXISTS workflow_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 0,
  modules TEXT[] NOT NULL DEFAULT '{}',
  actions TEXT[] NOT NULL DEFAULT '{}',
  confidence DECIMAL(4, 3) NOT NULL,
  last_used TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Echo AI insights
CREATE TABLE IF NOT EXISTS learning_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('workflow', 'preference', 'optimization', 'prediction')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(4, 3) NOT NULL,
  impact TEXT NOT NULL CHECK (impact IN ('low', 'medium', 'high')),
  actionable BOOLEAN NOT NULL DEFAULT true,
  suggested_action TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_applied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User preferences learned by Echo
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  confidence DECIMAL(4, 3) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, preference_key)
);

-- Style profiles for AI Persona
CREATE TABLE IF NOT EXISTS style_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  editing_style JSONB NOT NULL DEFAULT '{}'::JSONB,
  color_grading JSONB NOT NULL DEFAULT '{}'::JSONB,
  audio_style JSONB NOT NULL DEFAULT '{}'::JSONB,
  content_preferences JSONB NOT NULL DEFAULT '{}'::JSONB,
  platform_optimization JSONB NOT NULL DEFAULT '{}'::JSONB,
  strength INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SECURITY POLICIES
--------------------------------------------------------------------------------

-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE model_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" 
  ON users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- Create policies for profiles table
CREATE POLICY "Profiles are viewable by owner" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Profiles are updatable by owner" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create policies for content_items table
CREATE POLICY "Content items are viewable by owner" 
  ON content_items FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Content items are insertable by owner" 
  ON content_items FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Content items are updatable by owner" 
  ON content_items FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Content items are deletable by owner" 
  ON content_items FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for projects table
CREATE POLICY "Projects are viewable by owner" 
  ON projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Projects are insertable by owner" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Projects are updatable by owner" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Projects are deletable by owner" 
  ON projects FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for marketplace_items table
CREATE POLICY "Marketplace items are viewable by all" 
  ON marketplace_items FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Marketplace items are insertable by creator" 
  ON marketplace_items FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Marketplace items are updatable by creator" 
  ON marketplace_items FOR UPDATE 
  USING (auth.uid() = creator_id);

-- Create policies for marketplace_reviews table
CREATE POLICY "Marketplace reviews are viewable by all" 
  ON marketplace_reviews FOR SELECT 
  USING (true);

CREATE POLICY "Marketplace reviews are insertable by purchasers" 
  ON marketplace_reviews FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for social_accounts table
CREATE POLICY "Social accounts are viewable by owner" 
  ON social_accounts FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Social accounts are insertable by owner" 
  ON social_accounts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Social accounts are updatable by owner" 
  ON social_accounts FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Social accounts are deletable by owner" 
  ON social_accounts FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for support_tickets table
CREATE POLICY "Support tickets are viewable by owner" 
  ON support_tickets FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Support tickets are insertable by authenticated users" 
  ON support_tickets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policies for user_interactions table
CREATE POLICY "User interactions are insertable by user" 
  ON user_interactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User interactions are viewable by user" 
  ON user_interactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policies for learning_insights table
CREATE POLICY "Learning insights are viewable by user" 
  ON learning_insights FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Learning insights are updatable by user" 
  ON learning_insights FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for style_profiles table
CREATE POLICY "Style profiles are viewable by owner" 
  ON style_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Style profiles are updatable by owner" 
  ON style_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- INDEXES
--------------------------------------------------------------------------------

-- Users and profiles
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Content
CREATE INDEX idx_content_items_user_id ON content_items(user_id);
CREATE INDEX idx_content_items_type ON content_items(type);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_timeline_clips_project_id ON timeline_clips(project_id);

-- AI Models and Workflows
CREATE INDEX idx_ai_models_type ON ai_models(type);
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX idx_workflow_executions_status ON workflow_executions(status);

-- Marketplace
CREATE INDEX idx_marketplace_items_category ON marketplace_items(category);
CREATE INDEX idx_marketplace_items_price_type ON marketplace_items(price_type);
CREATE INDEX idx_marketplace_reviews_item_id ON marketplace_reviews(item_id);
CREATE INDEX idx_marketplace_purchases_user_id ON marketplace_purchases(user_id);

-- Social
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_posts_account_id ON social_posts(account_id);
CREATE INDEX idx_social_posts_status ON social_posts(status);

-- Support
CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_messages_ticket_id ON support_messages(ticket_id);

-- Echo AI Learning
CREATE INDEX idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX idx_user_interactions_module ON user_interactions(module);
CREATE INDEX idx_learning_insights_user_id ON learning_insights(user_id);
CREATE INDEX idx_learning_insights_type ON learning_insights(type);

-- FUNCTIONS & TRIGGERS
--------------------------------------------------------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables with updated_at column
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('
      CREATE TRIGGER set_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', t, t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO profiles (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Function to track content item views
CREATE OR REPLACE FUNCTION increment_tutorial_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tutorials
  SET view_count = view_count + 1
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tutorial views
CREATE TRIGGER on_tutorial_view
  AFTER SELECT ON tutorials
  FOR EACH ROW
  EXECUTE FUNCTION increment_tutorial_views();

-- INITIAL DATA
--------------------------------------------------------------------------------

-- Insert subscription plans
INSERT INTO subscription_plans (name, code, description, price, interval, features, is_active)
VALUES 
  ('Creator', 'creator', 'For individual creators and small teams', 29.00, 'monthly', 
   '{"content_generation": 50000, "video_exports": "1080p", "ai_workflows": 5, "hive_agents": 3, "social_accounts": 5}'::JSONB, 
   true),
  ('Pro', 'pro', 'For professional creators and medium-sized teams', 79.00, 'monthly', 
   '{"content_generation": -1, "video_exports": "4K", "ai_workflows": 50, "hive_agents": 20, "social_accounts": 25}'::JSONB, 
   true),
  ('Enterprise', 'enterprise', 'For large organizations with advanced needs', 299.00, 'monthly', 
   '{"content_generation": -1, "video_exports": "4K", "ai_workflows": -1, "hive_agents": -1, "social_accounts": -1}'::JSONB, 
   true);

-- Insert AI models
INSERT INTO ai_models (name, display_name, provider, type, description, capabilities, requirements, performance, size, license, featured)
VALUES 
  ('hunyuan-video', 'HunyuanVideo', 'Tencent', 'video-generation', 
   'State-of-the-art text-to-video generation with exceptional quality and temporal consistency',
   ARRAY['Text-to-Video', 'High Resolution', 'Long Duration', 'Temporal Consistency'],
   '{"gpu": "RTX 4090 / A100", "ram": "32GB", "storage": "50GB", "vram": "24GB"}'::JSONB,
   '{"speed": 85, "quality": 95, "efficiency": 80}'::JSONB,
   '12.5GB', 'open-source', true),
  ('gemini-1.5-pro', 'Gemini 1.5 Pro', 'Google', 'text-processing',
   'The most capable multimodal model with 1M token context window for complex reasoning and analysis',
   ARRAY['Text Generation', 'Multimodal Understanding', 'Long Context', 'Function Calling'],
   '{"gpu": "Cloud-based", "ram": "N/A", "storage": "N/A", "vram": "N/A"}'::JSONB,
   '{"speed": 90, "quality": 98, "efficiency": 95}'::JSONB,
   'Cloud API', 'commercial', true);

-- Insert model versions
INSERT INTO model_versions (model_id, version, release_notes, is_latest)
VALUES 
  ((SELECT id FROM ai_models WHERE name = 'hunyuan-video'), '1.0', 'Initial release with 4K support', true),
  ((SELECT id FROM ai_models WHERE name = 'gemini-1.5-pro'), '1.5', 'Improved context handling and reasoning capabilities', true);

-- Insert workflow templates
INSERT INTO workflows (name, description, category, estimated_duration, complexity, required_inputs, expected_outputs)
VALUES 
  ('The Podcast Workflow', 'Complete podcast production pipeline', 'podcast', '2h 15m', 'intermediate',
   ARRAY['Multi-camera footage', 'Audio tracks'],
   ARRAY['Final edit', 'Social clips', 'Transcript', 'Highlights reel']),
  ('Viral Content Factory', 'Extract and optimize viral moments for social media', 'social', '45m', 'beginner',
   ARRAY['Source video'],
   ARRAY['TikTok clips', 'Instagram Reels', 'YouTube Shorts']);

-- Insert workflow steps for Podcast Workflow
DO $$
DECLARE
  workflow_id UUID;
BEGIN
  SELECT id INTO workflow_id FROM workflows WHERE name = 'The Podcast Workflow';
  
  INSERT INTO workflow_steps (workflow_id, name, description, agent, estimated_time, position, dependencies)
  VALUES 
    (workflow_id, 'Multi-Camera Sync', 'Synchronize multiple camera angles using audio waveforms', 'editor-ai', '15 min', 1, '{}'),
    (workflow_id, 'Audio Transcription', 'Generate accurate transcript with speaker identification', 'transcriber', '30 min', 2, '{}'),
    (workflow_id, 'Silence Removal', 'Automatically detect and remove long pauses and dead air', 'editor-ai', '20 min', 3, ARRAY[(SELECT id FROM workflow_steps WHERE workflow_id = workflow_id AND position = 1)]),
    (workflow_id, 'Scene Analysis', 'Identify key moments and conversation topics', 'vision-ai', '25 min', 4, ARRAY[(SELECT id FROM workflow_steps WHERE workflow_id = workflow_id AND position = 2)]),
    (workflow_id, 'Intelligent Editing', 'Create dynamic edit with optimal camera switching', 'editor-ai', '45 min', 5, ARRAY[(SELECT id FROM workflow_steps WHERE workflow_id = workflow_id AND position = 3), (SELECT id FROM workflow_steps WHERE workflow_id = workflow_id AND position = 4)]),
    (workflow_id, 'Audio Enhancement', 'Professional audio cleanup and mastering', 'audio-ai', '20 min', 6, ARRAY[(SELECT id FROM workflow_steps WHERE workflow_id = workflow_id AND position = 5)]),
    (workflow_id, 'Social Media Clips', 'Generate viral-worthy clips for social platforms', 'editor-ai', '30 min', 7, ARRAY[(SELECT id FROM workflow_steps WHERE workflow_id = workflow_id AND position = 4)]);
END $$;

-- Insert tutorials
INSERT INTO tutorials (title, description, duration, type, difficulty, category, tags, view_count)
VALUES 
  ('Getting Started with Nexus', 'Complete beginner''s guide to the platform', '15 min', 'video', 'Beginner', 'Getting Started', 
   ARRAY['basics', 'introduction', 'overview'], 12500),
  ('Creating Your First AI Workflow', 'Step-by-step workflow automation tutorial', '22 min', 'video', 'Intermediate', 'AI Workflows', 
   ARRAY['workflow', 'automation', 'ai'], 8300),
  ('Training Echo AI for Your Style', 'Personalize your AI assistant for optimal results', '18 min', 'video', 'Advanced', 'Echo AI', 
   ARRAY['echo', 'personalization', 'ai-training'], 6700),
  ('Marketplace Mastery Guide', 'Find, purchase, and integrate marketplace items', '12 min', 'article', 'Beginner', 'Marketplace', 
   ARRAY['marketplace', 'models', 'integration'], 9100);