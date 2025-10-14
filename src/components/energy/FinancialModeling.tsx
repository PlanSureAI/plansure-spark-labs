import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  PieChart,
  Plus
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

interface FinancialModelingProps {
  analysisId: string;
  models: any[];
}

export const FinancialModeling = ({ analysisId, models }: FinancialModelingProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Sample data for cash flow chart
  const generateCashFlowData = (projections: any) => {
    if (!projections) return [];
    
    return Array.from({ length: 20 }, (_, i) => ({
      year: i + 1,
      savings: 8000 + (i * 400),
      costs: i === 0 ? 25000 : 500,
      netCashFlow: i === 0 ? -17000 : 7500 + (i * 400)
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Zero Bills Financial Modeling</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Model
        </Button>
      </div>

      {models.length === 0 ? (
        <Card className="p-8 text-center">
          <PieChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Financial Models Created</h4>
          <p className="text-muted-foreground mb-4">
            Build cash flow models to evaluate zero energy bill guarantees and payback scenarios
          </p>
          <Button>Create Financial Model</Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {models.map((model) => (
            <Card key={model.id} className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h4 className="text-xl font-bold mb-2">{model.model_name}</h4>
                  <div className="flex gap-2">
                    <Badge variant="outline">{model.guarantee_type?.replace('_', ' ')}</Badge>
                    {model.utility_partner && (
                      <Badge>{model.utility_partner}</Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit Model</Button>
              </div>

              <Tabs defaultValue="cashflow" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
                  <TabsTrigger value="payback">Payback</TabsTrigger>
                  <TabsTrigger value="incentives">Incentives</TabsTrigger>
                  <TabsTrigger value="risk">Risk</TabsTrigger>
                </TabsList>

                <TabsContent value="cashflow" className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-muted-foreground">Total Savings (20yr)</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(model.simulation_results?.total_savings || 160000)}
                      </p>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-muted-foreground">Payback Period</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {model.payback_analysis?.years || 3.2} years
                      </p>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-muted-foreground">ROI (20yr)</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        {model.simulation_results?.roi || 540}%
                      </p>
                    </Card>
                  </div>

                  <div className="h-80 mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={generateCashFlowData(model.cash_flow_projections)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" label={{ value: 'Year', position: 'insideBottom', offset: -5 }} />
                        <YAxis label={{ value: 'Amount (£)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="savings" 
                          stackId="1"
                          stroke="#10b981" 
                          fill="#10b981" 
                          fillOpacity={0.6}
                          name="Annual Savings"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="costs" 
                          stackId="2"
                          stroke="#ef4444" 
                          fill="#ef4444" 
                          fillOpacity={0.6}
                          name="Annual Costs"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="netCashFlow" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          name="Net Cash Flow"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>

                <TabsContent value="incentives" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    {model.government_incentives?.map((incentive: any, idx: number) => (
                      <Card key={idx} className="p-4">
                        <h5 className="font-semibold mb-2">{incentive.name}</h5>
                        <p className="text-sm text-muted-foreground mb-2">{incentive.description}</p>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">{incentive.type}</Badge>
                          <span className="font-bold text-green-600">
                            {formatCurrency(incentive.amount)}
                          </span>
                        </div>
                      </Card>
                    )) || (
                      <p className="text-muted-foreground col-span-2">No incentives configured</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="risk" className="space-y-4">
                  <div className="space-y-3">
                    {model.risk_assessment?.risks?.map((risk: any, idx: number) => (
                      <Card key={idx} className="p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className={`w-5 h-5 mt-1 ${
                            risk.severity === 'high' ? 'text-red-600' : 
                            risk.severity === 'medium' ? 'text-amber-600' : 
                            'text-blue-600'
                          }`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-semibold">{risk.name}</h5>
                              <Badge variant={
                                risk.severity === 'high' ? 'destructive' : 
                                risk.severity === 'medium' ? 'default' : 
                                'secondary'
                              }>
                                {risk.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
                            <p className="text-sm"><strong>Mitigation:</strong> {risk.mitigation}</p>
                          </div>
                        </div>
                      </Card>
                    )) || (
                      <p className="text-muted-foreground">No risk assessment available</p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="payback">
                  <Card className="p-6">
                    <h4 className="font-semibold mb-4">Payback Analysis</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Initial Investment</span>
                        <span className="font-bold">{formatCurrency(model.payback_analysis?.initial_investment || 25000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Annual Savings</span>
                        <span className="font-bold">{formatCurrency(model.payback_analysis?.annual_savings || 8000)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Simple Payback</span>
                        <span className="font-bold">{model.payback_analysis?.simple_payback || 3.1} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Discounted Payback</span>
                        <span className="font-bold">{model.payback_analysis?.discounted_payback || 3.8} years</span>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
