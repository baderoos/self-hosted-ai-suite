/*
  # Fix Community Schema Issues

  1. Changes
    - Add missing workspace_id to community_question_tags
    - Add missing workspace_id to community_question_views
    - Add missing workspace_id to community_answers
    - Add missing workspace_id to community_votes
  
  2. Security
    - Add policies for workspace-based access control
    - Fix existing policies
*/

-- Add workspace_id to community_question_tags if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_question_tags' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE community_question_tags ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_community_question_tags_workspace_id ON community_question_tags(workspace_id);
  END IF;
END $$;

-- Add workspace_id to community_question_views if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_question_views' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE community_question_views ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_community_question_views_workspace_id ON community_question_views(workspace_id);
  END IF;
END $$;

-- Add workspace_id to community_answers if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_answers' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE community_answers ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_community_answers_workspace_id ON community_answers(workspace_id);
  END IF;
END $$;

-- Add workspace_id to community_votes if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'community_votes' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE community_votes ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_community_votes_workspace_id ON community_votes(workspace_id);
  END IF;
END $$;

-- Create policies for workspace-based access control
CREATE POLICY IF NOT EXISTS "Users can view community answers in their workspaces"
  ON community_answers
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = community_answers.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view community votes in their workspaces"
  ON community_votes
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = community_votes.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view community question tags in their workspaces"
  ON community_question_tags
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = community_question_tags.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view community question views in their workspaces"
  ON community_question_views
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = community_question_views.workspace_id
      AND user_id = auth.uid()
    )
  );