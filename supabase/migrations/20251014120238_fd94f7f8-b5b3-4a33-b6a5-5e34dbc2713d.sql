-- Create workspace role enum
CREATE TYPE workspace_role AS ENUM ('admin', 'editor', 'viewer');

-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workspace_members table
CREATE TABLE workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role workspace_role NOT NULL DEFAULT 'viewer',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(workspace_id, user_id)
);

-- Add workspace_id to investment_analyses
ALTER TABLE investment_analyses
ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- Create index for faster workspace queries
CREATE INDEX idx_investment_analyses_workspace_id ON investment_analyses(workspace_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);

-- Enable RLS on workspaces and workspace_members
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

-- Helper function to check workspace membership
CREATE OR REPLACE FUNCTION has_workspace_access(
  _workspace_id UUID,
  _user_id UUID,
  _required_role workspace_role DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = _user_id
      AND accepted_at IS NOT NULL
      AND (
        _required_role IS NULL 
        OR role = _required_role
        OR (role = 'admin' AND _required_role IN ('editor', 'viewer'))
        OR (role = 'editor' AND _required_role = 'viewer')
      )
  )
$$;

-- RLS Policies for workspaces
CREATE POLICY "Users can view workspaces they are members of"
ON workspaces FOR SELECT
TO authenticated
USING (has_workspace_access(id, auth.uid()));

CREATE POLICY "Users can create their own workspaces"
ON workspaces FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Workspace admins can update"
ON workspaces FOR UPDATE
TO authenticated
USING (has_workspace_access(id, auth.uid(), 'admin'));

CREATE POLICY "Workspace owners can delete"
ON workspaces FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- RLS Policies for workspace_members
CREATE POLICY "Users can view members of their workspaces"
ON workspace_members FOR SELECT
TO authenticated
USING (has_workspace_access(workspace_id, auth.uid()));

CREATE POLICY "Workspace admins can invite members"
ON workspace_members FOR INSERT
TO authenticated
WITH CHECK (has_workspace_access(workspace_id, auth.uid(), 'admin'));

CREATE POLICY "Workspace admins can update member roles"
ON workspace_members FOR UPDATE
TO authenticated
USING (has_workspace_access(workspace_id, auth.uid(), 'admin'));

CREATE POLICY "Workspace admins can remove members"
ON workspace_members FOR DELETE
TO authenticated
USING (has_workspace_access(workspace_id, auth.uid(), 'admin'));

CREATE POLICY "Users can accept their own invitations"
ON workspace_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND accepted_at IS NULL);

-- Update investment_analyses RLS policies for workspace access
DROP POLICY IF EXISTS "Users can view own analyses" ON investment_analyses;
DROP POLICY IF EXISTS "Users can insert own analyses" ON investment_analyses;
DROP POLICY IF EXISTS "Users can update own analyses" ON investment_analyses;
DROP POLICY IF EXISTS "Users can delete own analyses" ON investment_analyses;

CREATE POLICY "Users can view own or workspace analyses"
ON investment_analyses FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id 
  OR (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid()))
);

CREATE POLICY "Users can insert own or workspace analyses"
ON investment_analyses FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    workspace_id IS NULL 
    OR has_workspace_access(workspace_id, auth.uid(), 'editor')
  )
);

CREATE POLICY "Users can update own or workspace analyses"
ON investment_analyses FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid(), 'editor'))
);

CREATE POLICY "Users can delete own analyses or workspace admins can delete"
ON investment_analyses FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  OR (workspace_id IS NOT NULL AND has_workspace_access(workspace_id, auth.uid(), 'admin'))
);

-- Trigger to auto-add owner as admin when workspace is created
CREATE OR REPLACE FUNCTION add_workspace_owner_as_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO workspace_members (workspace_id, user_id, role, accepted_at)
  VALUES (NEW.id, NEW.owner_id, 'admin', now());
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_workspace_created
AFTER INSERT ON workspaces
FOR EACH ROW
EXECUTE FUNCTION add_workspace_owner_as_admin();

-- Trigger for updated_at
CREATE TRIGGER update_workspaces_updated_at
BEFORE UPDATE ON workspaces
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();