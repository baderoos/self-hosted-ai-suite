/*
  # Social Media Management Schema for Nexus Platform

  1. New Tables
    - `social_campaigns` - Social media campaigns
    - `social_campaign_posts` - Posts associated with campaigns
    - `social_post_analytics` - Detailed analytics for social posts
    - `social_content_calendars` - Content calendars for planning
    - `social_calendar_entries` - Entries in content calendars
    - `social_hashtag_groups` - Groups of related hashtags
    - `social_hashtags` - Individual hashtags
    - `social_comments` - Comments on social posts
    - `social_comment_responses` - AI-generated response suggestions

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for proper data access control

  3. Changes
    - Extends the social media management capabilities
*/

-- SOCIAL MEDIA MANAGEMENT TABLES
--------------------------------------------------------------------------------

-- Social media campaigns
CREATE TABLE IF NOT EXISTS social_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  goals JSONB NOT NULL DEFAULT '{}'::JSONB,
  metrics JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social campaign posts
CREATE TABLE IF NOT EXISTS social_campaign_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES social_campaigns(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, post_id)
);

-- Social post analytics
CREATE TABLE IF NOT EXISTS social_post_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  reach INTEGER NOT NULL DEFAULT 0,
  engagement JSONB NOT NULL DEFAULT '{}'::JSONB,
  clicks JSONB NOT NULL DEFAULT '{}'::JSONB,
  demographics JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, date)
);

-- Social content calendars
CREATE TABLE IF NOT EXISTS social_content_calendars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, is_default) WHERE is_default = true
);

-- Social calendar entries
CREATE TABLE IF NOT EXISTS social_calendar_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  calendar_id UUID NOT NULL REFERENCES social_content_calendars(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  platforms TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL CHECK (status IN ('idea', 'draft', 'scheduled', 'published')),
  post_id UUID REFERENCES social_posts(id) ON DELETE SET NULL,
  content_draft TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social hashtag groups
CREATE TABLE IF NOT EXISTS social_hashtag_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Social hashtags
CREATE TABLE IF NOT EXISTS social_hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES social_hashtag_groups(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, hashtag)
);

-- Social comments
CREATE TABLE IF NOT EXISTS social_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES social_posts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_comment_id TEXT NOT NULL,
  author_name TEXT,
  author_username TEXT,
  content TEXT NOT NULL,
  published_at TIMESTAMPTZ NOT NULL,
  sentiment DECIMAL(3, 2),
  is_replied BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(platform, platform_comment_id)
);

-- Social comment responses
CREATE TABLE IF NOT EXISTS social_comment_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES social_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_ai_generated BOOLEAN NOT NULL DEFAULT true,
  sentiment_target DECIMAL(3, 2),
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SECURITY POLICIES
--------------------------------------------------------------------------------

-- Enable Row Level Security on all tables
ALTER TABLE social_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_campaign_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_content_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_calendar_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_hashtag_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_hashtags ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_comment_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for social_campaigns table
CREATE POLICY "Social campaigns are viewable by owner" 
  ON social_campaigns FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Social campaigns are insertable by owner" 
  ON social_campaigns FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Social campaigns are updatable by owner" 
  ON social_campaigns FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Social campaigns are deletable by owner" 
  ON social_campaigns FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for social_campaign_posts table
CREATE POLICY "Social campaign posts are viewable by campaign owner" 
  ON social_campaign_posts FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM social_campaigns c
      WHERE c.id = campaign_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Social campaign posts are insertable by campaign owner" 
  ON social_campaign_posts FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_campaigns c
      WHERE c.id = campaign_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Social campaign posts are deletable by campaign owner" 
  ON social_campaign_posts FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM social_campaigns c
      WHERE c.id = campaign_id AND c.user_id = auth.uid()
    )
  );

-- Create policies for social_post_analytics table
CREATE POLICY "Social post analytics are viewable by post owner" 
  ON social_post_analytics FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM social_posts p
      JOIN social_accounts a ON p.account_id = a.id
      WHERE p.id = post_id AND a.user_id = auth.uid()
    )
  );

-- Create policies for social_content_calendars table
CREATE POLICY "Social content calendars are viewable by owner" 
  ON social_content_calendars FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Social content calendars are insertable by owner" 
  ON social_content_calendars FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Social content calendars are updatable by owner" 
  ON social_content_calendars FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Social content calendars are deletable by owner" 
  ON social_content_calendars FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for social_calendar_entries table
CREATE POLICY "Social calendar entries are viewable by calendar owner" 
  ON social_calendar_entries FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM social_content_calendars c
      WHERE c.id = calendar_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Social calendar entries are insertable by calendar owner" 
  ON social_calendar_entries FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_content_calendars c
      WHERE c.id = calendar_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Social calendar entries are updatable by calendar owner" 
  ON social_calendar_entries FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM social_content_calendars c
      WHERE c.id = calendar_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "Social calendar entries are deletable by calendar owner" 
  ON social_calendar_entries FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM social_content_calendars c
      WHERE c.id = calendar_id AND c.user_id = auth.uid()
    )
  );

