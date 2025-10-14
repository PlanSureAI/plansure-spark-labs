import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceUser {
  user_id: string;
  email: string;
  full_name: string | null;
  online_at: string;
}

interface RealtimeCollaborationOptions {
  workspaceId?: string;
  analysisId?: string;
  enabled?: boolean;
}

export const useRealtimeCollaboration = ({
  workspaceId,
  analysisId,
  enabled = true,
}: RealtimeCollaborationOptions) => {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const updatePresence = useCallback(async () => {
    if (!channel || !enabled) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single();

    await channel.track({
      user_id: user.id,
      email: profile?.email || user.email,
      full_name: profile?.full_name || null,
      online_at: new Date().toISOString(),
    });
  }, [channel, enabled]);

  useEffect(() => {
    if (!enabled || (!workspaceId && !analysisId)) return;

    const channelName = analysisId 
      ? `analysis:${analysisId}`
      : workspaceId 
      ? `workspace:${workspaceId}`
      : null;

    if (!channelName) return;

    const realtimeChannel = supabase.channel(channelName, {
      config: { presence: { key: "" } },
    });

    // Presence tracking
    realtimeChannel
      .on("presence", { event: "sync" }, () => {
        const state = realtimeChannel.presenceState();
        const users: PresenceUser[] = [];
        
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            users.push(presence);
          });
        });
        
        setPresenceUsers(users);
      })
      .on("presence", { event: "join" }, ({ newPresences }) => {
        console.log("User joined:", newPresences);
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        console.log("User left:", leftPresences);
      });

    // Subscribe to investment_analyses changes
    if (workspaceId) {
      realtimeChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "investment_analyses",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          console.log("Analysis updated:", payload);
          // Trigger a custom event for the UI to listen to
          window.dispatchEvent(
            new CustomEvent("analysis-updated", { detail: payload })
          );
        }
      );
    }

    if (analysisId) {
      realtimeChannel.on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "investment_analyses",
          filter: `id=eq.${analysisId}`,
        },
        (payload) => {
          console.log("Specific analysis updated:", payload);
          window.dispatchEvent(
            new CustomEvent("analysis-updated", { detail: payload })
          );
        }
      );
    }

    realtimeChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await updatePresence();
      }
    });

    setChannel(realtimeChannel);

    return () => {
      realtimeChannel.unsubscribe();
    };
  }, [workspaceId, analysisId, enabled, updatePresence]);

  const broadcastTyping = useCallback(
    async (isTyping: boolean) => {
      if (!channel) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await channel.send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: user.id,
          is_typing: isTyping,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [channel]
  );

  return {
    presenceUsers,
    broadcastTyping,
    isConnected: !!channel,
  };
};
