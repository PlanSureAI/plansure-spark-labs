import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp, FileText, Calendar, User, Download } from "lucide-react";
import { format } from "date-fns";

interface AuditEntry {
  changed_at: string;
  changed_by: string;
  changes: Record<string, { old: any; new: any }>;
}

interface UserInfo {
  id: string;
  full_name: string | null;
  email: string;
}

interface AuditTrailViewerProps {
  trackingId: string;
  complianceId: string;
}

export const AuditTrailViewer = ({ trackingId, complianceId }: AuditTrailViewerProps) => {
  const [auditHistory, setAuditHistory] = useState<AuditEntry[]>([]);
  const [users, setUsers] = useState<Record<string, UserInfo>>({});
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchAuditHistory();
  }, [trackingId]);

  const fetchAuditHistory = async () => {
    try {
      setLoading(true);

      // Fetch compliance tracking with change history
      const { data: trackingData, error: trackingError } = await supabase
        .from("compliance_tracking")
        .select("change_history, last_updated_by")
        .eq("id", trackingId)
        .single();

      if (trackingError) throw trackingError;

      const history: AuditEntry[] = Array.isArray(trackingData?.change_history) 
        ? (trackingData.change_history as unknown as AuditEntry[])
        : [];
      setAuditHistory(history);

      // Extract unique user IDs
      const userIds = new Set<string>();
      history.forEach((entry) => {
        if (entry.changed_by) userIds.add(entry.changed_by);
      });
      if (trackingData?.last_updated_by) {
        userIds.add(trackingData.last_updated_by);
      }

      // Fetch user information
      if (userIds.size > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", Array.from(userIds));

        if (profilesError) throw profilesError;

        const usersMap: Record<string, UserInfo> = {};
        profilesData?.forEach((profile) => {
          usersMap[profile.id] = profile;
        });
        setUsers(usersMap);
      }
    } catch (error: any) {
      console.error("Error fetching audit history:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const getUserDisplay = (userId: string) => {
    const user = users[userId];
    if (!user) return userId;
    return user.full_name || user.email || userId;
  };

  const formatFieldName = (field: string) => {
    return field
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return "None";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) {
      if (value.length === 0) return "None";
      return `${value.length} item(s)`;
    }
    if (value instanceof Date || !isNaN(Date.parse(value))) {
      try {
        return format(new Date(value), "PPP");
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      green: "default",
      amber: "secondary",
      red: "destructive",
    };
    return variants[status] || "outline";
  };

  const handleDownloadDocument = async (docUrl: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("compliance-documents")
        .createSignedUrl(docUrl, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (error: any) {
      console.error("Error downloading document:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (auditHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No changes recorded yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Audit Trail ({auditHistory.length} changes)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {auditHistory
              .slice()
              .reverse()
              .map((entry, idx) => {
                const actualIndex = auditHistory.length - 1 - idx;
                const isExpanded = expandedIndex === actualIndex;

                return (
                  <Card key={actualIndex} className="border-l-4 border-l-primary/30">
                    <CardContent className="p-3">
                      <div
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => toggleExpanded(actualIndex)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {format(new Date(entry.changed_at), "PPp")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{getUserDisplay(entry.changed_by)}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t space-y-2">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            Changes Made:
                          </p>
                          {Object.entries(entry.changes).map(([field, change]) => (
                            <div key={field} className="text-sm space-y-1">
                              <p className="font-medium">{formatFieldName(field)}</p>

                              {/* Special handling for status */}
                              {field === "status" && (
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant={getStatusBadge(change.old)}>
                                    {change.old}
                                  </Badge>
                                  <span>→</span>
                                  <Badge variant={getStatusBadge(change.new)}>
                                    {change.new}
                                  </Badge>
                                </div>
                              )}

                              {/* Special handling for document_urls */}
                              {field === "document_urls" && (
                                <div className="space-y-1">
                                  {Array.isArray(change.new) && change.new.length > 0 ? (
                                    change.new.map((url: string, i: number) => (
                                      <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7"
                                        onClick={() => handleDownloadDocument(url)}
                                      >
                                        <Download className="w-3 h-3 mr-1" />
                                        {url.split("/").pop()}
                                      </Button>
                                    ))
                                  ) : (
                                    <p className="text-xs text-muted-foreground">
                                      No documents
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Default handling for other fields */}
                              {field !== "status" && field !== "document_urls" && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span className="line-through">{formatValue(change.old)}</span>
                                  <span>→</span>
                                  <span className="font-medium text-foreground">
                                    {formatValue(change.new)}
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
