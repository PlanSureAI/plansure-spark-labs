import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

interface UpcomingDeadlinesProps {
  tracking: any[];
  alerts: any[];
}

export const UpcomingDeadlines = ({ tracking, alerts }: UpcomingDeadlinesProps) => {
  const getUrgency = (deadline: string) => {
    const daysUntil = differenceInDays(parseISO(deadline), new Date());
    if (daysUntil < 0) return "overdue";
    if (daysUntil <= 30) return "urgent";
    if (daysUntil <= 90) return "upcoming";
    return "future";
  };

  const getUrgencyBadge = (urgency: string) => {
    const variants: Record<string, { label: string; variant: any; color: string }> = {
      overdue: { label: "Overdue", variant: "destructive" as const, color: "text-destructive" },
      urgent: { label: "Urgent", variant: "secondary" as const, color: "text-yellow-600" },
      upcoming: { label: "Upcoming", variant: "outline" as const, color: "text-primary" },
      future: { label: "Scheduled", variant: "outline" as const, color: "text-muted-foreground" },
    };
    
    const config = variants[urgency] || variants.future;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const sortedTracking = [...tracking]
    .sort((a, b) => new Date(a.next_deadline).getTime() - new Date(b.next_deadline).getTime())
    .slice(0, 10);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-2xl font-semibold">Upcoming Deadlines</h2>
      </div>

      {sortedTracking.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No deadlines tracked yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTracking.map((track) => {
            const urgency = getUrgency(track.next_deadline);
            const daysUntil = differenceInDays(parseISO(track.next_deadline), new Date());
            
            return (
              <Card key={track.id} className="p-4 border-l-4" style={{
                borderLeftColor: urgency === 'overdue' ? 'hsl(var(--destructive))' : 
                                urgency === 'urgent' ? '#ca8a04' : 
                                urgency === 'upcoming' ? 'hsl(var(--primary))' : 
                                'hsl(var(--muted))'
              }}>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm">{track.compliance.name}</h3>
                  {getUrgencyBadge(urgency)}
                </div>
                
                <p className="text-xs text-muted-foreground mb-2">
                  {track.property.address}
                </p>
                
                <div className="flex items-center gap-2 text-xs">
                  <Clock className="w-3 h-3" />
                  <span className={urgency === 'overdue' ? 'text-destructive font-medium' : ''}>
                    {format(parseISO(track.next_deadline), 'MMM d, yyyy')}
                    {daysUntil >= 0 ? ` (${daysUntil} days)` : ` (${Math.abs(daysUntil)} days overdue)`}
                  </span>
                </div>

                {track.notes && (
                  <p className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded">
                    {track.notes}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {alerts.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <h3 className="font-semibold">Active Alerts ({alerts.length})</h3>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="text-xs p-2 bg-destructive/10 rounded">
                <p className="font-medium">{alert.alert_type}</p>
                <p className="text-muted-foreground">{alert.property.address}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
