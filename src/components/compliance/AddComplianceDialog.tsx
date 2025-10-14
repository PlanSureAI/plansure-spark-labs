import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const trackingSchema = z.object({
  compliance_id: z.string().min(1, "Compliance requirement is required"),
  status: z.enum(["green", "amber", "red"]),
  next_deadline: z.string().min(1, "Deadline is required"),
  last_audit_date: z.string().optional(),
  notes: z.string().optional(),
});

interface AddComplianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
  onSuccess: () => void;
}

export const AddComplianceDialog = ({ open, onOpenChange, property, onSuccess }: AddComplianceDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    compliance_id: "",
    status: "green" as "green" | "amber" | "red",
    next_deadline: "",
    last_audit_date: "",
    notes: "",
  });

  useEffect(() => {
    if (open) {
      loadRequirements();
    }
  }, [open]);

  const loadRequirements = async () => {
    try {
      const { data, error } = await supabase
        .from("compliance_requirements")
        .select("*")
        .order("name");

      if (error) throw error;
      setRequirements(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading requirements",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    setIsSubmitting(true);
    try {
      const validated = trackingSchema.parse(formData);

      const { error } = await supabase.from("compliance_tracking").insert([{
        property_id: property.id,
        compliance_id: validated.compliance_id,
        status: validated.status,
        next_deadline: validated.next_deadline,
        last_audit_date: validated.last_audit_date || null,
        notes: validated.notes || null,
      }]);

      if (error) throw error;

      toast({
        title: "Compliance tracking added",
        description: "Compliance requirement has been added to this property.",
      });

      onSuccess();
      onOpenChange(false);
      setFormData({
        compliance_id: "",
        status: "green",
        next_deadline: "",
        last_audit_date: "",
        notes: "",
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
          title: "Error adding compliance tracking",
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            Track Compliance for {property?.address}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="compliance_id">Compliance Requirement *</Label>
            <Select
              value={formData.compliance_id}
              onValueChange={(value) => setFormData({ ...formData, compliance_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select requirement" />
              </SelectTrigger>
              <SelectContent>
                {requirements.map((req) => (
                  <SelectItem key={req.id} value={req.id}>
                    {req.name} - {req.jurisdiction}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Compliance Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="green">Compliant (Green)</SelectItem>
                <SelectItem value="amber">At Risk (Amber)</SelectItem>
                <SelectItem value="red">Overdue (Red)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="next_deadline">Next Deadline *</Label>
              <Input
                id="next_deadline"
                type="date"
                value={formData.next_deadline}
                onChange={(e) => setFormData({ ...formData, next_deadline: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="last_audit_date">Last Audit Date</Label>
              <Input
                id="last_audit_date"
                type="date"
                value={formData.last_audit_date}
                onChange={(e) => setFormData({ ...formData, last_audit_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any relevant notes about this compliance requirement..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Tracking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