-- Create policies for social_hashtag_groups table
CREATE POLICY "Social hashtag groups are viewable by owner" 
  ON social_hashtag_groups FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Social hashtag groups are insertable by owner" 
  ON social_hashtag_groups FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Social hashtag groups are updatable by owner" 
  ON social_hashtag_groups FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Social hashtag groups are deletable by owner" 
  ON social_hashtag_groups FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for social_hashtags table
CREATE POLICY "Social hashtags are viewable by group owner" 
  ON social_hashtags FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM social_hashtag_groups g
      WHERE g.id = group_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "Social hashtags are insertable by group owner" 
  ON social_hashtags FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_hashtag_groups g
      WHERE g.id = group_id AND g.user_id = auth.uid()
    )
  );

CREATE POLICY "Social hashtags are deletable by group owner" 
  ON social_hashtags FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM social_hashtag_groups g
      WHERE g.id = group_id AND g.user_id = auth.uid()
    )
  );

-- Create policies for social_comments table
CREATE POLICY "Social comments are viewable by post owner" 
  ON social_comments FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM social_posts p
      JOIN social_accounts a ON p.account_id = a.id
      WHERE p.id = post_id AND a.user_id = auth.uid()
    )
  );

-- Create policies for social_comment_responses table
CREATE POLICY "Social comment responses are viewable by comment owner" 
  ON social_comment_responses FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM social_comments c
      JOIN social_posts p ON c.post_id = p.id
      JOIN social_accounts a ON p.account_id = a.id
      WHERE c.id = comment_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Social comment responses are insertable by comment owner" 
  ON social_comment_responses FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_comments c
      JOIN social_posts p ON c.post_id = p.id
      JOIN social_accounts a ON p.account_id = a.id
      WHERE c.id = comment_id AND a.user_id = auth.uid()
    )
  );

CREATE POLICY "Social comment responses are updatable by comment owner" 
  ON social_comment_responses FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM social_comments c
      JOIN social_posts p ON c.post_id = p.id
      JOIN social_accounts a ON p.account_id = a.id
      WHERE c.id = comment_id AND a.user_id = auth.uid()
    )
  );

-- INDEXES
--------------------------------------------------------------------------------

CREATE INDEX idx_social_campaigns_user_id ON social_campaigns(user_id);
CREATE INDEX idx_social_campaigns_status ON social_campaigns(status);
CREATE INDEX idx_social_campaign_posts_campaign_id ON social_campaign_posts(campaign_id);
CREATE INDEX idx_social_campaign_posts_post_id ON social_campaign_posts(post_id);
CREATE INDEX idx_social_post_analytics_post_id ON social_post_analytics(post_id);
CREATE INDEX idx_social_post_analytics_date ON social_post_analytics(date);
CREATE INDEX idx_social_content_calendars_user_id ON social_content_calendars(user_id);
CREATE INDEX idx_social_calendar_entries_calendar_id ON social_calendar_entries(calendar_id);
CREATE INDEX idx_social_calendar_entries_scheduled_date ON social_calendar_entries(scheduled_date);
CREATE INDEX idx_social_calendar_entries_status ON social_calendar_entries(status);
CREATE INDEX idx_social_hashtag_groups_user_id ON social_hashtag_groups(user_id);
CREATE INDEX idx_social_hashtags_group_id ON social_hashtags(group_id);
CREATE INDEX idx_social_comments_post_id ON social_comments(post_id);
CREATE INDEX idx_social_comment_responses_comment_id ON social_comment_responses(comment_id);

-- FUNCTIONS & TRIGGERS
--------------------------------------------------------------------------------

-- Function to create default content calendar for new users
CREATE OR REPLACE FUNCTION create_default_content_calendar_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO social_content_calendars (user_id, name, description, is_default)
  VALUES (NEW.id, 'Main Calendar', 'Default content calendar', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default content calendar for new users
CREATE TRIGGER on_user_created_create_default_content_calendar
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_content_calendar_for_new_user();

-- Function to update updated_at timestamp
CREATE TRIGGER set_social_campaigns_updated_at
  BEFORE UPDATE ON social_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_social_post_analytics_updated_at
  BEFORE UPDATE ON social_post_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_social_content_calendars_updated_at
  BEFORE UPDATE ON social_content_calendars
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_social_calendar_entries_updated_at
  BEFORE UPDATE ON social_calendar_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_social_hashtag_groups_updated_at
  BEFORE UPDATE ON social_hashtag_groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update post status when calendar entry is published
CREATE OR REPLACE FUNCTION update_post_status_on_calendar_entry_publish()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND NEW.post_id IS NOT NULL THEN
    UPDATE social_posts
    SET status = 'published', published_time = now()
    WHERE id = NEW.post_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update post status when calendar entry is published
CREATE TRIGGER on_calendar_entry_publish
  AFTER UPDATE ON social_calendar_entries
  FOR EACH ROW
  WHEN (OLD.status != 'published' AND NEW.status = 'published')
  EXECUTE FUNCTION update_post_status_on_calendar_entry_publish();