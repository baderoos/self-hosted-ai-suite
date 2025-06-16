/*
  # Analytics Schema for Nexus Platform

  1. New Tables
    - `analytics_dashboards` - User-created analytics dashboards
    - `analytics_widgets` - Widgets displayed on dashboards
    - `analytics_reports` - Scheduled and saved reports
    - `analytics_metrics` - Stored metrics data
    - `analytics_events` - User event tracking
    - `social_listening` - Social media monitoring data
    - `competitor_posts` - Tracked competitor social posts
    - `sentiment_analysis` - Sentiment analysis results

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for proper data access control

  3. Changes
    - Extends the analytics capabilities with more detailed schema
*/

-- ANALYTICS TABLES
--------------------------------------------------------------------------------

-- Analytics dashboards
CREATE TABLE IF NOT EXISTS analytics_dashboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  layout JSONB NOT NULL DEFAULT '{}'::JSONB,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, is_default) WHERE is_default = true
);

-- Analytics widgets
CREATE TABLE IF NOT EXISTS analytics_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dashboard_id UUID NOT NULL REFERENCES analytics_dashboards(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chart', 'metric', 'table', 'list', 'custom')),
  chart_type TEXT CHECK (chart_type IN ('line', 'bar', 'pie', 'area', 'scatter')),
  data_source TEXT NOT NULL,
  query JSONB NOT NULL DEFAULT '{}'::JSONB,
  options JSONB NOT NULL DEFAULT '{}'::JSONB,
  position JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics reports
CREATE TABLE IF NOT EXISTS analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  query JSONB NOT NULL DEFAULT '{}'::JSONB,
  format TEXT NOT NULL CHECK (format IN ('pdf', 'csv', 'json')),
  schedule TEXT CHECK (schedule IN ('daily', 'weekly', 'monthly', 'none')),
  last_run_at TIMESTAMPTZ,
  recipients TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics metrics
CREATE TABLE IF NOT EXISTS analytics_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(20, 4) NOT NULL,
  dimension TEXT,
  date DATE NOT NULL,
  source TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_category TEXT NOT NULL,
  properties JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SOCIAL LISTENING TABLES
--------------------------------------------------------------------------------

-- Social listening queries
CREATE TABLE IF NOT EXISTS social_listening_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] NOT NULL,
  platforms TEXT[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social listening mentions
CREATE TABLE IF NOT EXISTS social_listening_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_id UUID NOT NULL REFERENCES social_listening_queries(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT NOT NULL,
  author_name TEXT,
  author_username TEXT,
  content TEXT NOT NULL,
  post_url TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  sentiment DECIMAL(3, 2),
  engagement_count INTEGER NOT NULL DEFAULT 0,
  is_processed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform, platform_post_id)
);

-- Competitor posts
CREATE TABLE IF NOT EXISTS competitor_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  engagement JSONB NOT NULL DEFAULT '{}'::JSONB,
  published_at TIMESTAMPTZ NOT NULL,
  sentiment DECIMAL(3, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform, platform_post_id)
);

-- Sentiment analysis
CREATE TABLE IF NOT EXISTS sentiment_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_type TEXT NOT NULL CHECK (source_type IN ('post', 'mention', 'comment')),
  source_id TEXT NOT NULL,
  sentiment_score DECIMAL(3, 2) NOT NULL,
  positive_score DECIMAL(3, 2) NOT NULL,
  neutral_score DECIMAL(3, 2) NOT NULL,
  negative_score DECIMAL(3, 2) NOT NULL,
  topics JSONB NOT NULL DEFAULT '{}'::JSONB,
  entities JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_type, source_id)
);

-- SECURITY POLICIES
--------------------------------------------------------------------------------

-- Enable Row Level Security on all tables
ALTER TABLE analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_listening_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_listening_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitor_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics_dashboards table
CREATE POLICY "Analytics dashboards are viewable by owner" 
  ON analytics_dashboards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Analytics dashboards are insertable by owner" 
  ON analytics_dashboards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Analytics dashboards are updatable by owner" 
  ON analytics_dashboards FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Analytics dashboards are deletable by owner" 
  ON analytics_dashboards FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for analytics_widgets table
