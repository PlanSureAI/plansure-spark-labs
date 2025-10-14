import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface CashFlowChartProps {
  analysis: any;
}

export const CashFlowChart = ({ analysis }: CashFlowChartProps) => {
  const [selectedScenario, setSelectedScenario] = useState<'base' | 'optimistic' | 'pessimistic'>('base');
  const [visibleMetrics, setVisibleMetrics] = useState({
    cashFlow: true,
    cumulativeCashFlow: true,
    propertyValue: true,
    noi: true,
  });

  const toggleMetric = (metric: keyof typeof visibleMetrics) => {
    setVisibleMetrics(prev => ({ ...prev, [metric]: !prev[metric] }));
  };

  // Calculate cash flows for visualization with scenario adjustments
  const generateCashFlowData = (scenario: 'base' | 'optimistic' | 'pessimistic') => {
    // Scenario adjustments
    const scenarioMultipliers = {
      optimistic: { appreciation: 1.5, vacancy: 0.6, expenses: 0.9 },
      base: { appreciation: 1.0, vacancy: 1.0, expenses: 1.0 },
      pessimistic: { appreciation: 0.5, vacancy: 1.5, expenses: 1.1 },
    };
    
    const multiplier = scenarioMultipliers[scenario];
    const data = [];
    const downPayment = analysis.purchase_price * (analysis.down_payment_percent / 100);
    const loanAmount = analysis.purchase_price - downPayment;
    const monthlyRate = analysis.loan_interest_rate / 100 / 12;
    const numPayments = analysis.loan_term_years * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualDebtService = monthlyPayment * 12;
    
    // Apply scenario adjustments
    const adjustedVacancyRate = analysis.vacancy_rate * multiplier.vacancy;
    const adjustedExpenses = analysis.annual_operating_expenses * multiplier.expenses;
    const adjustedAppreciation = analysis.annual_property_appreciation * multiplier.appreciation;
    
    const effectiveRentalIncome = analysis.annual_rental_income * (1 - adjustedVacancyRate / 100);
    const annualNOI = effectiveRentalIncome - adjustedExpenses;
    const baseCashFlow = annualNOI - annualDebtService;

    // Year 0 - Initial Investment
    data.push({
      year: 0,
      cashFlow: -downPayment,
      cumulativeCashFlow: -downPayment,
      noi: 0,
      propertyValue: analysis.purchase_price,
    });

    let cumulative = -downPayment;

    for (let year = 1; year <= analysis.holding_period_years; year++) {
      const yearlyAppreciation = Math.pow(1 + adjustedAppreciation / 100, year);
      const yearCashFlow = baseCashFlow * yearlyAppreciation;
      const propertyValue = analysis.purchase_price * yearlyAppreciation;
      const yearNOI = annualNOI * yearlyAppreciation;
      
      cumulative += yearCashFlow;

      // Add sale proceeds in final year
      if (year === analysis.holding_period_years) {
        const saleProceeds = propertyValue - loanAmount;
        const totalYearCashFlow = yearCashFlow + saleProceeds;
        cumulative += saleProceeds;
        
        data.push({
          year,
          cashFlow: totalYearCashFlow,
          cumulativeCashFlow: cumulative,
          noi: yearNOI,
          propertyValue,
          saleProceeds,
        });
      } else {
        data.push({
          year,
          cashFlow: yearCashFlow,
          cumulativeCashFlow: cumulative,
          noi: yearNOI,
          propertyValue,
        });
      }
    }

    return data;
  };

  const cashFlowData = generateCashFlowData(selectedScenario);

  const scenarioLabels = {
    optimistic: { label: 'Optimistic', color: 'bg-green-500' },
    base: { label: 'Base Case', color: 'bg-blue-500' },
    pessimistic: { label: 'Pessimistic', color: 'bg-orange-500' },
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Filter Controls */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-sm">Interactive Filters</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Scenario Selection</label>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(scenarioLabels) as Array<keyof typeof scenarioLabels>).map((scenario) => (
                  <Button
                    key={scenario}
                    size="sm"
                    variant={selectedScenario === scenario ? "default" : "outline"}
                    onClick={() => setSelectedScenario(scenario)}
                    className="gap-1"
                  >
                    <span className={`w-2 h-2 rounded-full ${scenarioLabels[scenario].color}`} />
                    {scenarioLabels[scenario].label}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Toggle Metrics</label>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={visibleMetrics.cashFlow ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMetric('cashFlow')}
                >
                  Cash Flow
                </Badge>
                <Badge
                  variant={visibleMetrics.cumulativeCashFlow ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMetric('cumulativeCashFlow')}
                >
                  Cumulative
                </Badge>
                <Badge
                  variant={visibleMetrics.propertyValue ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMetric('propertyValue')}
                >
                  Property Value
                </Badge>
                <Badge
                  variant={visibleMetrics.noi ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleMetric('noi')}
                >
                  NOI
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cash Flow Over Time */}
      {visibleMetrics.cashFlow && (
        <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Annual Cash Flow Projection</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                className="text-xs"
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                labelFormatter={(label) => `Year ${label} (${scenarioLabels[selectedScenario].label})`}
              />
              <Legend />
              <Bar 
                dataKey="cashFlow" 
                fill="hsl(var(--primary))" 
                name="Annual Cash Flow"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      )}

      {/* Cumulative Returns */}
      {(visibleMetrics.cumulativeCashFlow || visibleMetrics.propertyValue) && (
        <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Cumulative Returns & Property Value</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                className="text-xs"
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                labelFormatter={(label) => `Year ${label} (${scenarioLabels[selectedScenario].label})`}
              />
              <Legend />
              {visibleMetrics.cumulativeCashFlow && (
                <Line 
                  type="monotone" 
                  dataKey="cumulativeCashFlow" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  name="Cumulative Cash Flow"
                  dot={{ r: 4 }}
                />
              )}
              {visibleMetrics.propertyValue && (
                <Line 
                  type="monotone" 
                  dataKey="propertyValue" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Property Value"
                  dot={{ r: 3 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      )}

      {/* NOI Trend */}
      {visibleMetrics.noi && (
        <Card className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Net Operating Income (NOI) Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={cashFlowData.slice(1)}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="year" 
                label={{ value: 'Year', position: 'insideBottom', offset: -5 }}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={formatCurrency}
                className="text-xs"
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                labelFormatter={(label) => `Year ${label} (${scenarioLabels[selectedScenario].label})`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="noi" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={3}
                name="Net Operating Income"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      )}
    </div>
  );
};
