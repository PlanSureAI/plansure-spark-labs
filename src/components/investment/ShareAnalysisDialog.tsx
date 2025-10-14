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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Share2, Copy, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ShareAnalysisDialogProps {
  analysisId: string;
  currentShareToken?: string | null;
  isShared?: boolean;
}

export const ShareAnalysisDialog = ({
  analysisId,
  currentShareToken,
  isShared: initialIsShared,
}: ShareAnalysisDialogProps) => {
  const { toast } = useToast();
  const [isShared, setIsShared] = useState(initialIsShared || false);
  const [shareToken, setShareToken] = useState(currentShareToken);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareUrl = shareToken
    ? `${window.location.origin}/share/${shareToken}`
    : "";

  const generateShareLink = async () => {
    setLoading(true);
    try {
      // Generate token using database function
      const { data: tokenData, error: tokenError } = await supabase.rpc(
        "generate_share_token"
      );

      if (tokenError) throw tokenError;

      // Update analysis with share token
      const { error: updateError } = await supabase
        .from("investment_analyses")
        .update({
          share_token: tokenData,
          is_shared: true,
          shared_at: new Date().toISOString(),
        })
        .eq("id", analysisId);

      if (updateError) throw updateError;

      setShareToken(tokenData);
      setIsShared(true);

      toast({
        title: "Share link created!",
        description: "You can now share this analysis with others.",
      });
    } catch (error: any) {
      toast({
        title: "Error creating share link",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSharing = async (enabled: boolean) => {
    setLoading(true);
    try {
      if (enabled && !shareToken) {
        await generateShareLink();
        return;
      }

      const { error } = await supabase
        .from("investment_analyses")
        .update({
          is_shared: enabled,
          shared_at: enabled ? new Date().toISOString() : null,
        })
        .eq("id", analysisId);

      if (error) throw error;

      setIsShared(enabled);

      toast({
        title: enabled ? "Sharing enabled" : "Sharing disabled",
        description: enabled
          ? "Anyone with the link can view this analysis."
          : "The share link is now inactive.",
      });
    } catch (error: any) {
      toast({
        title: "Error updating share settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const revokeAccess = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("investment_analyses")
        .update({
          share_token: null,
          is_shared: false,
          shared_at: null,
        })
        .eq("id", analysisId);

      if (error) throw error;

      setShareToken(null);
      setIsShared(false);

      toast({
        title: "Access revoked",
        description: "The share link has been permanently removed.",
      });
    } catch (error: any) {
      toast({
        title: "Error revoking access",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
          {isShared && <Badge variant="secondary" className="ml-1">Active</Badge>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Investment Analysis</DialogTitle>
          <DialogDescription>
            Create a secure link to share this analysis with stakeholders.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Enable/Disable Sharing Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Sharing</Label>
              <p className="text-xs text-muted-foreground">
                Anyone with the link can view this analysis
              </p>
            </div>
            <Switch
              checked={isShared}
              onCheckedChange={toggleSharing}
              disabled={loading}
            />
          </div>

          {/* Share Link Display */}
          {shareToken && (
            <>
              <div className="space-y-2">
                <Label htmlFor="share-link">Share Link</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-link"
                    value={shareUrl}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {isShared && (
                  <p className="text-xs text-muted-foreground">
                    Link is active and accessible to anyone
                  </p>
                )}
              </div>

              {/* Revoke Access Button */}
              <Button
                variant="destructive"
                size="sm"
                onClick={revokeAccess}
                disabled={loading}
                className="w-full gap-2"
              >
                <X className="w-4 h-4" />
                Revoke Access & Delete Link
              </Button>
            </>
          )}

          {/* Generate Link Button (if no token exists) */}
          {!shareToken && (
            <Button
              onClick={generateShareLink}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Generating..." : "Generate Share Link"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
