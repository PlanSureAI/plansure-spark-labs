import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Battery, 
  Thermometer, 
  Sun, 
  Activity,
  Plus,
  RefreshCw,
  WifiOff
} from "lucide-react";

interface SmartDeviceIntegrationProps {
  propertyId?: string;
}

export const SmartDeviceIntegration = ({ propertyId }: SmartDeviceIntegrationProps) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDevices();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('smart_devices_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'smart_devices'
      }, (payload) => {
        console.log('Device update:', payload);
        fetchDevices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [propertyId]);

  const fetchDevices = async () => {
    try {
      const { data, error } = await supabase
        .from('smart_devices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDevices(data || []);
    } catch (error: any) {
      console.error('Error fetching devices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncDevice = async (deviceId: string) => {
    toast({
      title: "Syncing Device",
      description: "Fetching latest energy data...",
    });
    
    // In production, this would trigger actual API calls to device APIs
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Sync Complete",
      description: "Device data updated successfully",
    });
  };

  const getDeviceIcon = (type: string) => {
    const icons: Record<string, any> = {
      'smart_meter': Zap,
      'battery': Battery,
      'heat_pump': Thermometer,
      'solar_inverter': Sun,
      'energy_monitor': Activity
    };
    const Icon = icons[type] || Zap;
    return <Icon className="w-6 h-6" />;
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading devices...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Smart Home Integration</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Connect Device
        </Button>
      </div>

      {devices.length === 0 ? (
        <Card className="p-8 text-center">
          <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Smart Devices Connected</h4>
          <p className="text-muted-foreground mb-4">
            Connect smart meters, batteries, and IoT devices for real-time energy monitoring
          </p>
          <Button>Connect Your First Device</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <Card key={device.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    {getDeviceIcon(device.device_type)}
                  </div>
                  <div>
                    <h4 className="font-bold">{device.device_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {device.manufacturer} {device.model}
                    </p>
                  </div>
                </div>
                <Badge variant={device.sync_status === 'active' ? 'default' : 'secondary'}>
                  {device.sync_status}
                </Badge>
              </div>

              {device.real_time_data && (
                <div className="space-y-3 mb-4">
                  {device.real_time_data.current_power && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Current Power</span>
                        <span className="font-semibold">{device.real_time_data.current_power} kW</span>
                      </div>
                    </div>
                  )}
                  
                  {device.real_time_data.battery_level !== undefined && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Battery Level</span>
                        <span className="font-semibold">{device.real_time_data.battery_level}%</span>
                      </div>
                      <Progress value={device.real_time_data.battery_level} className="h-2" />
                    </div>
                  )}

                  {device.real_time_data.daily_production && (
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Production</p>
                        <p className="font-semibold">{device.real_time_data.daily_production} kWh</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Consumption</p>
                        <p className="font-semibold">{device.real_time_data.daily_consumption} kWh</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => syncDevice(device.id)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Configure
                </Button>
              </div>

              {device.sync_status === 'error' && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 flex items-start gap-2">
                  <WifiOff className="w-4 h-4 text-destructive mt-0.5" />
                  <p className="text-sm text-destructive">Connection error. Check API credentials.</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
