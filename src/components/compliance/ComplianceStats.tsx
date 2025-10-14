import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, XCircle, Building2 } from "lucide-react";

interface ComplianceStatsProps {
  properties: any[];
  tracking: any[];
  alerts: any[];
}

export const ComplianceStats = ({ properties, tracking, alerts }: ComplianceStatsProps) => {
  const greenCount = tracking.filter(t => t.status === 'green').length;
  const amberCount = tracking.filter(t => t.status === 'amber').length;
  const redCount = tracking.filter(t => t.status === 'red').length;
  const unresolvedAlerts = alerts.filter(a => !a.resolved).length;

  const stats = [
    {
      label: "Total Properties",
      value: properties.length,
      icon: Building2,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Compliant",
      value: greenCount,
      icon: CheckCircle2,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "At Risk",
      value: amberCount,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      label: "Overdue",
      value: redCount,
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
