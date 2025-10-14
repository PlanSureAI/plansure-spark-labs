import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { PendingInvitations } from "@/components/workspace/PendingInvitations";
import { Navbar } from "@/components/Navbar";
import { InvestmentAnalysisForm } from "@/components/investment/InvestmentAnalysisForm";
import { InvestmentResults } from "@/components/investment/InvestmentResults";
import { AnalysisHistory } from "@/components/investment/AnalysisHistory";
import { PresenceIndicator } from "@/components/collaboration/PresenceIndicator";
import { useRealtimeCollaboration } from "@/hooks/useRealtimeCollaboration";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, History, Building2 } from "lucide-react";

export default function Investment() {
  const { user, subscribed, isLoading: authLoading } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Enable realtime collaboration for current workspace
  const { presenceUsers } = useRealtimeCollaboration({
    workspaceId: currentWorkspace?.id,
    enabled: !!currentWorkspace,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  // Listen for realtime analysis updates
  useEffect(() => {
    const handleAnalysisUpdate = (event: CustomEvent) => {
      console.log("Realtime update received:", event.detail);
      // Refresh analysis list when changes occur
      window.dispatchEvent(new CustomEvent("refresh-analysis-history"));
    };

    window.addEventListener("analysis-updated", handleAnalysisUpdate as EventListener);
    return () => {
      window.removeEventListener("analysis-updated", handleAnalysisUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    if (user && subscribed) {
      loadProperties();
    }
  }, [user, subscribed]);

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading properties",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAnalysisComplete = (analysis: any) => {
    setCurrentAnalysis(analysis);
    toast({
      title: "Analysis complete!",
      description: "Your investment analysis has been generated.",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Calculator className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold">Investment Analysis</h1>
            <p className="text-xl text-muted-foreground">
              Upgrade to access AI-powered ROI predictions and comprehensive investment analysis.
            </p>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Pending Invitations and Presence */}
          <div className="flex items-center justify-between gap-4">
            <PendingInvitations />
            {currentWorkspace && (
              <PresenceIndicator users={presenceUsers} currentUserId={user?.id} />
            )}
          </div>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Investment Analysis</h1>
                <p className="text-muted-foreground">
                  AI-powered ROI predictions and comprehensive financial analysis
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="new" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="new" className="gap-2">
                <Calculator className="w-4 h-4" />
                New Analysis
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new" className="space-y-6 mt-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Form */}
                <div>
                  <InvestmentAnalysisForm
                    properties={properties}
                    onAnalysisComplete={handleAnalysisComplete}
                  />
                </div>

                {/* Results */}
                <div>
                  {currentAnalysis ? (
                    <InvestmentResults analysis={currentAnalysis} />
                  ) : (
                    <div className="bg-muted/30 rounded-lg border-2 border-dashed border-border p-12 text-center">
                      <Building2 className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Complete the form to generate your investment analysis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <AnalysisHistory onSelectAnalysis={setCurrentAnalysis} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
