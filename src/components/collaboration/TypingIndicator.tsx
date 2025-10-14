import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface TypingUser {
  user_id: string;
  email: string;
  timestamp: string;
}

interface TypingIndicatorProps {
  users: TypingUser[];
  currentUserId?: string;
}

export const TypingIndicator = ({ users, currentUserId }: TypingIndicatorProps) => {
  const otherUsers = users.filter(u => u.user_id !== currentUserId);

  if (otherUsers.length === 0) return null;

  const getName = (email: string) => {
    return email.split('@')[0];
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg border border-border/50 animate-in fade-in slide-in-from-bottom-2">
      <Loader2 className="w-3 h-3 text-muted-foreground animate-spin" />
      <span className="text-xs text-muted-foreground">
        {otherUsers.length === 1 ? (
          <>
            <span className="font-medium">{getName(otherUsers[0].email)}</span> is typing...
          </>
        ) : (
          <>
            <span className="font-medium">{otherUsers.length} people</span> are typing...
          </>
        )}
      </span>
    </div>
  );
};
