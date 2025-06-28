/*
  # Add name column to profiles table

  1. Changes
    - Add `name` column to `profiles` table to store user display names
    - This aligns the database schema with the application's data model

  2. Security
    - No changes to existing RLS policies needed
    - The new column will inherit the existing security model
*/

-- Add name column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name text;