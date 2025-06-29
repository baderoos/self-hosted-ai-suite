/*
  # Create Users Table

  1. New Tables
    - `users` - Public users table that mirrors auth.users
  
  2. Security
    - Enable RLS on users table
    - Add policy for users to select their own user data
  
  3. Functions & Triggers
    - Create function to sync auth.users to public.users
    - Create trigger to automatically sync new users
*/

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select their own user data
CREATE POLICY IF NOT EXISTS "Select own user"
  ON users
  FOR SELECT
  USING (id = auth.uid());

-- Create function to sync auth.users to public.users
CREATE OR REPLACE FUNCTION sync_user_to_public()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE
  SET email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync new users
DROP TRIGGER IF EXISTS sync_user_to_public_trigger ON auth.users;
CREATE TRIGGER sync_user_to_public_trigger
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION sync_user_to_public();

-- Sync existing users
INSERT INTO public.users (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email;