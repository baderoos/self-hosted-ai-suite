/*
  # Multi-Tenant SaaS Schema

  1. New Tables
    - `workspaces` - Core table for multi-tenant workspaces
    - `workspace_members` - Join table for users and workspaces with roles
    - `subscriptions` - Workspace subscription information
    - `workspace_invitations` - Pending invitations to workspaces
  
  2. Security
    - Enable RLS on all tables
    - Add policies for proper data isolation
    - Ensure workspace-based access control
  
  3. Changes
    - Add workspace_id to existing tables
    - Create functions for workspace management
*/

-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  logo_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create workspace_members join table
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz DEFAULT now() NOT NULL,
  PRIMARY KEY (workspace_id, user_id)
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  workspace_id uuid PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  plan_id text NOT NULL CHECK (plan_id IN ('creator', 'pro', 'enterprise')),
  status text NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'past_due')),
  trial_end timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create workspace_invitations table
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add workspace_id to existing tables
ALTER TABLE knowledge_base_categories ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE knowledge_base_articles ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE community_questions ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE community_tags ADD COLUMN IF NOT EXISTS workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE;

-- Create indexes for workspace_id columns
CREATE INDEX IF NOT EXISTS idx_knowledge_base_categories_workspace_id ON knowledge_base_categories(workspace_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_articles_workspace_id ON knowledge_base_articles(workspace_id);
CREATE INDEX IF NOT EXISTS idx_community_questions_workspace_id ON community_questions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_community_tags_workspace_id ON community_tags(workspace_id);

-- Create function to automatically add workspace owner as a member with 'owner' role
CREATE OR REPLACE FUNCTION add_workspace_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add workspace owner as a member
CREATE TRIGGER add_workspace_owner_trigger
AFTER INSERT ON workspaces
FOR EACH ROW
EXECUTE FUNCTION add_workspace_owner_as_member();

-- Create function to generate a unique slug for workspaces
CREATE OR REPLACE FUNCTION generate_unique_workspace_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- If slug is not provided, generate one from the name
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]', '-', 'g'));
  END IF;
  
  -- Ensure slug is unique by appending a number if needed
  DECLARE
    base_slug TEXT := NEW.slug;
    counter INT := 1;
  BEGIN
    WHILE EXISTS (SELECT 1 FROM workspaces WHERE slug = NEW.slug AND id != NEW.id) LOOP
      NEW.slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to generate unique slugs
CREATE TRIGGER generate_workspace_slug_trigger
BEFORE INSERT OR UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION generate_unique_workspace_slug();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspaces
CREATE POLICY "Users can view workspaces they are members of"
  ON workspaces
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON workspaces
  FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update their workspaces"
  ON workspaces
  FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete their workspaces"
  ON workspaces
  FOR DELETE
  USING (owner_id = auth.uid());

-- Create RLS policies for workspace_members
CREATE POLICY "Users can view members of workspaces they belong to"
  ON workspace_members
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners and admins can add members"
  ON workspace_members
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners and admins can update member roles"
  ON workspace_members
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners and admins can remove members"
  ON workspace_members
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view subscriptions for workspaces they belong to"
  ON subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = subscriptions.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for workspace_invitations
CREATE POLICY "Users can view invitations for workspaces they manage"
  ON workspace_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_invitations.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners and admins can create invitations"
  ON workspace_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_invitations.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners and admins can delete invitations"
  ON workspace_invitations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_invitations.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Create RLS policies for knowledge base tables with workspace isolation
CREATE POLICY "Users can view knowledge base categories in their workspaces"
  ON knowledge_base_categories
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_categories.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view knowledge base articles in their workspaces"
  ON knowledge_base_articles
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = knowledge_base_articles.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view community questions in their workspaces"
  ON community_questions
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = community_questions.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view community tags in their workspaces"
  ON community_tags
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = community_tags.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Create function to get user's workspaces
CREATE OR REPLACE FUNCTION get_user_workspaces(user_uuid uuid)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo_url text,
  role text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.name, w.slug, w.logo_url, wm.role, w.created_at
  FROM workspaces w
  JOIN workspace_members wm ON w.id = wm.workspace_id
  WHERE wm.user_id = user_uuid
  ORDER BY w.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get workspace subscription status
CREATE OR REPLACE FUNCTION get_workspace_subscription(workspace_uuid uuid)
RETURNS TABLE (
  plan_id text,
  status text,
  trial_end timestamptz,
  current_period_end timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.plan_id, s.status, s.trial_end, s.current_period_end
  FROM subscriptions s
  WHERE s.workspace_id = workspace_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to invite user to workspace
CREATE OR REPLACE FUNCTION invite_user_to_workspace(
  workspace_uuid uuid,
  user_email text,
  user_role text,
  inviter_uuid uuid
)
RETURNS uuid AS $$
DECLARE
  invitation_id uuid;
  invitation_token text;
BEGIN
  -- Generate a random token
  invitation_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert the invitation
  INSERT INTO workspace_invitations (
    workspace_id,
    email,
    role,
    token,
    expires_at,
    created_by
  ) VALUES (
    workspace_uuid,
    user_email,
    user_role,
    invitation_token,
    now() + interval '7 days',
    inviter_uuid
  ) RETURNING id INTO invitation_id;
  
  RETURN invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to accept workspace invitation
CREATE OR REPLACE FUNCTION accept_workspace_invitation(
  invitation_token text,
  user_uuid uuid
)
RETURNS boolean AS $$
DECLARE
  workspace_uuid uuid;
  user_role text;
  is_expired boolean;
BEGIN
  -- Get invitation details
  SELECT 
    workspace_id, 
    role,
    expires_at < now()
  INTO 
    workspace_uuid, 
    user_role,
    is_expired
  FROM workspace_invitations
  WHERE token = invitation_token;
  
  -- Check if invitation exists and is not expired
  IF workspace_uuid IS NULL THEN
    RETURN false;
  END IF;
  
  IF is_expired THEN
    RETURN false;
  END IF;
  
  -- Add user to workspace
  INSERT INTO workspace_members (workspace_id, user_id, role)
  VALUES (workspace_uuid, user_uuid, user_role)
  ON CONFLICT (workspace_id, user_id) 
  DO UPDATE SET role = user_role;
  
  -- Delete the invitation
  DELETE FROM workspace_invitations WHERE token = invitation_token;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;