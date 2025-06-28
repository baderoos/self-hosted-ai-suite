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
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Create policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create function to automatically create profile on user creation
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_profiles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_profiles_updated_at();

DROP TRIGGER IF EXISTS create_profile_for_user_trigger ON auth.users;
CREATE TRIGGER create_profile_for_user_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_user();

-- Create profiles for existing users - fixed to avoid constraint error
DO $$
BEGIN
  INSERT INTO public.profiles (user_id)
  SELECT id FROM auth.users
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = auth.users.id
  );
END;
$$;