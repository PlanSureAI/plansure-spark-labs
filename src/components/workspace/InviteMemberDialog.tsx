import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().trim().email("Invalid email address"),
  role: z.enum(["admin", "editor", "viewer"]),
});

interface InviteMemberDialogProps {
  workspaceId: string;
  onInviteSent?: () => void;
}

export const InviteMemberDialog = ({
  workspaceId,
  onInviteSent,
}: InviteMemberDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const [loading, setLoading] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validated = inviteSchema.parse({ email, role });

      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", validated.email)
        .single();

      if (userError || !userData) {
        throw new Error("User not found. They need to create an account first.");
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userData.id)
        .maybeSingle();

      if (existingMember) {
        throw new Error("This user is already a member of the workspace.");
      }

      // Create invitation
      const { error: inviteError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspaceId,
          user_id: userData.id,
          role: validated.role,
        });

      if (inviteError) throw inviteError;

      toast({
        title: "Invitation sent!",
        description: `${validated.email} has been invited as ${validated.role}.`,
      });

      setEmail("");
      setRole("viewer");
      setOpen(false);
      onInviteSent?.();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error sending invitation",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a team member to collaborate on investment analyses.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
            <p className="text-xs text-muted-foreground">
              User must have an existing account
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value: "admin" | "editor" | "viewer") =>
                setRole(value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">
                  <div>
                    <div className="font-medium">Viewer</div>
                    <div className="text-xs text-muted-foreground">
                      Can view analyses
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="editor">
                  <div>
                    <div className="font-medium">Editor</div>
                    <div className="text-xs text-muted-foreground">
                      Can create and edit analyses
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="admin">
                  <div>
                    <div className="font-medium">Admin</div>
                    <div className="text-xs text-muted-foreground">
                      Full access including member management
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
