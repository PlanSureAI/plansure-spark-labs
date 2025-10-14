import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const propertySchema = z.object({
  address: z.string().min(1, "Address is required"),
  property_type: z.string().min(1, "Property type is required"),
  city: z.string().min(1, "City is required"),
  postal_code: z.string().optional(),
  size_sqft: z.number().optional(),
});

interface AddPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const AddPropertyDialog = ({ open, onOpenChange, onSuccess }: AddPropertyDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    address: "",
    property_type: "",
    city: "",
    postal_code: "",
    size_sqft: "",
    state: "",
    country: "United Kingdom",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const validated = propertySchema.parse({
        ...formData,
        size_sqft: formData.size_sqft ? parseInt(formData.size_sqft) : undefined,
      });

      const { error } = await supabase.from("properties").insert([{
        user_id: user.id,
        address: validated.address,
        property_type: validated.property_type,
        city: validated.city,
        postal_code: formData.postal_code || null,
        size_sqft: formData.size_sqft ? parseInt(formData.size_sqft) : null,
        state: formData.state || null,
        country: formData.country,
      }]);

      if (error) throw error;

      toast({
        title: "Property added",
        description: "Property has been added to your portfolio successfully.",
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        address: "",
        property_type: "",
        city: "",
        postal_code: "",
        size_sqft: "",
        state: "",
        country: "United Kingdom",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error adding property",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 High Street"
                required
              />
            </div>

            <div>
              <Label htmlFor="property_type">Property Type *</Label>
              <Select
                value={formData.property_type}
                onValueChange={(value) => setFormData({ ...formData, property_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="new_build">New Build</SelectItem>
                  <SelectItem value="mixed_use">Mixed Use</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="London"
                required
              />
            </div>

            <div>
              <Label htmlFor="state">State/Region</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="England"
              />
            </div>

            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="SW1A 1AA"
              />
            </div>

            <div>
              <Label htmlFor="size_sqft">Size (sqft)</Label>
              <Input
                id="size_sqft"
                type="number"
                value={formData.size_sqft}
                onChange={(e) => setFormData({ ...formData, size_sqft: e.target.value })}
                placeholder="1500"
              />
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="United Kingdom"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
