import { Button } from "@/components/ui/button";
import { Building2, User, LogOut, Leaf } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Link, useNavigate } from "react-router-dom";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const { user, subscribed, signOut } = useAuth();
  const { workspaces } = useWorkspace();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="p-2 rounded-lg bg-primary">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">PlansureAI</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm font-medium hover:text-primary transition-colors">
              Features
            </a>
            {subscribed && (
              <>
                <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link to="/investment" className="text-sm font-medium hover:text-primary transition-colors">
                  Investment Analysis
                </Link>
                <Link to="/compliance" className="text-sm font-medium hover:text-primary transition-colors">
                  Compliance Center
                </Link>
                <Link to="/energy" className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                  <Leaf className="w-4 h-4" />
                  Zero Carbon
                </Link>
                {workspaces.length > 0 && (
                  <Link to="/workspaces" className="text-sm font-medium hover:text-primary transition-colors">
                    Workspaces
                  </Link>
                )}
              </>
            )}
            <a href="/#workflow" className="text-sm font-medium hover:text-primary transition-colors">
              How It Works
            </a>
            <a href="/#pricing" className="text-sm font-medium hover:text-primary transition-colors">
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-4">
            {subscribed && workspaces.length > 0 && <WorkspaceSelector />}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">Account</span>
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
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" className="hidden sm:inline-flex" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
