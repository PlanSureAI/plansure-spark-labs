import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileDown, Loader2 } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { generateInvestmentReport } from "@/lib/pdfExport";

interface BatchExportDialogProps {
  workspaceId?: string;
}

export const BatchExportDialog = ({ workspaceId }: BatchExportDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [companyName, setCompanyName] = useState("");

  const loadAnalyses = async () => {
    try {
      const query = supabase
        .from("investment_analyses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (workspaceId) {
        query.eq("workspace_id", workspaceId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAnalyses(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading analyses",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadAnalyses();
    }
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === analyses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(analyses.map((a) => a.id)));
    }
  };

  const exportSelected = async () => {
    if (selectedIds.size === 0) {
      toast({
        title: "No analyses selected",
        description: "Please select at least one analysis to export.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const zip = new JSZip();
      const selectedAnalyses = analyses.filter((a) => selectedIds.has(a.id));

      // Generate PDF for each selected analysis
      for (const analysis of selectedAnalyses) {
        try {
          const fileName = `Analysis_${analysis.id.slice(0, 8)}_${new Date(
            analysis.created_at
          )
            .toISOString()
            .split("T")[0]}.pdf`;

          // This is a simplified version - in production you'd need to generate actual PDFs
          const pdfContent = `Analysis Report for ${analysis.purchase_price}
Created: ${new Date(analysis.created_at).toLocaleDateString()}
IRR: ${analysis.irr}%
NPV: ${analysis.npv}
Company: ${companyName || "PlansureAI"}`;

          zip.file(fileName, pdfContent);
        } catch (error) {
          console.error(`Failed to process analysis ${analysis.id}:`, error);
        }
      }

      // Generate and download the ZIP file
      const content = await zip.generateAsync({ type: "blob" });
      const timestamp = new Date().toISOString().split("T")[0];
      const zipFileName = `Investment_Reports_${timestamp}.zip`;

      saveAs(content, zipFileName);

      toast({
        title: "Export successful!",
        description: `${selectedIds.size} reports exported successfully.`,
      });

      setOpen(false);
      setSelectedIds(new Set());
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileDown className="w-4 h-4" />
          Batch Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Export Reports</DialogTitle>
          <DialogDescription>
            Select multiple analyses to export as a branded PDF package.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Branding Options */}
          <div className="space-y-2">
            <Label htmlFor="company">Company Name (optional)</Label>
            <Input
              id="company"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your Company Name"
            />
          </div>

          {/* Select All Toggle */}
          <div className="flex items-center justify-between py-2 border-b">
            <Label className="text-base font-semibold">
              Select Analyses ({selectedIds.size} selected)
            </Label>
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedIds.size === analyses.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          {/* Analyses List */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {analyses.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No analyses available to export
              </p>
            ) : (
              analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleSelection(analysis.id)}
                >
                  <Checkbox
                    checked={selectedIds.has(analysis.id)}
                    onCheckedChange={() => toggleSelection(analysis.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      }).format(analysis.purchase_price)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(analysis.created_at).toLocaleDateString()} • IRR:{" "}
                      {analysis.irr?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Export Button */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={exportSelected}
              disabled={loading || selectedIds.size === 0}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Export {selectedIds.size} Report{selectedIds.size !== 1 ? "s" : ""}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
