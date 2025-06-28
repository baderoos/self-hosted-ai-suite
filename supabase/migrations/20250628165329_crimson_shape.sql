/*
  # Fix profiles table structure

  1. Table Updates
    - Ensure profiles table has correct structure
    - Remove email column if it exists (email is in auth.users)
    - Ensure user_id foreign key is correct

  2. Security
    - Update RLS policies to use user_id instead of id
*/

-- Update profiles table structure if needed
DO $$
BEGIN
  -- Remove email column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email'
  ) THEN
    ALTER TABLE profiles DROP COLUMN email;
  END IF;

  -- Ensure user_id column exists and is properly configured
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'user_id'
  ) THEN
    -- If user_id doesn't exist but id does, rename id to user_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'profiles' AND column_name = 'id'
    ) THEN
      ALTER TABLE profiles RENAME COLUMN id TO user_id;
    ELSE
      -- Add user_id column
      ALTER TABLE profiles ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Select own user" ON profiles;

CREATE POLICY "Users can view their own profile" 
  ON profiles 
  FOR SELECT 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" 
  ON profiles 
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" 
  ON profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid());