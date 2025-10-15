import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  BarChart3, 
  Building2, 
  Leaf, 
  Users, 
  ArrowRight,
  AlertCircle 
} from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, subscribed } = useAuth();
  const { currentWorkspace, workspaces, loading: workspaceLoading } = useWorkspace();
  const [error, setError] = useState<string | null>(null);

  console.log("[Dashboard] Render state:", {
    authLoading,
    workspaceLoading,
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    subscribed,
    currentWorkspace: currentWorkspace?.name,
    workspacesCount: workspaces.length
  });

  useEffect(() => {
    console.log("[Dashboard] Auth check - Loading:", authLoading, "User:", !!user);
    if (!authLoading && !user) {
      console.log("[Dashboard] No user found, redirecting to /auth");
      navigate("/auth");
    } else if (user) {
      console.log("[Dashboard] User authenticated, rendering dashboard");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || workspaceLoading) {
    console.log("[Dashboard] Showing loading state...");
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("[Dashboard] No user, returning null (redirect should happen)");
    return null;
  }

  console.log("[Dashboard] Rendering full dashboard for user:", user.email);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">PlansureAI Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user.email}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>
              Home
            </Button>
            <Button variant="default" onClick={() => navigate("/workspaces")}>
              Manage Workspaces
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!subscribed && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You're currently on the free tier. Upgrade to access all premium features.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Current Workspace</h2>
          {currentWorkspace ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {currentWorkspace.name}
                </CardTitle>
                <CardDescription>
                  Role: {currentWorkspace.role || 'Member'} • Created: {new Date(currentWorkspace.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No workspace selected</CardTitle>
                <CardDescription>
                  Create or join a workspace to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => navigate("/workspaces")}>
                  Manage Workspaces
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/investment")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Investment Analysis
                </CardTitle>
                <CardDescription>
                  Analyze property investments with AI-powered insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/compliance")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Compliance Center
                </CardTitle>
                <CardDescription>
                  Track regulatory compliance and deadlines
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  View Compliance
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/energy")}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-primary" />
                  Zero Carbon
                </CardTitle>
                <CardDescription>
                  Energy efficiency & sustainability analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between">
                  Analyze Energy
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Workspace Overview</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Workspaces ({workspaces.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workspaces.length > 0 ? (
                <div className="space-y-2">
                  {workspaces.map((workspace) => (
                    <div
                      key={workspace.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{workspace.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {workspace.role || 'Member'}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate("/workspaces")}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    You don't have any workspaces yet
                  </p>
                  <Button onClick={() => navigate("/workspaces")}>
                    Create Workspace
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