CREATE POLICY "Analytics widgets are viewable by dashboard owner" 
  ON analytics_widgets FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM analytics_dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Analytics widgets are insertable by dashboard owner" 
  ON analytics_widgets FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analytics_dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Analytics widgets are updatable by dashboard owner" 
  ON analytics_widgets FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM analytics_dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

CREATE POLICY "Analytics widgets are deletable by dashboard owner" 
  ON analytics_widgets FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM analytics_dashboards d
      WHERE d.id = dashboard_id AND d.user_id = auth.uid()
    )
  );

-- Create policies for analytics_reports table
CREATE POLICY "Analytics reports are viewable by owner" 
  ON analytics_reports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Analytics reports are insertable by owner" 
  ON analytics_reports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Analytics reports are updatable by owner" 
  ON analytics_reports FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Analytics reports are deletable by owner" 
  ON analytics_reports FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for analytics_metrics table
CREATE POLICY "Analytics metrics are viewable by owner" 
  ON analytics_metrics FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policies for analytics_events table
CREATE POLICY "Analytics events are insertable by user" 
  ON analytics_events FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Analytics events are viewable by user" 
  ON analytics_events FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policies for social_listening_queries table
CREATE POLICY "Social listening queries are viewable by owner" 
  ON social_listening_queries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Social listening queries are insertable by owner" 
  ON social_listening_queries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Social listening queries are updatable by owner" 
  ON social_listening_queries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Social listening queries are deletable by owner" 
  ON social_listening_queries FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for social_listening_mentions table
CREATE POLICY "Social listening mentions are viewable by query owner" 
  ON social_listening_mentions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM social_listening_queries q
      WHERE q.id = query_id AND q.user_id = auth.uid()
    )
  );

-- Create policies for competitor_posts table
CREATE POLICY "Competitor posts are viewable by competitor owner" 
  ON competitor_posts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM competitors c
      WHERE c.id = competitor_id AND c.user_id = auth.uid()
    )
  );

-- INDEXES
--------------------------------------------------------------------------------

CREATE INDEX idx_analytics_dashboards_user_id ON analytics_dashboards(user_id);
CREATE INDEX idx_analytics_widgets_dashboard_id ON analytics_widgets(dashboard_id);
CREATE INDEX idx_analytics_reports_user_id ON analytics_reports(user_id);
CREATE INDEX idx_analytics_metrics_user_id ON analytics_metrics(user_id);
CREATE INDEX idx_analytics_metrics_date ON analytics_metrics(date);
CREATE INDEX idx_analytics_metrics_metric_name ON analytics_metrics(metric_name);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_social_listening_queries_user_id ON social_listening_queries(user_id);
CREATE INDEX idx_social_listening_mentions_query_id ON social_listening_mentions(query_id);
CREATE INDEX idx_social_listening_mentions_platform ON social_listening_mentions(platform);
CREATE INDEX idx_competitor_posts_competitor_id ON competitor_posts(competitor_id);
CREATE INDEX idx_sentiment_analysis_source_type_id ON sentiment_analysis(source_type, source_id);

-- FUNCTIONS & TRIGGERS
--------------------------------------------------------------------------------

-- Function to create default dashboard for new users
CREATE OR REPLACE FUNCTION create_default_dashboard_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO analytics_dashboards (user_id, name, description, is_default)
  VALUES (NEW.id, 'Overview Dashboard', 'Default analytics overview', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default dashboard for new users
CREATE TRIGGER on_user_created_create_default_dashboard
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_dashboard_for_new_user();

-- Function to update updated_at timestamp
CREATE TRIGGER set_analytics_dashboards_updated_at
  BEFORE UPDATE ON analytics_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_analytics_widgets_updated_at
  BEFORE UPDATE ON analytics_widgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_analytics_reports_updated_at
  BEFORE UPDATE ON analytics_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_social_listening_queries_updated_at
  BEFORE UPDATE ON social_listening_queries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();