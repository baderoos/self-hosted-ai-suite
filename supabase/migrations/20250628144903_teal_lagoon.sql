/*
  # Add Image Optimization Support

  1. New Tables
    - `optimized_images` - Stores information about optimized images
  
  2. Security
    - Enable RLS on optimized_images table
    - Add policies for proper access control
  
  3. Functions
    - Create function to track image optimization metrics
*/

-- Create optimized_images table
CREATE TABLE IF NOT EXISTS optimized_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_file_id UUID NOT NULL,
  optimized_file_id UUID NOT NULL,
  original_size BIGINT NOT NULL,
  optimized_size BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  format TEXT NOT NULL,
  quality INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_optimized_images_original_file_id ON optimized_images(original_file_id);
CREATE INDEX IF NOT EXISTS idx_optimized_images_optimized_file_id ON optimized_images(optimized_file_id);
CREATE INDEX IF NOT EXISTS idx_optimized_images_workspace_id ON optimized_images(workspace_id);

-- Enable RLS
ALTER TABLE optimized_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view optimized images in their workspaces"
  ON optimized_images
  FOR SELECT
  USING (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = optimized_images.workspace_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert optimized images in their workspaces"
  ON optimized_images
  FOR INSERT
  WITH CHECK (
    workspace_id IS NULL OR
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_id = optimized_images.workspace_id
      AND user_id = auth.uid()
    )
  );

-- Create function to calculate optimization metrics
CREATE OR REPLACE FUNCTION get_image_optimization_metrics(workspace_uuid UUID)
RETURNS TABLE (
  total_images BIGINT,
  total_original_size BIGINT,
  total_optimized_size BIGINT,
  savings_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::BIGINT AS total_images,
    SUM(original_size)::BIGINT AS total_original_size,
    SUM(optimized_size)::BIGINT AS total_optimized_size,
    CASE 
      WHEN SUM(original_size) > 0 THEN 
        ROUND((1 - (SUM(optimized_size)::NUMERIC / SUM(original_size)::NUMERIC)) * 100, 2)
      ELSE 0
    END AS savings_percentage
  FROM optimized_images
  WHERE workspace_id = workspace_uuid OR workspace_uuid IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;