import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Leaf, TrendingDown, DollarSign, Award, Plus, Zap, Clock } from "lucide-react";

interface EnergyAnalysisResultsProps {
  analysis: any;
  onNewAnalysis: () => void;
}

export const EnergyAnalysisResults = ({ analysis, onNewAnalysis }: EnergyAnalysisResultsProps) => {
  const getSustainabilityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-GB').format(Math.round(value));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={onNewAnalysis} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" />
          New Analysis
        </Button>
      </div>

      {/* Sustainability Score */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Award className="w-5 h-5" />
              Sustainability Score
            </h3>
            <Badge variant="outline" className={getSustainabilityColor(analysis.sustainability_score)}>
              {analysis.sustainability_score}/100
            </Badge>
          </div>
          <Progress value={analysis.sustainability_score} className="h-3" />
          <p className="text-sm text-muted-foreground">
            Green Certification: <span className="font-semibold">{analysis.green_certification_readiness}</span>
          </p>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
          <TabsTrigger value="carbon">Carbon</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard
                icon={<TrendingDown className="w-5 h-5" />}
                label="Energy Savings"
                value={`${analysis.forecast_energy_savings_percent?.toFixed(1)}%`}
                positive={true}
              />
              <MetricCard
                icon={<DollarSign className="w-5 h-5" />}
                label="Annual Savings"
                value={formatCurrency(analysis.forecast_cost_savings_annual)}
                positive={true}
              />
              <MetricCard
                icon={<Leaf className="w-5 h-5" />}
                label="Carbon Reduction"
                value={`${formatNumber(analysis.forecast_carbon_reduction_kg)} kg`}
                positive={true}
              />
              <MetricCard
                icon={<DollarSign className="w-5 h-5" />}
                label="Upgrade Cost"
                value={formatCurrency(analysis.total_upgrade_cost)}
                positive={false}
              />
              <MetricCard
                icon={<Clock className="w-5 h-5" />}
                label="Payback Period"
                value={`${analysis.payback_period_years?.toFixed(1)} years`}
                positive={analysis.payback_period_years < 10}
              />
              <MetricCard
                icon={<Zap className="w-5 h-5" />}
                label="20-Year ROI"
                value={`${analysis.roi_20_year?.toFixed(0)}%`}
                positive={analysis.roi_20_year > 100}
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Investment</span>
                <span className="font-semibold">{formatCurrency(analysis.total_upgrade_cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Government Incentives</span>
                <span className="font-semibold text-green-600">{formatCurrency(analysis.government_incentives)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Investment</span>
                <span className="font-semibold">{formatCurrency(analysis.total_upgrade_cost - analysis.government_incentives)}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-muted-foreground">Annual Energy Savings</span>
                <span className="font-semibold">{formatCurrency(analysis.annual_savings)}</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Energy Comparison</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Current Usage</span>
                  <span className="text-sm font-semibold">{formatNumber(analysis.current_annual_energy_kwh)} kWh/year</span>
                </div>
                <Progress value={100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Forecast Usage</span>
                  <span className="text-sm font-semibold text-green-600">{formatNumber(analysis.forecast_annual_energy_kwh)} kWh/year</span>
                </div>
                <Progress 
                  value={(analysis.forecast_annual_energy_kwh / analysis.current_annual_energy_kwh) * 100} 
                  className="h-2" 
                />
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                  You'll save {formatNumber(analysis.current_annual_energy_kwh - analysis.forecast_annual_energy_kwh)} kWh annually
                  ({analysis.forecast_energy_savings_percent?.toFixed(1)}% reduction)
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="carbon" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Carbon Footprint Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Current Emissions</h4>
                <div className="text-3xl font-bold text-red-600">
                  {formatNumber(analysis.current_annual_carbon_kg)} kg
                </div>
                <p className="text-sm text-muted-foreground mt-1">CO2 per year</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Forecast Emissions</h4>
                <div className="text-3xl font-bold text-green-600">
                  {formatNumber(analysis.forecast_annual_carbon_kg)} kg
                </div>
                <p className="text-sm text-muted-foreground mt-1">CO2 per year</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700 dark:text-green-400">
                  Total Carbon Reduction
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {formatNumber(analysis.forecast_carbon_reduction_kg)} kg CO2/year
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Operational: {formatNumber(analysis.operational_carbon_kg)} kg | 
                Embodied (from upgrades): {formatNumber(analysis.embodied_carbon_kg)} kg
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-3">Summary</h3>
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

          {analysis.improvement_priorities && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Priority Actions</h3>
              <div className="space-y-3">
                {analysis.improvement_priorities.map((item: any, idx: number) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="font-semibold text-sm mb-1">{item.priority}</div>
                    <div className="text-sm text-muted-foreground">{item.action}</div>
                    <div className="text-xs text-green-600 mt-1">Impact: {item.impact}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const MetricCard = ({ icon, label, value, positive }: any) => (
  <div className="p-4 bg-muted/30 rounded-lg space-y-2">
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground">{icon}</div>
      {positive !== undefined && (
        <TrendingDown className={`w-4 h-4 ${positive ? 'text-green-600' : 'text-muted-foreground'}`} />
      )}
    </div>
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  </div>
);
