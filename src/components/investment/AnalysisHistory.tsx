import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, isWithinInterval } from "date-fns";
import { TrendingUp, Calendar, DollarSign, Trash2 } from "lucide-react";
import { AnalysisHistoryFilters, AnalysisFilters } from "./AnalysisHistoryFilters";

interface AnalysisHistoryProps {
  onSelectAnalysis: (analysis: any) => void;
}

export const AnalysisHistory = ({ onSelectAnalysis }: AnalysisHistoryProps) => {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalysisFilters>({
    dateRange: { from: undefined, to: undefined },
    irrRange: "all",
    riskLevel: "all",
    npvRange: "all",
    propertyType: "all",
    city: "all",
    state: "all",
    country: "all",
  });

  useEffect(() => {
    loadAnalyses();
    loadProperties();
  }, []);

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("investment_analyses")
        .select(`
          *,
          properties:property_id (
            id,
            property_type,
            city,
            state,
            country
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("id, property_type, city, state, country");

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      console.error("Error loading properties:", error);
    }
  };

  // Memoized filtered analyses to prevent unnecessary recalculations
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((analysis) => {
      // Date Range Filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const analysisDate = new Date(analysis.created_at);
        if (filters.dateRange.from && filters.dateRange.to) {
          if (!isWithinInterval(analysisDate, { start: filters.dateRange.from, end: filters.dateRange.to })) {
            return false;
          }
        } else if (filters.dateRange.from && analysisDate < filters.dateRange.from) {
          return false;
        } else if (filters.dateRange.to && analysisDate > filters.dateRange.to) {
          return false;
        }
      }

      // IRR Range Filter
      if (filters.irrRange !== "all" && analysis.irr !== null) {
        if (filters.irrRange === "high" && analysis.irr <= 15) return false;
        if (filters.irrRange === "medium" && (analysis.irr < 10 || analysis.irr > 15)) return false;
        if (filters.irrRange === "low" && analysis.irr >= 10) return false;
      }

      // Risk Level Filter
      if (filters.riskLevel !== "all" && analysis.risk_score !== null) {
        if (filters.riskLevel === "low" && analysis.risk_score >= 30) return false;
        if (filters.riskLevel === "moderate" && (analysis.risk_score < 30 || analysis.risk_score > 60)) return false;
        if (filters.riskLevel === "high" && analysis.risk_score <= 60) return false;
      }

      // NPV Range Filter
      if (filters.npvRange !== "all" && analysis.npv !== null) {
        if (filters.npvRange === "positive-high" && analysis.npv <= 100000) return false;
        if (filters.npvRange === "positive-medium" && (analysis.npv < 0 || analysis.npv > 100000)) return false;
        if (filters.npvRange === "negative" && analysis.npv >= 0) return false;
      }

      // Property Type Filter
      if (filters.propertyType !== "all" && analysis.properties) {
        if (analysis.properties.property_type !== filters.propertyType) return false;
      }

      // City Filter
      if (filters.city !== "all" && analysis.properties) {
        if (analysis.properties.city !== filters.city) return false;
      }

      // State Filter
      if (filters.state !== "all" && analysis.properties) {
        if (analysis.properties.state !== filters.state) return false;
      }

      // Country Filter
      if (filters.country !== "all" && analysis.properties) {
        if (analysis.properties.country !== filters.country) return false;
      }

      return true;
    });
  }, [
    analyses,
    filters.dateRange.from,
    filters.dateRange.to,
    filters.irrRange,
    filters.riskLevel,
    filters.npvRange,
    filters.propertyType,
    filters.city,
    filters.state,
    filters.country,
  ]);

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from("investment_analyses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(a => a.id !== id));
      toast({
        title: "Analysis deleted",
        description: "The analysis has been removed from your history.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting analysis",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="p-12 text-center">
        <TrendingUp className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Analyses Yet</h3>
        <p className="text-sm text-muted-foreground">
          Your investment analyses will appear here
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Component */}
      <AnalysisHistoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        properties={properties}
      />

      {/* Results Count */}
      {filteredAnalyses.length !== analyses.length && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredAnalyses.length} of {analyses.length} analyses
        </div>
      )}

      {/* No Results Message */}
      {filteredAnalyses.length === 0 ? (
        <Card className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Matching Analyses</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters to see more results
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAnalyses.map((analysis) => (
        <Card
          key={analysis.id}
          className="p-6 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onSelectAnalysis(analysis)}
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      minimumFractionDigits: 0,
                    }).format(analysis.purchase_price)}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {formatDistanceToNow(new Date(analysis.created_at), { addSuffix: true })}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={analysis.risk_score > 60 ? "destructive" : "default"}>
                  Risk: {analysis.risk_score}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAnalysis(analysis.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <div className="text-xs text-muted-foreground">IRR</div>
                <div className="font-semibold">{analysis.irr?.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cap Rate</div>
                <div className="font-semibold">{analysis.cap_rate?.toFixed(2)}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Cash on Cash</div>
                <div className="font-semibold">{analysis.cash_on_cash_return?.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        </Card>
          ))}
        </div>
      )}
    </div>
  );
};
