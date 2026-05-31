import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useGroup() {
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarGrupo() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id)
        .maybeSingle();

      setGroupId(data?.group_id ?? null);
      setLoading(false);
    }

    buscarGrupo();
  }, []);

  return { groupId, loading };
}
