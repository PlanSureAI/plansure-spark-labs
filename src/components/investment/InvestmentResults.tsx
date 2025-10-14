import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, AlertCircle, DollarSign, Percent, Clock, Target } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InvestmentResultsProps {
  analysis: any;
}

export const InvestmentResults = ({ analysis }: InvestmentResultsProps) => {
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

  return (
    <div className="space-y-6">
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

      {/* AI Insights */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Investment Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysis.ai_summary}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">AI Recommendations</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {analysis.ai_recommendations}
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Market Conditions</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {typeof analysis.market_conditions === 'string' 
                ? analysis.market_conditions 
                : JSON.stringify(analysis.market_conditions, null, 2)}
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Scenario Analysis */}
      {analysis.scenarios && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Scenario Analysis</h3>
          <div className="space-y-4">
            {Object.entries(analysis.scenarios).map(([key, scenario]: [string, any]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div>
                  <div className="font-medium capitalize">{key} Case</div>
                  <div className="text-xs text-muted-foreground">{scenario.description}</div>
                </div>
                <div className="text-right text-sm">
                  <div>Appreciation: {scenario.appreciation}%</div>
                  <div>Vacancy: {scenario.vacancy}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
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
