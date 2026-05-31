import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserPresence = {
  user_id: string;
  email: string;
  online_at: string;
};

export function usePresence(
  groupId: string | null,
  currentUser: { id: string; email: string } | null,
) {
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);

  useEffect(() => {
    if (!groupId || !currentUser) return;

    const channel = supabase.channel(`group:${groupId}`, {
      config: { presence: { key: currentUser.id } },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<UserPresence>();
        const users = Object.values(state).flat();
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: currentUser.id,
            email: currentUser.email,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, currentUser?.id]);

  return onlineUsers;
}