import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  MapPin, 
  Edit, 
  Trash2,
  Search,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddComplianceDialog } from "./AddComplianceDialog";

interface PropertiesListProps {
  properties: any[];
  tracking: any[];
  onRefresh: () => void;
}

export const PropertiesList = ({ properties, tracking, onRefresh }: PropertiesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [showAddCompliance, setShowAddCompliance] = useState(false);
  const { toast } = useToast();

  const getPropertyStatus = (propertyId: string) => {
    const propertyTracking = tracking.filter(t => t.property_id === propertyId);
    if (propertyTracking.length === 0) return "none";
    
    const hasRed = propertyTracking.some(t => t.status === 'red');
    const hasAmber = propertyTracking.some(t => t.status === 'amber');
    
    if (hasRed) return "red";
    if (hasAmber) return "amber";
    return "green";
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; variant: any }> = {
      green: { label: "Compliant", variant: "default" as const },
      amber: { label: "At Risk", variant: "secondary" as const },
      red: { label: "Overdue", variant: "destructive" as const },
      none: { label: "No Data", variant: "outline" as const },
    };
    
    const config = variants[status] || variants.none;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm("Are you sure you want to delete this property? This will also delete all associated compliance tracking.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;

      toast({
        title: "Property deleted",
        description: "The property has been removed from your portfolio.",
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error deleting property",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredProperties = properties.filter(p =>
    p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCompliance = (property: any) => {
    setSelectedProperty(property);
    setShowAddCompliance(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Property Portfolio</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm ? "No properties found matching your search." : "No properties in your portfolio yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProperties.map((property) => {
              const status = getPropertyStatus(property.id);
              const propertyTracking = tracking.filter(t => t.property_id === property.id);
              
              return (
                <Card key={property.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{property.address}</h3>
                        {getStatusBadge(status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {property.city}, {property.country}
                        </span>
                        <span>Type: {property.property_type}</span>
                        {property.size_sqft && <span>{property.size_sqft.toLocaleString()} sqft</span>}
                      </div>
                      
                      {propertyTracking.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm font-medium">Compliance Requirements:</p>
                          <div className="flex flex-wrap gap-2">
                            {propertyTracking.map((track) => (
                              <Badge 
                                key={track.id} 
                                variant={track.status === 'green' ? 'default' : track.status === 'amber' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {track.compliance.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddCompliance(property)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Track Compliance
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(property.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      <AddComplianceDialog
        open={showAddCompliance}
        onOpenChange={setShowAddCompliance}
        property={selectedProperty}
        onSuccess={onRefresh}
      />
    </>
  );
};
