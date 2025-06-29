/*
  # Fix Knowledge Base Schema Issues

  1. Changes
    - Add missing workspace_id to knowledge_base_article_tags
    - Add missing workspace_id to knowledge_base_article_views
    - Add missing workspace_id to knowledge_base_article_feedback
    - Add missing workspace_id to knowledge_base_related_content
  
  2. Security
    - Add policies for workspace-based access control
    - Fix existing policies
*/

-- Add workspace_id to knowledge_base_article_tags if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_base_article_tags' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE knowledge_base_article_tags ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_article_tags_workspace_id ON knowledge_base_article_tags(workspace_id);
  END IF;
END $$;

-- Add workspace_id to knowledge_base_article_views if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_base_article_views' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE knowledge_base_article_views ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_article_views_workspace_id ON knowledge_base_article_views(workspace_id);
  END IF;
END $$;

-- Add workspace_id to knowledge_base_article_feedback if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_base_article_feedback' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE knowledge_base_article_feedback ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_article_feedback_workspace_id ON knowledge_base_article_feedback(workspace_id);
  END IF;
END $$;

-- Add workspace_id to knowledge_base_related_content if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'knowledge_base_related_content' AND column_name = 'workspace_id'
  ) THEN
    ALTER TABLE knowledge_base_related_content ADD COLUMN workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_knowledge_base_related_content_workspace_id ON knowledge_base_related_content(workspace_id);
  END IF;
END $$;

-- Create policies for workspace-based access control
CREATE POLICY IF NOT EXISTS "Users can view knowledge base article tags in their workspaces"
  ON knowledge_base_article_tags
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_tags.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view knowledge base article views in their workspaces"
  ON knowledge_base_article_views
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_views.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view knowledge base article feedback in their workspaces"
  ON knowledge_base_article_feedback
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_feedback.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view knowledge base related content in their workspaces"
  ON knowledge_base_related_content
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_related_content.workspace_id
      AND user_id = auth.uid()
    )
  );

-- INSERT, UPDATE, DELETE policies for knowledge_base_article_tags
CREATE POLICY IF NOT EXISTS "Users can insert knowledge base article tags in their workspaces"
  ON knowledge_base_article_tags
  FOR INSERT
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_tags.workspace_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users can update knowledge base article tags in their workspaces"
  ON knowledge_base_article_tags
  FOR UPDATE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_tags.workspace_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_tags.workspace_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users can delete knowledge base article tags in their workspaces"
  ON knowledge_base_article_tags
  FOR DELETE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_tags.workspace_id
      AND user_id = auth.uid()
    )
  );

-- INSERT, UPDATE, DELETE policies for knowledge_base_article_views
CREATE POLICY IF NOT EXISTS "Users can insert knowledge base article views in their workspaces"
  ON knowledge_base_article_views
  FOR INSERT
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_views.workspace_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users can update knowledge base article views in their workspaces"
  ON knowledge_base_article_views
  FOR UPDATE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_views.workspace_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_views.workspace_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users can delete knowledge base article views in their workspaces"
  ON knowledge_base_article_views
  FOR DELETE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_views.workspace_id
      AND user_id = auth.uid()
    )
  );

-- INSERT, UPDATE, DELETE policies for knowledge_base_article_feedback
CREATE POLICY IF NOT EXISTS "Users can insert knowledge base article feedback in their workspaces"
  ON knowledge_base_article_feedback
  FOR INSERT
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_feedback.workspace_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users can update knowledge base article feedback in their workspaces"
  ON knowledge_base_article_feedback
  FOR UPDATE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_feedback.workspace_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_feedback.workspace_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users can delete knowledge base article feedback in their workspaces"
  ON knowledge_base_article_feedback
  FOR DELETE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_article_feedback.workspace_id
      AND user_id = auth.uid()
    )
  );

-- INSERT, UPDATE, DELETE policies for knowledge_base_related_content
CREATE POLICY IF NOT EXISTS "Users can insert knowledge base related content in their workspaces"
  ON knowledge_base_related_content
  FOR INSERT
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_related_content.workspace_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users can update knowledge base related content in their workspaces"
  ON knowledge_base_related_content
  FOR UPDATE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_related_content.workspace_id
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_related_content.workspace_id
      AND user_id = auth.uid()
    )
  );
CREATE POLICY IF NOT EXISTS "Users can delete knowledge base related content in their workspaces"
  ON knowledge_base_related_content
  FOR DELETE
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_related_content.workspace_id
      AND user_id = auth.uid()
    )
  );