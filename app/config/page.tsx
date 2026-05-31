"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useGroup } from "@/hooks/useGroup";
import { InviteForm } from "@/components/InviteForm";

export default function Config() {
  // Hooks
  const router = useRouter();
  const { user } = useAuth();
  const { groupId, loading } = useGroup();

  // Estados
  const [nome, setNome] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [subindoFoto, setSubindoFoto] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const [membros, setMembros] = useState<
    { email: string; role: string; isMe: boolean }[]
  >([]);
  const [creating, setCreating] = useState(false);

  // Efeito: Carregar dados do perfil do usuário
  useEffect(() => {
    if (!user) return;
    setNome(user?.user_metadata?.nome || "");
    setAvatarUrl(user?.user_metadata?.avatar_url || "");
  }, [user]);

  // Efeito: Carregar membros do grupo com segurança
  useEffect(() => {
    if (!groupId || !user) return;

    async function carregarMembros() {
      const { data, error } = await supabase
        .from("group_members")
        .select("user_id, role")
        .eq("group_id", groupId);

      if (error) {
        console.error("Erro ao carregar membros:", error);
        return;
      }

      if (data) {
        // Mapeia os membros sem expor chaves administrativas no Client-side
        // O uso do "?" garante que o TypeScript não acuse erro no build da Vercel
        const listaMembros = data.map((m) => {
          const isMe = m.user_id === user?.id;
          return {
            email: isMe ? user?.email || "Você" : "Parceiro(a)",
            role: m.role,
            isMe,
          };
        });
        setMembros(listaMembros);
      }
    }
    carregarMembros();
  }, [groupId, user]);

  // Upload da Foto para o Supabase Storage
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;

    try {
      setSubindoFoto(true);
      setMensagem("Enviando foto...");

      const file = e.target.files[0];
      const fileExt = file.name.split(".").pop();
      // Gera um nome único por usuário usando timestamp e optional chaining
      const filePath = `${user?.id}-${Date.now()}.${fileExt}`;

      // 1. Faz o upload para o bucket público 'avatars'
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 2. Captura a URL pública da imagem
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3. Atualiza os metadados de autenticação do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setMensagem("Foto de perfil atualizada!");
    } catch (error: any) {
      console.error("Erro no upload:", error);
      setMensagem("Erro ao atualizar foto de perfil.");
    } finally {
      setSubindoFoto(false);
      setTimeout(() => setMensagem(null), 3000);
    }
  };

  // Salvar Alterações de Nome
  const salvarNome = async () => {
    if (!user) return;
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({
      data: { nome },
    });
    setSalvando(false);
    setMensagem(error ? "Erro ao salvar." : "Nome salvo!");
    setTimeout(() => setMensagem(null), 3000);
  };

  const sair = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

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
      {/* Cabeçalho */}
      <header className="header">
        <div className="header-top">
          <h2 className="header-title">Configurações</h2>
          <button className="btn-secondary" onClick={() => router.back()}>
            ← Voltar
          </button>
        </div>
      </header>

      {/* Mensagem Especial */}
      <div className="card" style={{ justifyContent: "center" }}>
        <span style={{ fontWeight: "bold" }}>TE AMOOOO MUITOOOOOO ❤️</span>
      </div>

      {/* Perfil do Usuário com Foto e Nome */}
      <div
        className="card"
        style={{ flexDirection: "column", alignItems: "center", gap: 16 }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div style={{ position: "relative" }}>
            <img
              src={
                avatarUrl ||
                "https://api.dicebear.com/7.x/fun-animations/svg?seed=heart"
              }
              alt="Sua foto de perfil"
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid var(--accent)",
                backgroundColor: "#fff",
              }}
            />
            <label
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                background: "var(--accent)",
                color: "white",
                borderRadius: "50%",
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 14,
                boxShadow: "0px 2px 4px rgba(0,0,0,0.2)",
              }}
              title="Mudar foto de perfil"
            >
              📷
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={subindoFoto}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <p style={{ margin: 0, opacity: 0.6, fontSize: 14 }}>{user?.email}</p>
        </div>

        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <input
            className="input-main"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Seu nome de exibição"
          />
          <button
            className="btn-add"
            onClick={salvarNome}
            disabled={salvando || subindoFoto}
          >
            {salvando ? "..." : "✓"}
          </button>
        </div>
        {mensagem && (
          <p
            style={{
              color: "var(--accent)",
              margin: 0,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {mensagem}
          </p>
        )}
      </div>

      {/* Gerenciamento de Grupo */}
      {loading ? (
        <p style={{ textAlign: "center", marginTop: "20px" }}>
          Carregando dados...
        </p>
      ) : !groupId ? (
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
        <>
          {/* Lista de Membros */}
          <div
            className="card"
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <h3 style={{ margin: 0 }}>Membros do grupo</h3>
            {membros.length === 0 ? (
              <p style={{ opacity: 0.5, fontSize: 14, margin: 0 }}>
                Carregando...
              </p>
            ) : (
              membros.map((m, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  <span
                    style={{
                      background: "var(--accent)",
                      color: "white",
                      borderRadius: "50%",
                      width: 28,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      flexShrink: 0,
                    }}
                  >
                    {m.isMe ? nome[0]?.toUpperCase() || "V" : "P"}
                  </span>
                  <span>{m.isMe ? `${nome || m.email} (Você)` : m.email}</span>
                  <span style={{ opacity: 0.5, fontSize: 12 }}>({m.role})</span>
                </div>
              ))
            )}
          </div>

          {/* Convite */}
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
        </>
      )}

      {/* Tema */}
      <div
        className="card"
        style={{ justifyContent: "space-between", alignItems: "center" }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontWeight: "bold" }}>Tema</span>
          <span style={{ opacity: 0.6, fontSize: 12 }}>
            Spiderman / Hello Kitty
          </span>
        </div>
        <button onClick={toggleTheme} className="btn-secondary">
          Trocar
        </button>
      </div>

      {/* Versão */}
      <div className="card" style={{ justifyContent: "space-between" }}>
        <span>Versão do App</span>
        <span>2.0.0</span>
      </div>

      {/* Logout */}
      <button
        onClick={sair}
        style={{
          width: "100%",
          padding: "14px",
          marginTop: 8,
          background: "transparent",
          border: "1px solid #ef4444",
          color: "#ef4444",
          borderRadius: "var(--radius)",
          cursor: "pointer",
          fontSize: 16,
        }}
      >
        Sair da conta
      </button>
    </main>
  );
}
