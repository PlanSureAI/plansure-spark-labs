import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Filter,
  Search,
  Lock
} from "lucide-react";
import { ComplianceStats } from "@/components/compliance/ComplianceStats";
import { PropertiesList } from "@/components/compliance/PropertiesList";
import { UpcomingDeadlines } from "@/components/compliance/UpcomingDeadlines";
import { AddPropertyDialog } from "@/components/compliance/AddPropertyDialog";
import { WelcomeTour } from "@/components/onboarding/WelcomeTour";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { DemoDataSeeder } from "@/components/onboarding/DemoDataSeeder";

const Compliance = () => {
  const { user, subscribed, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [properties, setProperties] = useState<any[]>([]);
  const [complianceTracking, setComplianceTracking] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showAddProperty, setShowAddProperty] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user && subscribed) {
      loadData();
    }
  }, [user, subscribed]);

  const loadData = async () => {
    setLoadingData(true);
    try {
      // Load properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;
      setProperties(propertiesData || []);

      // Load compliance tracking
      const { data: trackingData, error: trackingError } = await supabase
        .from("compliance_tracking")
        .select(`
          *,
          property:properties(*),
          compliance:compliance_requirements(*)
        `)
        .order("next_deadline", { ascending: true });

      if (trackingError) throw trackingError;
      setComplianceTracking(trackingData || []);

      // Load alerts
      const { data: alertsData, error: alertsError } = await supabase
        .from("compliance_alerts")
        .select(`
          *,
          property:properties(*),
          compliance:compliance_requirements(*)
        `)
        .eq("resolved", false)
        .order("alert_date", { ascending: true });

      if (alertsError) throw alertsError;
      setAlerts(alertsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-5rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscribed) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-6 py-24">
          <Card className="max-w-2xl mx-auto p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Compliance Command Center</h1>
            <p className="text-muted-foreground mb-6">
              Unlock automated sustainability and energy compliance reporting with PlansureAI Pro
            </p>
            <Button size="lg" onClick={() => navigate("/")}>
              Upgrade to Access
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navbar />
      <WelcomeTour />
      
      <div className="container mx-auto px-6 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Compliance Command Center</h1>
            <p className="text-muted-foreground">
              Manage sustainability and energy compliance across your portfolio
            </p>
          </div>
          <Button onClick={() => setShowAddProperty(true)} size="lg" className="add-property-button">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>

        {/* Onboarding Section */}
        {properties.length === 0 && (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <OnboardingChecklist />
            <DemoDataSeeder onSuccess={loadData} />
          </div>
        )}

        <div className="dashboard-overview">
          <ComplianceStats 
            properties={properties}
            tracking={complianceTracking}
            alerts={alerts}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mt-8 compliance-standards-area">
          <div className="lg:col-span-2">
            <PropertiesList 
              properties={properties}
              tracking={complianceTracking}
              onRefresh={loadData}
            />
          </div>
          
          <div className="help-menu">
            <UpcomingDeadlines 
              tracking={complianceTracking}
              alerts={alerts}
            />
          </div>
        </div>
      </div>

      <AddPropertyDialog 
        open={showAddProperty}
        onOpenChange={setShowAddProperty}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Compliance;
