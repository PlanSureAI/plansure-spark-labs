import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Leaf, TrendingDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EnergyAnalysisHistoryProps {
  onSelectAnalysis: (analysis: any) => void;
}

export const EnergyAnalysisHistory = ({ onSelectAnalysis }: EnergyAnalysisHistoryProps) => {
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalyses();
    }
  }, [user]);

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from('energy_analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error) {
      console.error('Error loading analyses:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Leaf className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">No Analyses Yet</h3>
        <p className="text-muted-foreground">
          Create your first energy analysis to see zero carbon forecasts.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {analyses.map((analysis) => (
        <Card key={analysis.id} className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">{analysis.building_type}</h3>
                <span className="text-sm text-muted-foreground">
                  {analysis.floor_area_sqft} sq ft
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="text-xs text-muted-foreground">Sustainability Score</div>
                  <div className="font-semibold text-green-600">{analysis.sustainability_score}/100</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Energy Savings</div>
                  <div className="font-semibold flex items-center gap-1">
                    <TrendingDown className="w-3 h-3 text-green-600" />
                    {analysis.forecast_energy_savings_percent?.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Annual Savings</div>
                  <div className="font-semibold">{formatCurrency(analysis.annual_savings)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Payback Period</div>
                  <div className="font-semibold">{analysis.payback_period_years?.toFixed(1)} years</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Created {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
              </div>
            </div>

            <Button 
              onClick={() => onSelectAnalysis(analysis)}
              variant="outline"
            >
              View Details
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
