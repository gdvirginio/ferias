import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Tarefa {
  id: number;
  conteudo: string;
  feita: boolean;
  user_id: string;
  group_id: string;
  ordem: number;
}

export function useTarefas(groupId: string | null) {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);

  const carregarTarefas = useCallback(async () => {
    if (!groupId) return;
    const { data, error } = await supabase
      .from("tarefas")
      .select("*")
      .eq("group_id", groupId)
      .order("ordem", { ascending: true }); // Atualizado para ordenar pelo drag and drop
    if (error) console.error("Erro:", error);
    else setTarefas(data || []);
  }, [groupId]);

  const adicionarTarefa = async (texto: string) => {
    if (!texto.trim() || !groupId) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Salva a nova tarefa no final da lista usando tarefas.length
    await supabase.from("tarefas").insert([
      {
        conteudo: texto,
        feita: false,
        user_id: user.id,
        group_id: groupId,
        ordem: tarefas.length,
      },
    ]);

    // Dispara a chamada da API de notificação de forma limpa e isolada
    fetch("/api/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId,
        senderId: user.id,
        senderName: user.user_metadata?.nome || "Seu amor",
        conteudoTarefa: texto, // Corrigido de conteudoTarefa para texto
      }),
    }).catch((err) => console.error("Erro ao enviar push:", err));
  };

  const alternarTarefa = async (id: number, statusAtual: boolean) => {
    await supabase.from("tarefas").update({ feita: !statusAtual }).eq("id", id);
  };

  const editarTarefa = async (id: number, novoConteudo: string) => {
    await supabase
      .from("tarefas")
      .update({ conteudo: novoConteudo })
      .eq("id", id);
  };

  const deletarTarefa = async (id: number) => {
    await supabase.from("tarefas").delete().eq("id", id);
  };

  useEffect(() => {
    carregarTarefas();
    const canal = supabase
      .channel("tarefas-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tarefas" },
        () => {
          carregarTarefas();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [carregarTarefas]);

  return {
    tarefas,
    adicionarTarefa,
    alternarTarefa,
    editarTarefa,
    deletarTarefa,
  };
}
