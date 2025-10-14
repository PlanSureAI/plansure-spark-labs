import { Card } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";
import { AlertTriangle } from "lucide-react";

interface RiskRadarChartProps {
  analysis: any;
}

export const RiskRadarChart = ({ analysis }: RiskRadarChartProps) => {
  // Calculate individual risk factors based on analysis parameters
  const calculateRiskFactors = () => {
    const factors = [];

    // Leverage Risk (higher leverage = higher risk)
    const leverageRatio = (analysis.purchase_price - (analysis.purchase_price * analysis.down_payment_percent / 100)) / analysis.purchase_price;
    const leverageRisk = Math.min(100, leverageRatio * 120);
    factors.push({ factor: "Leverage", risk: leverageRisk });

    // Interest Rate Risk
    const interestRateRisk = Math.min(100, (analysis.loan_interest_rate / 10) * 100);
    factors.push({ factor: "Interest Rate", risk: interestRateRisk });

    // Vacancy Risk
    const vacancyRisk = analysis.vacancy_rate * 10;
    factors.push({ factor: "Vacancy", risk: vacancyRisk });

    // Cash Flow Risk (based on cash on cash return)
    const cashFlowRisk = analysis.cash_on_cash_return < 5 ? 80 : 
                         analysis.cash_on_cash_return < 8 ? 50 : 20;
    factors.push({ factor: "Cash Flow", risk: cashFlowRisk });

    // Market Risk (based on appreciation assumptions)
    const marketRisk = analysis.annual_property_appreciation < 2 ? 70 :
                       analysis.annual_property_appreciation > 5 ? 40 : 30;
    factors.push({ factor: "Market", risk: marketRisk });

    // ROI Risk (based on IRR)
    const roiRisk = analysis.irr < 10 ? 70 :
                    analysis.irr < 15 ? 40 : 20;
    factors.push({ factor: "ROI", risk: roiRisk });

    return factors;
  };

  const riskData = calculateRiskFactors();

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Risk Factor Analysis</h3>
        </div>
        
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={riskData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis 
              dataKey="factor" 
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar
              name="Risk Level"
              dataKey="risk"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive))"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t">
          {riskData.map((item) => (
            <div key={item.factor} className="flex items-center justify-between p-2 bg-muted/30 rounded">
              <span className="text-sm font-medium">{item.factor}</span>
              <span className={`text-sm font-bold ${
                item.risk > 60 ? 'text-red-600' :
                item.risk > 40 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {item.risk.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
