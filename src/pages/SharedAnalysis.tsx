import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InvestmentResults } from "@/components/investment/InvestmentResults";
import { AlertCircle, Home } from "lucide-react";

const SharedAnalysis = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSharedAnalysis();
  }, [shareToken]);

  const loadSharedAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("investment_analyses")
        .select("*")
        .eq("share_token", shareToken)
        .eq("is_shared", true)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError(
          "This analysis is not available. It may have been removed or the link has expired."
        );
        return;
      }

      // Check if share link has expired
      if (data.share_expires_at) {
        const expiryDate = new Date(data.share_expires_at);
        if (expiryDate < new Date()) {
          setError("This share link has expired.");
          return;
        }
      }

      setAnalysis(data);
    } catch (error: any) {
      console.error("Error loading shared analysis:", error);
      setError("Failed to load the analysis. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-6">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Analysis Not Found</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <Button asChild className="w-full">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <h1 className="text-xl font-bold">PlansureAI Pro</h1>
            </Link>
            <Alert className="py-2 px-3">
              <AlertDescription className="text-xs">
                You are viewing a shared investment analysis
              </AlertDescription>
            </Alert>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      {/* Analysis Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Investment Analysis</h2>
          <p className="text-muted-foreground">
            Shared on {new Date(analysis.shared_at).toLocaleDateString()}
          </p>
        </div>

        <InvestmentResults analysis={analysis} />

        {/* Call to Action */}
        <Card className="mt-8 p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <h3 className="text-2xl font-bold mb-3">
            Want to Create Your Own Analyses?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get access to AI-powered investment analysis tools, scenario
            planning, risk assessment, and more with PlansureAI Pro.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" asChild>
              <Link to="/auth">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/">Learn More</Link>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SharedAnalysis;
