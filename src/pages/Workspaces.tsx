import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateWorkspaceDialog } from "@/components/workspace/CreateWorkspaceDialog";
import { InviteMemberDialog } from "@/components/workspace/InviteMemberDialog";
import { Users, Crown, Edit, Eye, Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  user_id: string;
  role: string;
  invited_at: string;
  accepted_at: string | null;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

const Workspaces = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentWorkspace, workspaces, refreshWorkspaces } = useWorkspace();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (currentWorkspace) {
      loadMembers();
    }
  }, [user, navigate, currentWorkspace]);

  const loadMembers = async () => {
    if (!currentWorkspace) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workspace_members")
        .select(`
          id,
          user_id,
          role,
          invited_at,
          accepted_at
        `)
        .eq("workspace_id", currentWorkspace.id)
        .order("accepted_at", { ascending: false });

      if (error) throw error;

      // Fetch profile data separately
      const membersWithProfiles = await Promise.all(
        (data || []).map(async (member) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", member.user_id)
            .single();

          return {
            ...member,
            profiles: profile || { email: "", full_name: null },
          };
        })
      );

      setMembers(membersWithProfiles);
    } catch (error: any) {
      toast({
        title: "Error loading members",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (
    memberId: string,
    newRole: "admin" | "editor" | "viewer"
  ) => {
    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({ role: newRole })
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: "Member role has been updated successfully.",
      });

      loadMembers();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "Member has been removed from the workspace.",
      });

      loadMembers();
    } catch (error: any) {
      toast({
        title: "Error removing member",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4" />;
      case "editor":
        return <Edit className="w-4 h-4" />;
      case "viewer":
        return <Eye className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const isCurrentUserAdmin = currentWorkspace?.role === "admin";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />

      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Team Workspaces</h1>
            <p className="text-muted-foreground">
              Manage your workspaces and collaborate with your team
            </p>
          </div>
          <CreateWorkspaceDialog />
        </div>

        {workspaces.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Workspaces Yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first workspace to start collaborating
            </p>
            <CreateWorkspaceDialog />
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Current Workspace Details */}
            {currentWorkspace && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
                      {currentWorkspace.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{currentWorkspace.role}</Badge>
                      <span>•</span>
                      <span>{members.filter(m => m.accepted_at).length} members</span>
                    </div>
                  </div>
                  {isCurrentUserAdmin && (
                    <InviteMemberDialog
                      workspaceId={currentWorkspace.id}
                      onInviteSent={loadMembers}
                    />
                  )}
                </div>

                {!isCurrentUserAdmin && (
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You have {currentWorkspace.role} access. Contact an admin to invite
                      members or change roles.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Members List */}
                <div className="space-y-2">
                  <h3 className="font-semibold mb-4">Team Members</h3>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              {getRoleIcon(member.role)}
                            </div>
                            <div>
                              <div className="font-medium">
                                {member.profiles.full_name || "No name"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {member.profiles.email}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                member.role === "admin"
                                  ? "default"
                                  : member.role === "editor"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {member.role}
                            </Badge>

                            {!member.accepted_at && (
                              <Badge variant="outline" className="text-orange-600">
                                Pending
                              </Badge>
                            )}

                            {isCurrentUserAdmin && member.user_id !== user?.id && (
                              <div className="flex gap-1">
                                <select
                                  className="text-xs border rounded px-2 py-1"
                                  value={member.role}
                                  onChange={(e) => {
                                    const newRole = e.target.value as "admin" | "editor" | "viewer";
                                    updateMemberRole(member.id, newRole);
                                  }}
                                >
                                  <option value="viewer">Viewer</option>
                                  <option value="editor">Editor</option>
                                  <option value="admin">Admin</option>
                                </select>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeMember(member.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Workspaces;
