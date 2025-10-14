import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, 
  BarChart3, 
  Plus, 
  Award, 
  Zap, 
  TrendingUp, 
  Clock,
  Bell,
  Users 
} from "lucide-react";
import { EnergyAnalysisForm } from "@/components/energy/EnergyAnalysisForm";
import { EnergyAnalysisResults } from "@/components/energy/EnergyAnalysisResults";
import { EnergyAnalysisHistory } from "@/components/energy/EnergyAnalysisHistory";
import { CertificationScoring } from "@/components/energy/CertificationScoring";
import { SmartDeviceIntegration } from "@/components/energy/SmartDeviceIntegration";
import { FinancialModeling } from "@/components/energy/FinancialModeling";
import { ActivityAuditLog } from "@/components/energy/ActivityAuditLog";
import { NotificationCenter } from "@/components/energy/NotificationCenter";
import { PartnershipIntegration } from "@/components/energy/PartnershipIntegration";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Energy() {
  const navigate = useNavigate();
  const { user, subscribed } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [financialModels, setFinancialModels] = useState<any[]>([]);
  const [partnerships, setPartnerships] = useState<any[]>([]);

  useEffect(() => {
    if (currentAnalysis?.id) {
      fetchRelatedData(currentAnalysis.id);
    }
    if (currentWorkspace) {
      fetchPartnerships();
    }
  }, [currentAnalysis?.id, currentWorkspace]);

  if (!user) {
    navigate("/auth");
    return null;
  }

  const fetchRelatedData = async (analysisId: string) => {
    try {
      // Fetch certifications
      const { data: certData } = await supabase
        .from('sustainability_certifications')
        .select('*')
        .eq('analysis_id', analysisId);
      setCertifications(certData || []);

      // Fetch financial models
      const { data: modelData } = await supabase
        .from('financial_models')
        .select('*')
        .eq('analysis_id', analysisId);
      setFinancialModels(modelData || []);
    } catch (error) {
      console.error('Error fetching related data:', error);
    }
  };

  const fetchPartnerships = async () => {
    if (!currentWorkspace) return;
    
    try {
      const { data } = await supabase
        .from('partnerships')
        .select('*')
        .eq('workspace_id', currentWorkspace.id);
      setPartnerships(data || []);
    } catch (error) {
      console.error('Error fetching partnerships:', error);
    }
  };

  const logActivity = async (action: string, entityType: string, entityId: string) => {
    try {
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          workspace_id: currentWorkspace?.id,
          entity_type: entityType,
          entity_id: entityId,
          action: action
        });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

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
      
      // Log activity
      if (data?.id) {
        await logActivity('create', 'energy_analysis', data.id);
      }
      
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
          <TabsList className="grid w-full grid-cols-8 mb-6">
            <TabsTrigger value="new">
              <Leaf className="w-4 h-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="history">
              <BarChart3 className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="certifications">
              <Award className="w-4 h-4 mr-2" />
              Certifications
            </TabsTrigger>
            <TabsTrigger value="devices">
              <Zap className="w-4 h-4 mr-2" />
              Devices
            </TabsTrigger>
            <TabsTrigger value="financial">
              <TrendingUp className="w-4 h-4 mr-2" />
              Financial
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Clock className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="partnerships">
              <Users className="w-4 h-4 mr-2" />
              Partners
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
                logActivity('view', 'energy_analysis', analysis.id);
              }}
            />
          </TabsContent>

          <TabsContent value="certifications">
            <CertificationScoring 
              analysisId={currentAnalysis?.id || ''}
              certifications={certifications}
            />
          </TabsContent>

          <TabsContent value="devices">
            <SmartDeviceIntegration propertyId={currentAnalysis?.property_id} />
          </TabsContent>

          <TabsContent value="financial">
            <FinancialModeling 
              analysisId={currentAnalysis?.id || ''}
              models={financialModels}
            />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityAuditLog 
              entityType="energy_analysis"
              entityId={currentAnalysis?.id}
              workspaceId={currentWorkspace?.id}
            />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>

          <TabsContent value="partnerships">
            <PartnershipIntegration 
              partnerships={partnerships}
              workspaceId={currentWorkspace?.id}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
