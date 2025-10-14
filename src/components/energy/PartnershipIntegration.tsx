import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Landmark, 
  Award, 
  FlaskConical,
  Link2,
  Settings,
  Plus
} from "lucide-react";

interface PartnershipIntegrationProps {
  partnerships: any[];
  workspaceId?: string;
}

export const PartnershipIntegration = ({ partnerships, workspaceId }: PartnershipIntegrationProps) => {
  const getPartnerIcon = (type: string) => {
    const icons: Record<string, any> = {
      utility: Building2,
      government: Landmark,
      certification_body: Award,
      research: FlaskConical
    };
    return icons[type] || Building2;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-600',
      pending: 'bg-amber-600',
      completed: 'bg-blue-600',
      terminated: 'bg-red-600'
    };
    return colors[status] || 'bg-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Partnership & Pilot Programs</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Partnership
        </Button>
      </div>

      {partnerships.length === 0 ? (
        <Card className="p-8 text-center">
          <Link2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="text-lg font-semibold mb-2">No Active Partnerships</h4>
          <p className="text-muted-foreground mb-4">
            Connect with utilities, government programs, or certification bodies for enhanced collaboration
          </p>
          <Button>Explore Partnerships</Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {partnerships.map((partnership) => {
            const Icon = getPartnerIcon(partnership.partner_type);
            
            return (
              <Card key={partnership.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{partnership.partner_name}</h4>
                      <p className="text-sm text-muted-foreground capitalize">
                        {partnership.partner_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(partnership.partnership_status)}`} />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={partnership.partnership_status === 'active' ? 'default' : 'secondary'}>
                      {partnership.partnership_status}
                    </Badge>
                  </div>

                  {partnership.data_sharing_enabled && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Data Sharing</span>
                      <Badge variant="outline">Enabled</Badge>
                    </div>
                  )}

                  {partnership.start_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Start Date</span>
                      <span>{new Date(partnership.start_date).toLocaleDateString()}</span>
                    </div>
                  )}

                  {partnership.end_date && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">End Date</span>
                      <span>{new Date(partnership.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {partnership.api_integration_details && (
                  <div className="mb-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Link2 className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">API Integration</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Connected to {partnership.api_integration_details.endpoint_count || 0} endpoints
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <FlaskConical className="w-8 h-8 text-primary mt-1" />
          <div className="flex-1">
            <h4 className="font-bold mb-2">Featured Partnership Opportunity</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Join our pilot program with Octopus Energy for zero energy bill guarantees. 
              Early participants receive enhanced support and preferential contract terms.
            </p>
            <Button>Learn More</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
