import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { GitCompare } from "lucide-react";

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

  return (
    <div className="space-y-6">
      {/* Scenario Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {comparisonData.map((scenario) => (
          <Card key={scenario.scenario} className="p-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">{scenario.scenario}</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Appreciation</span>
                  <span className="font-medium">{scenario.appreciation}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Vacancy</span>
                  <span className="font-medium">{scenario.vacancy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IRR</span>
                  <span className="font-bold text-primary">{formatPercent(scenario.irr)}</span>
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
                fill="hsl(var(--primary))"
                name="IRR %"
                radius={[8, 8, 0, 0]}
              />
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
                fill="hsl(var(--chart-2))"
                name="Annual Cash Flow"
                radius={[8, 8, 0, 0]}
              />
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
                fill="hsl(var(--chart-3))"
                name="Property Value"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
