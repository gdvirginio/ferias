import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Mensagem {
  id: number;
  group_id: string;
  user_id: string;
  nome_usuario: string;
  conteudo: string;
  criado_at: string;
  avatar_url: string | null; // 1. Adicionado aqui para o TypeScript aceitar a foto do banco
}

export function useChat(groupId: string | null, userId: string | undefined) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);

  const carregarMensagens = useCallback(async () => {
    if (!groupId) return;
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("group_id", groupId)
      .order("criado_at", { ascending: true });

    if (error) console.error("Erro ao carregar chat:", error);
    else setMensagens(data || []);
  }, [groupId]);

  // 2. Adicionado o terceiro parâmetro 'avatarUrl' na assinatura da função
  const enviarMensagem = async (
    texto: string,
    nomeUsuario: string,
    avatarUrl: string,
  ) => {
    if (!texto.trim() || !groupId || !userId) return;

    await supabase.from("messages").insert([
      {
        group_id: groupId,
        user_id: userId,
        nome_usuario: nomeUsuario,
        conteudo: texto,
        avatar_url: avatarUrl, // 3. Agora o Supabase vai receber e gravar a URL da foto!
      },
    ]);
  };

  useEffect(() => {
    carregarMensagens();

    if (!groupId) return;

    const canal = supabase
      .channel(`chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          setMensagens((prev) => [...prev, payload.new as Mensagem]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [groupId, carregarMensagens]);

  return { mensagens, enviarMensagem };
}