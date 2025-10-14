import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Check, X } from "lucide-react";

interface PendingInvitation {
  id: string;
  workspace_id: string;
  role: string;
  invited_at: string;
  workspaces: {
    name: string;
    owner_id: string;
  };
}

export const PendingInvitations = () => {
  const { user } = useAuth();
  const { refreshWorkspaces } = useWorkspace();
  const { toast } = useToast();
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadInvitations();
    }
  }, [user]);

  const loadInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          id,
          workspace_id,
          role,
          invited_at,
          workspaces:workspace_id (
            name,
            owner_id
          )
        `)
        .eq("user_id", user?.id)
        .is("accepted_at", null);

      if (error) throw error;

      // Flatten the workspaces object
      const formattedData = (data || []).map((inv: any) => ({
        ...inv,
        workspaces: inv.workspaces,
      }));

      setInvitations(formattedData);
    } catch (error: any) {
      console.error("Error loading invitations:", error);
    }
  };

  const handleAccept = async (invitationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Invitation accepted!",
        description: "You now have access to the workspace.",
      });

      await refreshWorkspaces();
      loadInvitations();
    } catch (error: any) {
      toast({
        title: "Error accepting invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (invitationId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      toast({
        title: "Invitation declined",
        description: "The invitation has been removed.",
      });

      loadInvitations();
    } catch (error: any) {
      toast({
        title: "Error declining invitation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 border-primary/50 bg-primary/5">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm">Workspace Invitations</h3>
          <Badge variant="secondary">{invitations.length}</Badge>
        </div>

        <div className="space-y-2">
          {invitations.map((invitation) => (
            <div
              key={invitation.id}
              className="flex items-center justify-between p-3 bg-background rounded-lg border"
            >
              <div>
                <div className="font-medium text-sm">
                  {invitation.workspaces.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  Invited as <Badge variant="outline" className="ml-1">{invitation.role}</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleAccept(invitation.id)}
                  disabled={loading}
                  className="gap-1"
                >
                  <Check className="w-3 h-3" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDecline(invitation.id)}
                  disabled={loading}
                  className="gap-1"
                >
                  <X className="w-3 h-3" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
