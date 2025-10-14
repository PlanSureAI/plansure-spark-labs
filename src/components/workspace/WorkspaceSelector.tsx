import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export const WorkspaceSelector = () => {
  const { currentWorkspace, workspaces, setCurrentWorkspace } = useWorkspace();

  if (workspaces.length === 0) {
    return null;
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "editor":
        return "secondary";
      case "viewer":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Users className="w-4 h-4 text-muted-foreground" />
      <Select
        value={currentWorkspace?.id || ""}
        onValueChange={(id) => {
          const workspace = workspaces.find((w) => w.id === id);
          if (workspace) setCurrentWorkspace(workspace);
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select workspace" />
        </SelectTrigger>
        <SelectContent>
          {workspaces.map((workspace) => (
            <SelectItem key={workspace.id} value={workspace.id}>
              <div className="flex items-center justify-between w-full gap-2">
                <span>{workspace.name}</span>
                <Badge variant={getRoleBadgeColor(workspace.role)} className="text-xs">
                  {workspace.role}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
