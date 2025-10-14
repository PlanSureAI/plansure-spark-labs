import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  Bell,
  AlertTriangle, 
  CheckCircle2,
  Info,
  Zap,
  Wrench,
  TrendingUp,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    // Subscribe to real-time notifications
    const channel = supabase
      .channel('user_notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotification = payload.new;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for critical notifications
        if (newNotification.severity === 'critical') {
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: "destructive",
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);

      toast({
        title: "All notifications marked as read",
      });
    } catch (error: any) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, any> = {
      maintenance_due: Wrench,
      warranty_expiry: AlertTriangle,
      anomaly_detected: Zap,
      milestone_achieved: TrendingUp,
      system_info: Info
    };
    return icons[type] || Bell;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      info: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
      critical: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
    };
    return colors[severity] || colors.info;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <h3 className="text-xl font-bold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} new</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No notifications</p>
        </div>
      ) : (
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.notification_type);
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    !notification.is_read ? 'bg-accent/50 border-primary/50' : 'hover:bg-accent/30'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg h-fit ${getSeverityColor(notification.severity)}`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold">{notification.title}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </span>

                        {notification.action_url && (
                          <Button variant="link" size="sm" className="h-auto p-0">
                            View Details →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};
