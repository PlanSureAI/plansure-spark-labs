import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { CalendarIcon, Upload, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Property {
  id: string;
  address: string;
}

interface ComplianceRequirement {
  id: string;
  name: string;
  jurisdiction: string;
  description: string | null;
}

interface ComplianceTracking {
  id?: string;
  compliance_id: string;
  status: "green" | "amber" | "red";
  last_audit_date: Date | null;
  next_deadline: Date;
  notes: string;
  document_urls: string[];
}

interface ManageComplianceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
  onSuccess: () => void;
}

export const ManageComplianceDialog = ({ open, onOpenChange, property, onSuccess }: ManageComplianceDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([]);
  const [existingTracking, setExistingTracking] = useState<Record<string, ComplianceTracking>>({});
  const [selectedStandards, setSelectedStandards] = useState<Set<string>>(new Set());
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open && property) {
      loadComplianceData();
    }
  }, [open, property]);

  const loadComplianceData = async () => {
    if (!property) return;

    setIsLoading(true);
    try {
      // Load all compliance requirements
      const { data: reqData, error: reqError } = await supabase
        .from("compliance_requirements")
        .select("*")
        .order("name");

      if (reqError) throw reqError;
      setRequirements(reqData || []);

      // Load existing tracking for this property
      const { data: trackingData, error: trackError } = await supabase
        .from("compliance_tracking")
        .select("*")
        .eq("property_id", property.id);

      if (trackError) throw trackError;

      const trackingMap: Record<string, ComplianceTracking> = {};
      const selected = new Set<string>();

      trackingData?.forEach((track) => {
        trackingMap[track.compliance_id] = {
          id: track.id,
          compliance_id: track.compliance_id,
          status: (track.status || "amber") as "green" | "amber" | "red",
          last_audit_date: track.last_audit_date ? new Date(track.last_audit_date) : null,
          next_deadline: new Date(track.next_deadline),
          notes: track.notes || "",
          document_urls: track.document_urls || [],
        };
        selected.add(track.compliance_id);
      });

      setExistingTracking(trackingMap);
      setSelectedStandards(selected);
    } catch (error: any) {
      toast({
        title: "Error loading compliance data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStandard = (complianceId: string) => {
    const newSelected = new Set(selectedStandards);
    if (newSelected.has(complianceId)) {
      newSelected.delete(complianceId);
      const newTracking = { ...existingTracking };
      delete newTracking[complianceId];
      setExistingTracking(newTracking);
    } else {
      newSelected.add(complianceId);
      if (!existingTracking[complianceId]) {
        setExistingTracking({
          ...existingTracking,
          [complianceId]: {
            compliance_id: complianceId,
            status: "amber",
            last_audit_date: null,
            next_deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            notes: "",
            document_urls: [],
          },
        });
      }
    }
    setSelectedStandards(newSelected);
  };

  const updateTracking = (complianceId: string, updates: Partial<ComplianceTracking>) => {
    setExistingTracking({
      ...existingTracking,
      [complianceId]: {
        ...existingTracking[complianceId],
        ...updates,
      },
    });
  };

  const handleFileUpload = async (complianceId: string, files: FileList | null) => {
    if (!files || files.length === 0 || !user || !property) return;

    setUploadingFiles({ ...uploadingFiles, [complianceId]: true });

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${property.id}/${complianceId}/${Date.now()}_${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("compliance-documents")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        uploadedUrls.push(fileName);
      }

      const currentUrls = existingTracking[complianceId]?.document_urls || [];
      updateTracking(complianceId, {
        document_urls: [...currentUrls, ...uploadedUrls],
      });

      toast({
        title: "Files uploaded",
        description: `${uploadedUrls.length} file(s) uploaded successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Upload error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingFiles({ ...uploadingFiles, [complianceId]: false });
    }
  };

  const removeDocument = async (complianceId: string, docUrl: string) => {
    try {
      const { error } = await supabase.storage
        .from("compliance-documents")
        .remove([docUrl]);

      if (error) throw error;

      const currentUrls = existingTracking[complianceId]?.document_urls || [];
      updateTracking(complianceId, {
        document_urls: currentUrls.filter((url) => url !== docUrl),
      });

      toast({
        title: "Document removed",
        description: "Document deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error removing document",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!property || !user) return;

    setIsLoading(true);
    try {
      // Delete tracking for unselected standards
      const toDelete = Object.keys(existingTracking).filter(
        (id) => !selectedStandards.has(id) && existingTracking[id].id
      );

      if (toDelete.length > 0) {
        const deleteIds = toDelete.map((id) => existingTracking[id].id).filter(Boolean);
        const { error: deleteError } = await supabase
          .from("compliance_tracking")
          .delete()
          .in("id", deleteIds);

        if (deleteError) throw deleteError;
      }

      // Upsert tracking for selected standards
      const trackingRecords = Array.from(selectedStandards).map((complianceId) => {
        const tracking = existingTracking[complianceId];
        return {
          id: tracking.id,
          property_id: property.id,
          compliance_id: complianceId,
          status: tracking.status,
          last_audit_date: tracking.last_audit_date?.toISOString().split("T")[0] || null,
          next_deadline: tracking.next_deadline.toISOString().split("T")[0],
          notes: tracking.notes,
          document_urls: tracking.document_urls,
          last_updated_by: user.id,
        };
      });

      const { error: upsertError } = await supabase
        .from("compliance_tracking")
        .upsert(trackingRecords, { onConflict: "id" });

      if (upsertError) throw upsertError;

      toast({
        title: "Compliance updated",
        description: "Compliance tracking records saved successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error saving compliance",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-500";
      case "amber":
        return "bg-amber-500";
      case "red":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Compliance - {property?.address}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Select Standards */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Select Compliance Standards</h3>
            <div className="grid gap-2">
              {requirements.map((req) => (
                <Card
                  key={req.id}
                  className={cn(
                    "cursor-pointer transition-all",
                    selectedStandards.has(req.id) && "ring-2 ring-primary"
                  )}
                  onClick={() => toggleStandard(req.id)}
                >
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{req.name}</span>
                      {selectedStandards.has(req.id) && (
                        <Badge variant="default">Selected</Badge>
                      )}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {req.jurisdiction} - {req.description}
                    </p>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Compliance Details */}
          {Array.from(selectedStandards).map((complianceId) => {
            const requirement = requirements.find((r) => r.id === complianceId);
            const tracking = existingTracking[complianceId];
            if (!requirement || !tracking) return null;

            return (
              <Card key={complianceId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {requirement.name}
                    <Badge className={getStatusColor(tracking.status)}>
                      {tracking.status.toUpperCase()}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status */}
                  <div>
                    <Label>Compliance Status</Label>
                    <Select
                      value={tracking.status}
                      onValueChange={(value: "green" | "amber" | "red") =>
                        updateTracking(complianceId, { status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="green">Green - Compliant</SelectItem>
                        <SelectItem value="amber">Amber - At Risk</SelectItem>
                        <SelectItem value="red">Red - Non-Compliant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dates */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Last Audit Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {tracking.last_audit_date
                              ? format(tracking.last_audit_date, "PPP")
                              : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={tracking.last_audit_date || undefined}
                            onSelect={(date) =>
                              updateTracking(complianceId, { last_audit_date: date || null })
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>Next Deadline *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(tracking.next_deadline, "PPP")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={tracking.next_deadline}
                            onSelect={(date) =>
                              date && updateTracking(complianceId, { next_deadline: date })
                            }
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label>Notes</Label>
                    <Textarea
                      value={tracking.notes}
                      onChange={(e) =>
                        updateTracking(complianceId, { notes: e.target.value })
                      }
                      placeholder="Enter compliance notes..."
                      rows={3}
                    />
                  </div>

                  {/* Document Upload */}
                  <div>
                    <Label>Compliance Documents</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.jpg,.jpeg,.png,.webp,.docx"
                          onChange={(e) => handleFileUpload(complianceId, e.target.files)}
                          className="hidden"
                          id={`file-upload-${complianceId}`}
                          disabled={uploadingFiles[complianceId]}
                        />
                        <label htmlFor={`file-upload-${complianceId}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={uploadingFiles[complianceId]}
                            asChild
                          >
                            <span>
                              <Upload className="mr-2 h-4 w-4" />
                              {uploadingFiles[complianceId] ? "Uploading..." : "Upload Documents"}
                            </span>
                          </Button>
                        </label>
                      </div>

                      {/* Document List */}
                      {tracking.document_urls.length > 0 && (
                        <div className="space-y-1">
                          {tracking.document_urls.map((url, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-muted rounded"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm truncate">
                                  {url.split("/").pop()}
                                </span>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeDocument(complianceId, url)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading || selectedStandards.size === 0}>
              {isLoading ? "Saving..." : "Save Compliance Data"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
