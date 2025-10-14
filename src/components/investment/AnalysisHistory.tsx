import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { TrendingUp, Calendar, DollarSign, Trash2 } from "lucide-react";

interface AnalysisHistoryProps {
  onSelectAnalysis: (analysis: any) => void;
}

export const AnalysisHistory = ({ onSelectAnalysis }: AnalysisHistoryProps) => {
  const { toast } = useToast();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const { data, error } = await supabase
        .from("investment_analyses")
        .select("*")
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
    <div className="space-y-4">
      {analyses.map((analysis) => (
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
  );
};
