import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface PresenceUser {
  user_id: string;
  email: string;
  full_name: string | null;
  online_at: string;
}

interface TypingUser {
  user_id: string;
  email: string;
  timestamp: string;
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
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
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

    // Use scoped channel names as recommended
    const channelName = analysisId 
      ? `workspace:${workspaceId}:analysis:${analysisId}`
      : workspaceId 
      ? `workspace:${workspaceId}:investment_analyses`
      : null;

    if (!channelName) return;

    const realtimeChannel = supabase.channel(channelName, {
      config: { 
        presence: { key: "" },
        broadcast: { self: false } // Don't receive own broadcasts
      },
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

    // Subscribe to investment_analyses changes with conflict resolution
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
          
          // Implement last-write-wins conflict resolution
          const eventData = {
            ...payload,
            timestamp: new Date().toISOString(),
          };
          
          window.dispatchEvent(
            new CustomEvent("analysis-updated", { detail: eventData })
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
          
          const eventData = {
            ...payload,
            timestamp: new Date().toISOString(),
          };
          
          window.dispatchEvent(
            new CustomEvent("analysis-updated", { detail: eventData })
          );
        }
      );
    }

    // Listen for typing indicators
    realtimeChannel.on(
      "broadcast",
      { event: "user_typing" },
      ({ payload }) => {
        console.log("User typing:", payload);
        
        setTypingUsers((prev) => {
          const filtered = prev.filter(u => u.user_id !== payload.user_id);
          
          if (payload.is_typing) {
            return [...filtered, {
              user_id: payload.user_id,
              email: payload.email,
              timestamp: payload.timestamp,
            }];
          }
          
          return filtered;
        });

        // Auto-clear typing indicator after 3 seconds
        setTimeout(() => {
          setTypingUsers((prev) => 
            prev.filter(u => u.user_id !== payload.user_id)
          );
        }, 3000);
      }
    );

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

      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", user.id)
        .single();

      await channel.send({
        type: "broadcast",
        event: "user_typing",
        payload: {
          user_id: user.id,
          email: profile?.email || user.email,
          is_typing: isTyping,
          timestamp: new Date().toISOString(),
        },
      });
    },
    [channel]
  );

  return {
    presenceUsers,
    typingUsers,
    broadcastTyping,
    isConnected: !!channel,
  };
};
