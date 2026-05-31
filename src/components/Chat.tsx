"use client";

import { useState, useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";

export function Chat({ groupId, user }: { groupId: string | null; user: any }) {
  const { mensagens, enviarMensagem } = useChat(groupId, user?.id);
  const [input, setInput] = useState("");
  const [aberto, setAberto] = useState(false);
  const [naoLidas, setNaoLidas] = useState(0);
  const mensagensEndRef = useRef<HTMLDivElement>(null);

  const nomeUsuario =
    user?.user_metadata?.nome || user?.email?.split("@")[0] || "Seu amor";

  // Captura garantida do avatar (Provado pelos logs que funciona!)
  const avatarUsuario =
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture ||
    user?.identities?.[0]?.identity_data?.avatar_url ||
    user?.identities?.[0]?.identity_data?.picture ||
    "";

  // Evita o erro de chaves duplicadas no console filtrando IDs repetidos
  const mensagensUnicas = mensagens.filter(
    (m, index, self) => self.findIndex((t) => t.id === m.id) === index,
  );

  const handleEnviar = async () => {
    if (!input.trim()) return;
    // Disparando os 3 parâmetros obrigatórios para o hook
    await enviarMensagem(input, nomeUsuario, avatarUsuario);
    setInput("");
  };

  useEffect(() => {
    if (!aberto && mensagens.length > 0) {
      const ultimaMensagem = mensagens[mensagens.length - 1];
      if (ultimaMensagem.user_id !== user?.id) {
        setNaoLidas((prev) => prev + 1);
      }
    }
  }, [mensagens, aberto, user?.id]);

  useEffect(() => {
    if (aberto) {
      mensagensEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setNaoLidas(0);
    }
  }, [mensagens, aberto]);

  if (!aberto) {
    return (
      <button
        className="btn-secondary"
        onClick={() => {
          setAberto(true);
          setNaoLidas(0);
        }}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          borderRadius: "50%",
          width: "56px",
          height: "56px",
          fontSize: "24px",
          boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          zIndex: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          border: "2px solid var(--accent)",
        }}
      >
        💬
        {naoLidas > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              background: "red",
              color: "white",
              borderRadius: "50%",
              fontSize: "11px",
              fontWeight: "bold",
              padding: "2px 6px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              animation: "pulse 2s infinite",
            }}
          >
            {naoLidas}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className="card"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        width: "calc(100% - 48px)",
        maxWidth: "400px",
        height: "500px",
        flexDirection: "column",
        zIndex: 999,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        padding: 0,
        overflow: "hidden",
        display: "flex",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Barra de Topo */}
      <div
        style={{
          background: "var(--accent)",
          color: "white",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontWeight: "bold",
          fontSize: "16px",
        }}
      >
        <span style={{ color: "var(--text)" }}>Chat 💕</span>
        <button
          onClick={() => setAberto(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          ✕
        </button>
      </div>

      {/* Histórico de Mensagens */}
      <div
        style={{
          flex: 1,
          padding: "16px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          background: "var(--background)",
          width: "100%",
        }}
      >
        {mensagensUnicas.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              opacity: 0.5,
              fontSize: "14px",
              margin: "auto 0",
            }}
          >
            <p>Nenhuma mensagem ainda...</p>
            <p style={{ fontSize: "24px" }}>🌹</p>
          </div>
        ) : (
          mensagensUnicas.map((m) => {
            const ehMinha = m.user_id === user?.id;
            const fotoAvatar =
              m.avatar_url ||
              `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${m.nome_usuario}`;

            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: ehMinha ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: "8px",
                }}
              >
                {/* Avatar do parceiro(a) na Esquerda */}
                {!ehMinha && (
                  <img
                    src={fotoAvatar}
                    alt={m.nome_usuario}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid rgba(0,0,0,0.1)",
                      marginBottom: "2px",
                    }}
                  />
                )}

                {/* Balão de Texto */}
                <div
                  style={{
                    background: ehMinha
                      ? "var(--accent)"
                      : "rgba(0, 0, 0, 0.06)",
                    color: ehMinha ? "white" : "inherit",
                    padding: "10px 16px",
                    borderRadius: ehMinha
                      ? "16px 16px 4px 16px"
                      : "16px 16px 16px 4px",
                    maxWidth: "70%",
                    width: "auto",
                    display: "inline-block",
                    fontSize: "14px",
                    lineHeight: "1.4",
                    whiteSpace: "pre-wrap",
                    overflowWrap: "break-word",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    border: !ehMinha ? "1px solid rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {!ehMinha && (
                    <div
                      style={{
                        fontSize: "11px",
                        opacity: 0.7,
                        marginBottom: "4px",
                        fontWeight: "bold",
                      }}
                    >
                      {m.nome_usuario}
                    </div>
                  )}
                  <div>{m.conteudo}</div>
                </div>

                {/* Seu Avatar na Direita */}
                {ehMinha && (
                  <img
                    src={fotoAvatar}
                    alt="Você"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid var(--accent)",
                      marginBottom: "2px",
                    }}
                  />
                )}
              </div>
            );
          })
        )}
        <div ref={mensagensEndRef} />
      </div>

      {/* Input de Envio */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          gap: "10px",
          background: "var(--background)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          alignItems: "center",
          width: "100%",
        }}
      >
        <input
          className="input-main"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Diz algo fofo..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleEnviar();
          }}
          style={{
            margin: 0,
            height: "42px",
            fontSize: "14px",
            flex: 1,
          }}
        />
        <button
          className="btn-add"
          onClick={handleEnviar}
          style={{
            height: "42px",
            width: "42px",
            margin: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          ➔
        </button>
      </div>
    </div>
  );
}