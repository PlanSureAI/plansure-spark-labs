import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Users } from "lucide-react";

interface PresenceUser {
  user_id: string;
  email: string;
  full_name: string | null;
  online_at: string;
}

interface PresenceIndicatorProps {
  users: PresenceUser[];
  currentUserId?: string;
}

export const PresenceIndicator = ({ users, currentUserId }: PresenceIndicatorProps) => {
  const otherUsers = users.filter(u => u.user_id !== currentUserId);

  if (otherUsers.length === 0) return null;

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/30 rounded-lg border border-border/50">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          {otherUsers.length} {otherUsers.length === 1 ? "collaborator" : "collaborators"} online
        </span>
        <div className="flex -space-x-2">
          {otherUsers.slice(0, 3).map((user) => (
            <Tooltip key={user.user_id}>
              <TooltipTrigger>
                <Avatar className="w-8 h-8 border-2 border-background">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {getInitials(user.full_name, user.email)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{user.full_name || "Anonymous"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {otherUsers.length > 3 && (
            <Avatar className="w-8 h-8 border-2 border-background">
              <AvatarFallback className="bg-muted text-xs">
                +{otherUsers.length - 3}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
