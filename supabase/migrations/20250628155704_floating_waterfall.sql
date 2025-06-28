-- Add avatar_url column to profiles table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;

-- Fix workspace_members RLS policies to prevent infinite recursion
-- First, drop existing problematic policies if they exist
DO $$
BEGIN
  -- Drop policies one by one with error handling
  BEGIN
    DROP POLICY IF EXISTS "Users can insert their own workspace memberships" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Workspace owners and admins can add members" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can view members of workspaces they belong to" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Workspace owners and admins can remove members" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Workspace owners and admins can update member roles" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can view their own memberships" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can insert their own memberships" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can update their own memberships" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can delete their own memberships" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Workspace owners can manage all members" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Workspace admins can manage members" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can view their own workspace memberships" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can insert their own workspace memberships" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can update their own workspace memberships" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can delete their own workspace memberships" ON workspace_members;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
END $$;

-- Create simplified, non-recursive policies for workspace_members with unique names
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workspace_members' AND policyname = 'member_view_own'
  ) THEN
    CREATE POLICY "member_view_own"
      ON workspace_members
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workspace_members' AND policyname = 'member_insert_own'
  ) THEN
    CREATE POLICY "member_insert_own"
      ON workspace_members
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workspace_members' AND policyname = 'member_update_own'
  ) THEN
    CREATE POLICY "member_update_own"
      ON workspace_members
      FOR UPDATE
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workspace_members' AND policyname = 'member_delete_own'
  ) THEN
    CREATE POLICY "member_delete_own"
      ON workspace_members
      FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Create a separate policy for workspace owners to manage members
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workspace_members' AND policyname = 'owner_manage_all'
  ) THEN
    CREATE POLICY "owner_manage_all"
      ON workspace_members
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM workspaces 
          WHERE workspaces.id = workspace_members.workspace_id 
          AND workspaces.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM workspaces 
          WHERE workspaces.id = workspace_members.workspace_id 
          AND workspaces.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Create a policy for admins to manage members (non-recursive)
DO $$
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workspace_members' AND policyname = 'admin_manage_members'
  ) THEN
    CREATE POLICY "admin_manage_members"
      ON workspace_members
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = workspace_members.workspace_id
          AND wm.user_id = auth.uid()
          AND wm.role = 'admin'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = workspace_members.workspace_id
          AND wm.user_id = auth.uid()
          AND wm.role = 'admin'
        )
      );
  END IF;
END $$;

-- Update workspace policies to be simpler and avoid recursion
DO $$
BEGIN
  -- Drop existing policy if it exists
  BEGIN
    DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
  EXCEPTION WHEN OTHERS THEN
    -- Policy doesn't exist or can't be dropped, continue
  END;
  
  -- Check if policy exists before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'workspaces' AND policyname = 'workspace_view_access'
  ) THEN
    CREATE POLICY "workspace_view_access"
      ON workspaces
      FOR SELECT
      USING (
        owner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM workspace_members
          WHERE workspace_members.workspace_id = workspaces.id
          AND workspace_members.user_id = auth.uid()
        )
      );
  END IF;
END $$;