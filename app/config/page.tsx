"use client";
import { useRouter } from "next/navigation";
import { useGroup } from "@/hooks/useGroup";
import { InviteForm } from "@/components/InviteForm";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Config() {
  const router = useRouter();
  const { groupId, loading } = useGroup();
  const [creating, setCreating] = useState(false);

  const toggleTheme = () => {
    const currentTheme = document.documentElement.className;
    const newTheme = currentTheme === "pink" ? "" : "pink";
    document.documentElement.className = newTheme;
    localStorage.setItem("theme", newTheme);
  };

  async function criarMeuGrupo() {
    setCreating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({ name: "Nosso Espaço", created_by: session.user.id })
        .select()
        .single();

      // Se der erro, ele vai te mostrar o motivo exato na tela agora
      if (groupError) {
        alert("Erro no banco: " + groupError.message);
        setCreating(false);
        return;
      }

      if (group) {
        const { error: memberError } = await supabase
          .from("group_members")
          .insert({
            group_id: group.id,
            user_id: session.user.id,
            role: "owner",
          });

        if (memberError) {
          alert("Erro ao adicionar membro: " + memberError.message);
          setCreating(false);
          return;
        }

        window.location.reload();
      }
    } catch (error: any) {
      alert("Erro desconhecido: " + error.message);
      setCreating(false);
    }
  }

  return (
    <main className="main-container">
      <button
        onClick={() => router.back()}
        className="btn-secondary"
        style={{ marginBottom: "20px" }}
      >
        ← Voltar
      </button>

      <h1>Configurações</h1>

      <div className="card" style={{ justifyContent: "center" }}>
        <span style={{ fontWeight: "bold" }}>TE AMOOOO MUITOOOOOO ❤️</span>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Carregando dados...
        </p>
      ) : !groupId ? (
        // NOVO CARD DE CRIAR GRUPO (Padrão do App)
        <div
          className="card"
          style={{ justifyContent: "space-between", alignItems: "center" }}
        >
          <span>Nosso Espaço (Inativo)</span>
          <button
            onClick={criarMeuGrupo}
            className="btn-secondary"
            disabled={creating}
          >
            {creating ? "Criando..." : "Criar Grupo"}
          </button>
        </div>
      ) : (
        // CARD DE CONVITE (Aparece só quando o grupo já existe)
        <div
          className="card"
          style={{
            flexDirection: "column",
            alignItems: "stretch",
            gap: "10px",
          }}
        >
          <h3 style={{ margin: 0 }}>Dividir Tarefas</h3>
          <p style={{ fontSize: "0.9rem", opacity: 0.8, margin: 0 }}>
            Gere um link para que sua parceira entre no seu grupo.
          </p>
          <InviteForm groupId={groupId} />
        </div>
      )}

      <div
        className="card"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <span>Tema (Spiderman / Hello Kitty)</span>
        <button onClick={toggleTheme} className="btn-secondary">
          Trocar
        </button>
      </div>

      <div className="card" style={{ justifyContent: "space-between" }}>
        <span>Versão do App</span>
        <span>1.0.0</span>
      </div>
    </main>
  );
}
