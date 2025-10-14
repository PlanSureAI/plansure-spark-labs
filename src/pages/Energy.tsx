import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, BarChart3, Plus } from "lucide-react";
import { EnergyAnalysisForm } from "@/components/energy/EnergyAnalysisForm";
import { EnergyAnalysisResults } from "@/components/energy/EnergyAnalysisResults";
import { EnergyAnalysisHistory } from "@/components/energy/EnergyAnalysisHistory";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Energy() {
  const navigate = useNavigate();
  const { user, subscribed } = useAuth();
  const { toast } = useToast();
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const handleAnalyze = async (formData: any) => {
    if (!subscribed) {
      toast({
        title: "Subscription Required",
        description: "Please upgrade to access AI-powered energy analysis.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-energy', {
        body: formData,
      });

      if (error) throw error;

      setCurrentAnalysis(data);
      setShowForm(false);
      toast({
        title: "Analysis Complete!",
        description: "Your zero carbon energy forecast is ready.",
      });
    } catch (error: any) {
      console.error('Energy analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to complete energy analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Leaf className="w-10 h-10 text-green-600" />
              Zero Carbon Energy Analysis
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered forecasting for zero energy bill homes
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)} 
            className="gap-2"
            disabled={!subscribed}
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </Button>
        </div>

        {!subscribed && (
          <Card className="p-6 mb-6 border-orange-500/50 bg-orange-50/50 dark:bg-orange-950/20">
            <h3 className="font-semibold mb-2">Subscription Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade your plan to access AI-powered energy analysis and zero carbon forecasting.
            </p>
            <Button onClick={() => navigate('/auth')}>Upgrade Now</Button>
          </Card>
        )}

        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="new">
              <Leaf className="w-4 h-4 mr-2" />
              New Analysis
            </TabsTrigger>
            <TabsTrigger value="history">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analysis History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new">
            {showForm || !currentAnalysis ? (
              <EnergyAnalysisForm 
                onSubmit={handleAnalyze} 
                isLoading={isAnalyzing}
              />
            ) : (
              <EnergyAnalysisResults 
                analysis={currentAnalysis}
                onNewAnalysis={() => setShowForm(true)}
              />
            )}
          </TabsContent>

          <TabsContent value="history">
            <EnergyAnalysisHistory 
              onSelectAnalysis={(analysis) => {
                setCurrentAnalysis(analysis);
                setShowForm(false);
              }}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
