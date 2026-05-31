"use client";
import { useState, useEffect } from "react";
import { useTarefas } from "@/hooks/useTarefas";
import { useGroup } from "@/hooks/useGroup";
import { usePresence } from "@/hooks/usePresence";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Timer from "@/components/Timer";
import { InviteForm } from "@/components/InviteForm";

export default function Home() {
  const { user } = useAuth();
  const { groupId, loading: loadingGroup } = useGroup();
  const {
    tarefas,
    adicionarTarefa,
    alternarTarefa,
    deletarTarefa,
    editarTarefa,
  } = useTarefas(groupId);
  const onlineUsers = usePresence(
    groupId,
    user ? { id: user.id, email: user.email! } : null,
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  useEffect(() => {
    if (!loading && !loadingGroup && !user) {
      router.push("/login");
    }
  }, [user, loading, loadingGroup]);

  const others = onlineUsers.filter((u) => u.user_id !== user?.id);

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
          <h2 className="header-title">
            Nossos Planos para as <span>férias</span>
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
                <span className="presence-dot online" />
                <span>{u.email} está online</span>
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

      <div className="card">
        <input
          className="input-main"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="O que vamos fazer?"
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              adicionarTarefa(input);
              setInput("");
            }
          }}
        />
        <button
          className="btn-add"
          onClick={() => {
            if (input.trim()) {
              adicionarTarefa(input);
              setInput("");
            }
          }}
        >
          +
        </button>
      </div>

      {tarefas.length === 0 ? (
        <div className="empty-state">
          <span className="emoji">🌹</span>
          <p>Nada por aqui!</p>
        </div>
      ) : (
        <ul className="task-list">
          {tarefas.map((t) => (
            <li
              key={t.id}
              className="task-card"
              style={{ opacity: t.feita ? 0.6 : 1 }}
            >
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={t.feita}
                onChange={() => alternarTarefa(t.id, t.feita)}
              />
              <input
                className="input-main"
                value={t.conteudo}
                onChange={(e) => editarTarefa(t.id, e.target.value)}
                style={{
                  textDecoration: t.feita ? "line-through" : "none",
                  fontWeight: 500,
                }}
              />
              <button
                className="btn-delete"
                onClick={() => deletarTarefa(t.id)}
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}