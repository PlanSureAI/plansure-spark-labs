import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useToast } from "@/hooks/use-toast";
import { Database, Trash2, Loader2 } from "lucide-react";

export const DemoDataSeeder = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user } = useAuth();
  const { hasDemoData, enableDemoData } = useOnboarding();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const createDemoData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Create demo property
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert([{
          user_id: user.id,
          address: "123 Demo Street (Sample)",
          property_type: "residential",
          city: "London",
          state: "England",
          postal_code: "SW1A 1AA",
          country: "United Kingdom",
          size_sqft: 1500,
          status: "active",
        }])
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Get compliance requirements
      const { data: requirements, error: reqError } = await supabase
        .from("compliance_requirements")
        .select("id")
        .limit(3);

      if (reqError) throw reqError;

      // Create demo compliance tracking
      if (requirements && requirements.length > 0) {
        const trackingRecords = requirements.map((req, idx) => ({
          property_id: property.id,
          compliance_id: req.id,
          status: idx === 0 ? "green" : idx === 1 ? "amber" : "red",
          last_audit_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          next_deadline: new Date(Date.now() + (idx + 1) * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          notes: `Demo compliance record ${idx + 1} - This is sample data for demonstration purposes.`,
          last_updated_by: user.id,
        }));

        const { error: trackingError } = await supabase
          .from("compliance_tracking")
          .insert(trackingRecords);

        if (trackingError) throw trackingError;
      }

      enableDemoData();
      toast({
        title: "Demo data created",
        description: "Sample property and compliance records have been added to your portfolio.",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error creating demo data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteDemoData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Delete demo property (cascade will handle tracking)
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("user_id", user.id)
        .like("address", "%Demo Street (Sample)%");

      if (error) throw error;

      toast({
        title: "Demo data removed",
        description: "Sample property has been deleted from your portfolio.",
      });

      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({
        title: "Error removing demo data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Demo Data
        </CardTitle>
        <CardDescription>
          Explore the platform with sample property and compliance data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {hasDemoData 
              ? "Demo property is active in your portfolio. You can delete it anytime to start fresh."
              : "Load sample data to see how compliance tracking works before adding your own properties."}
          </AlertDescription>
        </Alert>

        <div className="flex gap-2">
          {!hasDemoData ? (
            <Button onClick={createDemoData} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Load Demo Data
            </Button>
          ) : (
            <Button variant="outline" onClick={deleteDemoData} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Remove Demo Data
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
