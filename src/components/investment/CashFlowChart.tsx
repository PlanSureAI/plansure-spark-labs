import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";

interface CashFlowChartProps {
  analysis: any;
}

export const CashFlowChart = ({ analysis }: CashFlowChartProps) => {
  // Calculate cash flows for visualization
  const generateCashFlowData = () => {
    const data = [];
    const downPayment = analysis.purchase_price * (analysis.down_payment_percent / 100);
    const loanAmount = analysis.purchase_price - downPayment;
    const monthlyRate = analysis.loan_interest_rate / 100 / 12;
    const numPayments = analysis.loan_term_years * 12;
    const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                          (Math.pow(1 + monthlyRate, numPayments) - 1);
    const annualDebtService = monthlyPayment * 12;
    
    const effectiveRentalIncome = analysis.annual_rental_income * (1 - analysis.vacancy_rate / 100);
    const annualNOI = effectiveRentalIncome - analysis.annual_operating_expenses;
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
      const yearlyAppreciation = Math.pow(1 + analysis.annual_property_appreciation / 100, year);
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

  const cashFlowData = generateCashFlowData();

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
      {/* Cash Flow Over Time */}
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

      {/* Cumulative Returns */}
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
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulativeCashFlow" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                name="Cumulative Cash Flow"
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="propertyValue" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Property Value"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* NOI Trend */}
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
    </div>
  );
};
