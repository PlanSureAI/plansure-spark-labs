-- Add comments table for analysis annotations
CREATE TABLE analysis_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID NOT NULL REFERENCES investment_analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE analysis_comments ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_analysis_comments_analysis_id ON analysis_comments(analysis_id);
CREATE INDEX idx_analysis_comments_user_id ON analysis_comments(user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view comments on analyses they can access"
ON analysis_comments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM investment_analyses
    WHERE investment_analyses.id = analysis_comments.analysis_id
    AND (
      investment_analyses.user_id = auth.uid()
      OR (investment_analyses.workspace_id IS NOT NULL AND has_workspace_access(investment_analyses.workspace_id, auth.uid()))
    )
  )
);

CREATE POLICY "Users can add comments to analyses they can access"
ON analysis_comments FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM investment_analyses
    WHERE investment_analyses.id = analysis_comments.analysis_id
    AND (
      investment_analyses.user_id = auth.uid()
      OR (investment_analyses.workspace_id IS NOT NULL AND has_workspace_access(investment_analyses.workspace_id, auth.uid(), 'editor'))
    )
  )
);

CREATE POLICY "Users can update own comments"
ON analysis_comments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
ON analysis_comments FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_analysis_comments_updated_at
BEFORE UPDATE ON analysis_comments
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();