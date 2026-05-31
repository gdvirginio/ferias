"use client";
import { useState, useEffect } from "react";
import { useTarefas } from "@/hooks/useTarefas";
import { useGroup } from "@/hooks/useGroup";
import { usePresence } from "@/hooks/usePresence";
import { useAuth } from "@/hooks/useAuth";
import { usePushManager } from "@/hooks/usePushManager";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Timer from "@/components/Timer";
import { Chat } from "@/components/Chat";
import { ReleaseModal } from "@/components/ReleaseModal";
import { SortableTaskCard } from "@/components/SortableTarefaItem";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

function Home() {
  const { user } = useAuth();
  const { groupId, loading: loadingGroup } = useGroup();
  const {
    tarefas,
    adicionarTarefa,
    alternarTarefa,
    deletarTarefa,
    editarTarefa,
  } = useTarefas(groupId);

  usePushManager(user?.id);
  const onlineUsers = usePresence(
    groupId,
    user ? { id: user.id, email: user.email! } : null,
  );

  const [localTarefas, setLocalTarefas] = useState<any[]>([]);
  const [badgeContador, setBadgeContador] = useState(0);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLocalTarefas(tarefas);
  }, [tarefas]);

  useEffect(() => {
    if (tarefas.length === 0 || !user || !groupId) return;
    const ultimoIdVisto = Number(
      localStorage.getItem(`ultimo_id_visto_${groupId}`) || 0,
    );
    const novasNaoVistas = tarefas.filter(
      (t) => t.id > ultimoIdVisto && t.user_id !== user.id && !t.feita,
    );
    setBadgeContador(novasNaoVistas.length);
  }, [tarefas, user, groupId]);

  useEffect(() => {
    if (tarefas.length === 0 || !groupId) return;
    const marcarComoLidas = () => {
      const maiorId = Math.max(...tarefas.map((t) => t.id));
      localStorage.setItem(`ultimo_id_visto_${groupId}`, maiorId.toString());
      setBadgeContador(0);
    };
    window.addEventListener("focus", marcarComoLidas);
    window.addEventListener("click", marcarComoLidas);
    return () => {
      window.removeEventListener("focus", marcarComoLidas);
      window.removeEventListener("click", marcarComoLidas);
    };
  }, [tarefas, groupId]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  useEffect(() => {
    if (!loading && !loadingGroup && !user) {
      router.push("/login");
    }
  }, [user, loading, loadingGroup]);

  // Sensores configurados para mobile (delay de 250ms evita conflito com scroll)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const others = onlineUsers.filter((u) => u.user_id !== user?.id);

  const handleAdicionar = async () => {
    if (!input.trim()) return;
    setAdicionando(true);
    setErro(null);
    try {
      await adicionarTarefa(input);
      setInput("");
    } catch {
      setErro("Não foi possível adicionar a tarefa. Tente novamente.");
    } finally {
      setAdicionando(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localTarefas.findIndex((t) => t.id === active.id);
    const newIndex = localTarefas.findIndex((t) => t.id === over.id);

    const novaLista = arrayMove(localTarefas, oldIndex, newIndex);
    setLocalTarefas(novaLista);

    const atualizacoes = novaLista.map((tarefa, index) => ({
      id: tarefa.id,
      ordem: index,
      group_id: groupId,
    }));

    await supabase.from("tarefas").upsert(atualizacoes);
  };

  if (loading || loadingGroup)
    return (
      <div className="loader-screen">
        <div className="spinner"></div>
      </div>
    );

  return (
    <main className="main-container">
      <Timer />
      <header className="header">
        <div className="header-top">
          <h2
            className="header-title"
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span>
              Nossos Planos para as <span>férias</span>
            </span>
            {badgeContador > 0 && (
              <span
                className="badge-notificacao"
                style={{
                  background: "var(--accent)",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 8px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  animation: "pulse 2s infinite",
                }}
              >
                {badgeContador}
              </span>
            )}
          </h2>
          <div className="header-actions">
            <ThemeSwitcher />
            <button
              className="btn-secondary"
              onClick={() => router.push("/config")}
            >
              ⚙️
            </button>
          </div>
        </div>
        <div className="header-presence">
          {others.length > 0 ? (
            others.map((u) => (
              <div key={u.user_id} className="presence-badge presence-online">
                <span className="presence-dot" />
                <span>{u.nome || u.email.split("@")[0]} está online</span>
              </div>
            ))
          ) : (
            <div className="presence-badge presence-offline">
              <span className="presence-dot" />
              <span>Só você por aqui</span>
            </div>
          )}
        </div>
      </header>
      {erro && (
        <div className="erro-banner">
          ⚠️ {erro}
          <button onClick={() => setErro(null)}>✕</button>
        </div>
      )}
      <div className="card">
        <input
          className="input-main"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="O que vamos fazer?"
          disabled={adicionando}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdicionar();
          }}
        />
        <button
          className="btn-add"
          onClick={handleAdicionar}
          disabled={adicionando}
          style={{ opacity: adicionando ? 0.6 : 1 }}
        >
          {adicionando ? "..." : "+"}
        </button>
      </div>
      {localTarefas.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🌹</span>
          <p>Nada por aqui!</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={localTarefas.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="task-list">
              {localTarefas.map((t) => (
                <SortableTaskCard
                  key={t.id}
                  t={t}
                  alternarTarefa={alternarTarefa}
                  editarTarefa={editarTarefa}
                  deletarTarefa={deletarTarefa}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <Chat groupId={groupId} user={user} />
      <ReleaseModal />
    </main>
  );
}

export default Home;
