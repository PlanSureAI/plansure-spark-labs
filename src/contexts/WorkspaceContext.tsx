import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
  role?: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  refreshWorkspaces: () => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Get workspaces where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from("workspace_members")
        .select(`
          workspace:workspaces(*),
          role
        `)
        .eq("user_id", user.id)
        .not("accepted_at", "is", null);

      if (memberError) throw memberError;

      const workspacesWithRoles = memberData?.map((item: any) => ({
        ...item.workspace,
        role: item.role,
      })) || [];

      setWorkspaces(workspacesWithRoles);

      // Set first workspace as current if none selected
      if (!currentWorkspace && workspacesWithRoles.length > 0) {
        setCurrentWorkspace(workspacesWithRoles[0]);
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshWorkspaces();
  }, [user]);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        setCurrentWorkspace,
        refreshWorkspaces,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
