import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { GitCompare, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScenarioComparisonProps {
  analysis: any;
}

export const ScenarioComparison = ({ analysis }: ScenarioComparisonProps) => {
  // Calculate metrics for each scenario
  const calculateScenarioMetrics = (scenario: any) => {
    const downPayment = analysis.purchase_price * (analysis.down_payment_percent / 100);
    const loanAmount = analysis.purchase_price - downPayment;
    const monthlyRate = analysis.loan_interest_rate / 100 / 12;
    const numPayments = analysis.loan_term_years * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualDebtService = monthlyPayment * 12;
    
    const effectiveRentalIncome = analysis.annual_rental_income * (1 - scenario.vacancy / 100);
    const annualNOI = effectiveRentalIncome - analysis.annual_operating_expenses;
    const annualCashFlow = annualNOI - annualDebtService;
    
    // Calculate approximate IRR for scenario
    const yearlyAppreciation = Math.pow(1 + scenario.appreciation / 100, analysis.holding_period_years);
    const futureValue = analysis.purchase_price * yearlyAppreciation;
    const saleProceeds = futureValue - loanAmount;
    const totalReturn = (annualCashFlow * analysis.holding_period_years) + saleProceeds;
    const approximateIRR = ((totalReturn / downPayment) - 1) / analysis.holding_period_years * 100;

    return {
      cashFlow: annualCashFlow,
      irr: approximateIRR,
      noi: annualNOI,
      propertyValue: futureValue,
    };
  };

  const scenarios = analysis.scenarios || {};
  const comparisonData = [
    {
      scenario: "Pessimistic",
      ...calculateScenarioMetrics(scenarios.pessimistic || { appreciation: 1, vacancy: 8 }),
      appreciation: scenarios.pessimistic?.appreciation || 1,
      vacancy: scenarios.pessimistic?.vacancy || 8,
    },
    {
      scenario: "Base Case",
      ...calculateScenarioMetrics(scenarios.base || { appreciation: 3, vacancy: 5 }),
      appreciation: scenarios.base?.appreciation || 3,
      vacancy: scenarios.base?.vacancy || 5,
    },
    {
      scenario: "Optimistic",
      ...calculateScenarioMetrics(scenarios.optimistic || { appreciation: 5, vacancy: 3 }),
      appreciation: scenarios.optimistic?.appreciation || 5,
      vacancy: scenarios.optimistic?.vacancy || 3,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  const getScenarioIcon = (scenario: string) => {
    if (scenario === 'Optimistic') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (scenario === 'Pessimistic') return <TrendingDown className="w-4 h-4 text-orange-600" />;
    return <Minus className="w-4 h-4 text-blue-600" />;
  };

  const getScenarioColor = (scenario: string) => {
    if (scenario === 'Optimistic') return 'hsl(var(--chart-3))';
    if (scenario === 'Pessimistic') return 'hsl(var(--destructive))';
    return 'hsl(var(--primary))';
  };

  return (
    <div className="space-y-6">
      {/* Scenario Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {comparisonData.map((scenario) => (
          <Card key={scenario.scenario} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm">{scenario.scenario}</h4>
                {getScenarioIcon(scenario.scenario)}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Appreciation</span>
                  <Badge variant="outline" className="font-medium">{scenario.appreciation}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vacancy</span>
                  <Badge variant="outline" className="font-medium">{scenario.vacancy}%</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IRR</span>
                  <Badge className="font-bold">{formatPercent(scenario.irr)}</Badge>
                </div>
                <div className="flex justify-between pt-1 border-t">
                  <span className="text-muted-foreground">Cash Flow</span>
                  <span className="font-medium">{formatCurrency(scenario.cashFlow)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* IRR Comparison */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">IRR Scenario Comparison</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="scenario" className="text-xs" />
              <YAxis tickFormatter={formatPercent} className="text-xs" />
              <Tooltip 
                formatter={(value: number) => formatPercent(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar 
                dataKey="irr" 
                name="IRR %"
                radius={[8, 8, 0, 0]}
              >
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScenarioColor(entry.scenario)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Cash Flow Comparison */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Annual Cash Flow Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="scenario" className="text-xs" />
              <YAxis tickFormatter={formatCurrency} className="text-xs" />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar 
                dataKey="cashFlow" 
                name="Annual Cash Flow"
                radius={[8, 8, 0, 0]}
              >
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScenarioColor(entry.scenario)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Property Value Comparison */}
      <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Future Property Value Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="scenario" className="text-xs" />
              <YAxis tickFormatter={formatCurrency} className="text-xs" />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
              />
              <Legend />
              <Bar 
                dataKey="propertyValue" 
                name="Property Value"
                radius={[8, 8, 0, 0]}
              >
                {comparisonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getScenarioColor(entry.scenario)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
