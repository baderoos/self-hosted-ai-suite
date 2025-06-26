/*
  # Echo AI Schema for Nexus Platform

  1. New Tables
    - `echo_state` - Stores the current state of Echo AI for each user
    - `echo_interactions` - Detailed tracking of user interactions for learning
    - `echo_patterns` - Workflow patterns identified by Echo
    - `echo_insights` - AI-generated insights from user behavior
    - `echo_suggestions` - Personalized suggestions for users

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for proper data access control

  3. Changes
    - Extends the initial schema with Echo AI specific tables
*/

-- ECHO AI CORE TABLES
--------------------------------------------------------------------------------

-- Echo AI state for each user
CREATE TABLE IF NOT EXISTS echo_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_learning BOOLEAN NOT NULL DEFAULT false,
  learning_progress INTEGER NOT NULL DEFAULT 0,
  total_interactions INTEGER NOT NULL DEFAULT 0,
  active_workflows TEXT[] NOT NULL DEFAULT '{}',
  system_health JSONB NOT NULL DEFAULT '{"status": "optimal", "performance": 98}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Echo AI interactions
CREATE TABLE IF NOT EXISTS echo_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  action TEXT NOT NULL,
  context JSONB NOT NULL DEFAULT '{}'::JSONB,
  outcome TEXT CHECK (outcome IN ('success', 'failure', 'abandoned')),
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Echo AI identified patterns
CREATE TABLE IF NOT EXISTS echo_patterns (
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
CREATE TABLE IF NOT EXISTS echo_insights (
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

-- Echo AI suggestions
CREATE TABLE IF NOT EXISTS echo_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workflow', 'content', 'optimization', 'feature')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence DECIMAL(4, 3) NOT NULL,
  action_data JSONB DEFAULT '{}'::JSONB,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SECURITY POLICIES
--------------------------------------------------------------------------------

-- Enable Row Level Security on all tables
ALTER TABLE echo_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE echo_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for echo_state table
CREATE POLICY "Echo state is viewable by owner" 
  ON echo_state FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Echo state is updatable by owner" 
  ON echo_state FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for echo_interactions table
CREATE POLICY "Echo interactions are insertable by user" 
  ON echo_interactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Echo interactions are viewable by user" 
  ON echo_interactions FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policies for echo_patterns table
CREATE POLICY "Echo patterns are viewable by user" 
  ON echo_patterns FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policies for echo_insights table
CREATE POLICY "Echo insights are viewable by user" 
  ON echo_insights FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Echo insights are updatable by user" 
  ON echo_insights FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policies for echo_suggestions table
CREATE POLICY "Echo suggestions are viewable by user" 
  ON echo_suggestions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Echo suggestions are updatable by user" 
  ON echo_suggestions FOR UPDATE 
  USING (auth.uid() = user_id);

-- INDEXES
--------------------------------------------------------------------------------

-- Echo AI tables
CREATE INDEX idx_echo_state_user_id ON echo_state(user_id);
CREATE INDEX idx_echo_interactions_user_id ON echo_interactions(user_id);
CREATE INDEX idx_echo_interactions_module ON echo_interactions(module);
CREATE INDEX idx_echo_patterns_user_id ON echo_patterns(user_id);
CREATE INDEX idx_echo_insights_user_id ON echo_insights(user_id);
CREATE INDEX idx_echo_insights_type ON echo_insights(type);
CREATE INDEX idx_echo_suggestions_user_id ON echo_suggestions(user_id);
CREATE INDEX idx_echo_suggestions_module ON echo_suggestions(module);

-- FUNCTIONS & TRIGGERS
--------------------------------------------------------------------------------

-- Function to create Echo state for new users
CREATE OR REPLACE FUNCTION create_echo_state_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO echo_state (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create Echo state for new users
CREATE TRIGGER on_user_created_create_echo_state
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_echo_state_for_new_user();

-- Function to process new Echo interactions
CREATE OR REPLACE FUNCTION process_echo_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total interactions count
  UPDATE echo_state
  SET 
    total_interactions = total_interactions + 1,
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to process new Echo interactions
CREATE TRIGGER on_echo_interaction_created
  AFTER INSERT ON echo_interactions
  FOR EACH ROW
  EXECUTE FUNCTION process_echo_interaction();

-- Function to update updated_at timestamp
CREATE TRIGGER set_echo_state_updated_at
  BEFORE UPDATE ON echo_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_echo_patterns_updated_at
  BEFORE UPDATE ON echo_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();