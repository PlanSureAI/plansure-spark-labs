-- Enable realtime for collaboration features
ALTER PUBLICATION supabase_realtime ADD TABLE public.investment_analyses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_members;

-- Add composite index for efficient realtime filtering
CREATE INDEX idx_investment_analyses_workspace_user ON investment_analyses(workspace_id, user_id);