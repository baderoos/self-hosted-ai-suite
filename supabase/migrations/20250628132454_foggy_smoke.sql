/*
  # Create Profiles Table

  1. New Tables
    - `profiles` - User profiles with additional information
  
  2. Security
    - Enable RLS on profiles table
    - Add policies for profile access control
  
  3. Functions & Triggers
    - Create function to automatically create profile on user creation
    - Create trigger to sync profiles with users
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own profile
CREATE POLICY IF NOT EXISTS "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policy for users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (user_id = auth.uid());

-- Create function to automatically create profile on user creation
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user creation
DROP TRIGGER IF EXISTS create_profile_for_user_trigger ON auth.users;
CREATE TRIGGER create_profile_for_user_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_user();

-- Create profiles for existing users
INSERT INTO public.profiles (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;