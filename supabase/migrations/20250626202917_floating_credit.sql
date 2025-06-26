/*
  # Initial Schema for Nexus Platform

  1. New Tables
    - `profiles` - User profile information
    - `workspaces` - Workspaces for multi-tenant support
    - `workspace_members` - Workspace membership and roles
    - `workspace_invitations` - Pending invitations to workspaces
    - `subscriptions` - Workspace subscription information

  2. Security
    - Row Level Security (RLS) enabled on all tables
    - Policies for proper data access control

  3. Functions & Triggers
    - Workspace management functions
    - Invitation handling
    - Automatic slug generation
*/

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- PROFILES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WORKSPACES TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- WORKSPACE MEMBERS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

-- WORKSPACE INVITATIONS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workspace_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- SUBSCRIPTIONS TABLE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  workspace_id UUID PRIMARY KEY REFERENCES workspaces(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('creator', 'pro', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'past_due')),
  trial_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SECURITY POLICIES
--------------------------------------------------------------------------------

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "Users can view workspaces they are members of"
  ON workspaces FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = workspaces.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Workspace owners can update their workspaces"
  ON workspaces FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Workspace owners can delete their workspaces"
  ON workspaces FOR DELETE
  USING (owner_id = auth.uid());

-- Workspace members policies
CREATE POLICY "Users can view members of workspaces they belong to"
  ON workspace_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own workspace memberships"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own workspace memberships"
  ON workspace_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own workspace memberships"
  ON workspace_members FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own workspace memberships"
  ON workspace_members FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Workspace owners and admins can add members"
  ON workspace_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners and admins can update member roles"
  ON workspace_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners and admins can remove members"
  ON workspace_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Workspace invitations policies
CREATE POLICY "Users can view invitations for workspaces they manage"
  ON workspace_invitations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_invitations.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners and admins can create invitations"
  ON workspace_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_invitations.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Workspace owners and admins can delete invitations"
  ON workspace_invitations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members AS wm
      WHERE wm.workspace_id = workspace_invitations.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Subscriptions policies
CREATE POLICY "Allow authenticated users to select their own subscriptions"
  ON subscriptions FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Allow authenticated users to insert subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update their own subscriptions"
  ON subscriptions FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete their own subscriptions"
  ON subscriptions FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "select_own_subscriptions"
  ON subscriptions FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- FUNCTIONS & TRIGGERS
--------------------------------------------------------------------------------

-- Function to automatically add workspace owner as a member with 'owner' role
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

-- Create trigger for when a workspace is created
CREATE TRIGGER on_workspace_created_add_owner
AFTER INSERT ON workspaces
FOR EACH ROW
EXECUTE FUNCTION add_workspace_owner_as_member();

-- Function to generate a unique slug for workspaces
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

-- Create triggers for updated_at columns
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Function to get user's workspaces
CREATE OR REPLACE FUNCTION get_user_workspaces(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  logo_url TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
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

-- Function to get workspace subscription status
CREATE OR REPLACE FUNCTION get_workspace_subscription(workspace_uuid UUID)
RETURNS TABLE (
  plan_id TEXT,
  status TEXT,
  trial_end TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT s.plan_id, s.status, s.trial_end, s.current_period_end
  FROM subscriptions s
  WHERE s.workspace_id = workspace_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to invite user to workspace
CREATE OR REPLACE FUNCTION invite_user_to_workspace(
  workspace_uuid UUID,
  user_email TEXT,
  user_role TEXT,
  inviter_uuid UUID
)
RETURNS UUID AS $$
DECLARE
  invitation_id UUID;
  invitation_token TEXT;
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

-- Function to accept workspace invitation
CREATE OR REPLACE FUNCTION accept_workspace_invitation(
  invitation_token TEXT,
  user_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  workspace_uuid UUID;
  user_role TEXT;
  is_expired BOOLEAN;
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

-- INDEXES
--------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);
CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_workspace_id ON workspace_invitations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token ON workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_subscriptions_workspace_id ON subscriptions(workspace_id);