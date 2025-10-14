import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Percent, Clock, Target, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CashFlowChart } from "./CashFlowChart";
import { RiskRadarChart } from "./RiskRadarChart";
import { ScenarioComparison } from "./ScenarioComparison";
import { ShareAnalysisDialog } from "./ShareAnalysisDialog";
import { AnalysisComments } from "./AnalysisComments";
import { BatchExportDialog } from "./BatchExportDialog";
import { generateInvestmentReport } from "@/lib/pdfExport";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface InvestmentResultsProps {
  analysis: any;
}

export const InvestmentResults = ({ analysis }: InvestmentResultsProps) => {
  const { toast } = useToast();
  const { currentWorkspace } = useWorkspace();
  
  const getRiskColor = (score: number) => {
    if (score <= 30) return "text-green-600";
    if (score <= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return "Low Risk";
    if (score <= 60) return "Moderate Risk";
    return "High Risk";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const handleExportPDF = async () => {
    try {
      toast({
        title: "Generating PDF...",
        description: "This may take a few moments.",
      });
      await generateInvestmentReport(analysis, "analysis-charts");
      toast({
        title: "PDF Generated!",
        description: "Your investment report has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error generating the PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6" id="investment-results">
      {/* Export and Share Buttons */}
      <div className="flex justify-end gap-2">
        {currentWorkspace && <BatchExportDialog workspaceId={currentWorkspace.id} />}
        <ShareAnalysisDialog
          analysisId={analysis.id}
          currentShareToken={analysis.share_token}
          isShared={analysis.is_shared}
        />
        <Button onClick={handleExportPDF} className="gap-2">
          <Download className="w-4 h-4" />
          Export PDF Report
        </Button>
      </div>

      {/* Risk Score */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Risk Assessment
            </h3>
            <Badge variant="outline" className={getRiskColor(analysis.risk_score)}>
              {getRiskLabel(analysis.risk_score)}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Risk Score</span>
              <span className="font-semibold">{analysis.risk_score}/100</span>
            </div>
            <Progress value={analysis.risk_score} className="h-2" />
          </div>
        </div>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Cash Flow</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Financial Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="IRR"
                value={formatPercent(analysis.irr)}
                positive={analysis.irr > 10}
              />
              <MetricCard
                icon={<DollarSign className="w-5 h-5" />}
                label="NPV"
                value={formatCurrency(analysis.npv)}
                positive={analysis.npv > 0}
              />
              <MetricCard
                icon={<Percent className="w-5 h-5" />}
                label="Cap Rate"
                value={formatPercent(analysis.cap_rate)}
                positive={analysis.cap_rate > 5}
              />
              <MetricCard
                icon={<Target className="w-5 h-5" />}
                label="Cash on Cash"
                value={formatPercent(analysis.cash_on_cash_return)}
                positive={analysis.cash_on_cash_return > 8}
              />
              <MetricCard
                icon={<Clock className="w-5 h-5" />}
                label="Payback Period"
                value={`${analysis.payback_period_years.toFixed(1)} years`}
                positive={analysis.payback_period_years < 10}
              />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="charts">
          <div id="analysis-charts">
            <CashFlowChart analysis={analysis} />
          </div>
        </TabsContent>

        <TabsContent value="risk">
          <RiskRadarChart analysis={analysis} />
        </TabsContent>

        <TabsContent value="scenarios">
          <ScenarioComparison analysis={analysis} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Investment Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.ai_summary}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-3">AI Recommendations</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {analysis.ai_recommendations}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Market Conditions</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {typeof analysis.market_conditions === 'string' 
                ? analysis.market_conditions 
                : JSON.stringify(analysis.market_conditions, null, 2)}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <AnalysisComments analysisId={analysis.id} />
        </TabsContent>
      </Tabs>

    </div>
  );
};

const MetricCard = ({ icon, label, value, positive }: any) => (
  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground">{icon}</div>
      {positive ? (
        <TrendingUp className="w-4 h-4 text-green-600" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-600" />
      )}
    </div>
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  </div>
);
