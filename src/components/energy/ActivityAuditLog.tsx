import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Eye, 
  Edit, 
  Plus, 
  Trash2, 
  Share2, 
  Download,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityAuditLogProps {
  entityType?: string;
  entityId?: string;
  workspaceId?: string;
}

export const ActivityAuditLog = ({ entityType, entityId, workspaceId }: ActivityAuditLogProps) => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [entityType, entityId, workspaceId]);

  const fetchActivities = async () => {
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (entityType) query = query.eq('entity_type', entityType);
      if (entityId) query = query.eq('entity_id', entityId);
      if (workspaceId) query = query.eq('workspace_id', workspaceId);

      const { data, error } = await query;

      if (error) throw error;
      setActivities(data || []);
    } catch (error: any) {
      console.error('Error fetching activities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, any> = {
      view: Eye,
      edit: Edit,
      create: Plus,
      delete: Trash2,
      share: Share2,
      export: Download
    };
    const Icon = icons[action] || Eye;
    return <Icon className="w-4 h-4" />;
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      view: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
      edit: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
      create: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
      delete: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
      share: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
      export: 'bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400'
    };
    return colors[action] || 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading activity log...</div>;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">Activity & Audit Trail</h3>
        <Badge variant="outline">{activities.length} activities</Badge>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No activity recorded yet</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id}
                className="flex gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className={`p-2 rounded-lg h-fit ${getActionColor(activity.action)}`}>
                  {getActionIcon(activity.action)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold">
                      {activity.profiles?.full_name || activity.profiles?.email || 'Unknown User'}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium capitalize">{activity.action}</span>
                    {' '}{activity.entity_type.replace('_', ' ')}
                  </p>

                  {activity.action_details && (
                    <div className="mt-2 p-2 rounded bg-muted/50 text-xs">
                      {activity.action_details.changes ? (
                        <div className="space-y-1">
                          {Object.entries(activity.action_details.changes).map(([field, change]: [string, any]) => (
                            <div key={field} className="flex gap-2">
                              <span className="font-medium">{field}:</span>
                              <span className="text-muted-foreground">
                                {change.old} → {change.new}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>{JSON.stringify(activity.action_details, null, 2)}</p>
                      )}
                    </div>
                  )}

                  {activity.ip_address && (
                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>IP: {activity.ip_address}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
