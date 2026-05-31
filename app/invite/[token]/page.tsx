"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AcceptInvitePage() {
  const { token } = useParams();
  const router = useRouter();
  const [status, setStatus] = useState("Validando...");

  useEffect(() => {
    async function processar() {
      if (!token) return;

      // Busca o convite
      const { data, error } = await supabase
        .from("invitations")
        .select("group_id")
        .eq("token", token)
        .single();

      if (error || !data) {
        console.error("Erro na busca:", error);
        setStatus("❌ Convite inválido ou expirado.");
        return;
      }

      // Verifica sessão
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Adiciona ao grupo
      const { error: memberError } = await supabase
        .from("group_members")
        .insert({
          group_id: data.group_id,
          user_id: session.user.id,
        });

      if (memberError) {
        setStatus("✅ Você já é membro deste grupo.");
      } else {
        await supabase.from("invitations").delete().eq("token", token);
        setStatus("🎉 Bem-vinda ao grupo!");
      }
      setTimeout(() => router.push("/"), 2000);
    }
    processar();
  }, [token, router]);

  return (
    <main className="flex justify-center p-20">
      <h1>{status}</h1>
    </main>
  );
}