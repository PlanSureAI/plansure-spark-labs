import { ReactNode, useEffect } from "react";
import { useNavigate, Link, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Building2, User, LogOut, BarChart3, Leaf, LayoutDashboard } from "lucide-react";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export const AuthenticatedLayout = () => {
  const { user, isLoading, subscribed, signOut } = useAuth();
  const { workspaces } = useWorkspace();
  const navigate = useNavigate();

  console.log("[AuthenticatedLayout] Render state:", { isLoading, hasUser: !!user });

  useEffect(() => {
    if (!isLoading && !user) {
      console.log("[AuthenticatedLayout] No user found, redirecting to /auth");
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    console.log("[AuthenticatedLayout] Loading...");
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("[AuthenticatedLayout] No user, returning null");
    return null;
  }

  const handleSignOut = async () => {
    console.log("[AuthenticatedLayout] Signing out...");
    await signOut();
    navigate("/");
  };

  console.log("[AuthenticatedLayout] Rendering layout for user:", user.email);

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <div className="p-2 rounded-lg bg-primary">
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold gradient-text">PlansureAI</span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>
                </Button>
                
                {subscribed && (
                  <>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/investment" className="gap-2">
                        <BarChart3 className="w-4 h-4" />
                        Investment
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/compliance" className="gap-2">
                        <Building2 className="w-4 h-4" />
                        Compliance
                      </Link>
                    </Button>
                    
                    <Button variant="ghost" size="sm" asChild>
                      <Link to="/energy" className="gap-2">
                        <Leaf className="w-4 h-4" />
                        Zero Carbon
                      </Link>
                    </Button>

                    {workspaces.length > 0 && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/workspaces">Workspaces</Link>
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {subscribed && workspaces.length > 0 && <WorkspaceSelector />}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline max-w-[120px] truncate">
                      {user.email}
                    </span>
                    {subscribed && (
                      <span className="px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">
                        Pro
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
};
