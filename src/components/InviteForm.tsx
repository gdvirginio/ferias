// components/InviteForm.tsx
"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export function InviteForm({ groupId }: { groupId: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle",
  );
  const [inviteLink, setInviteLink] = useState(""); // Estado para guardar o link gerado

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setInviteLink(""); // Limpa o link anterior se houver

    // 1. Gera o token
    const token = crypto.randomUUID();

    // 2. Grava no banco de dados
    const { error: dbError } = await supabase.from("invitations").insert({
      group_id: groupId,
      invited_email: email,
      token: token,
      status: "pending",
    });

    if (dbError) {
      console.error("Erro ao salvar convite:", dbError);
      setStatus("error");
      return;
    }

    // 3. Monta o link mágico com base em onde você está acessando agora
    const link = `${window.location.origin}/invite/${token}`;
    setInviteLink(link); // Exibe o link na tela

    // 4. Tenta disparar o email via Resend
    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      if (res.ok) {
        setStatus("ok");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  }

  // Função para copiar para a área de transferência
  function copyToClipboard() {
    navigator.clipboard.writeText(inviteLink);
    alert("Link copiado para a área de transferência!"); // Pode trocar por um Toast se preferir
  }

  return (
    <div className="my-4 flex flex-col gap-2">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email da sua parceira"
          className="input-main flex-1"
          required
        />
        <button
          type="submit"
          className="btn-primary"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Processando..." : "Gerar Convite"}
        </button>
      </form>

      {/* Exibe o status e o botão de copiar apenas se o link foi gerado */}
      {inviteLink && (
        <div
          className="flex items-center gap-2 mt-2 p-2 rounded"
          style={{ background: "var(--bg-secondary)" }}
        >
          <input
            type="text"
            readOnly
            value={inviteLink}
            className="input-main flex-1 text-sm opacity-70"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className="btn-secondary"
          >
            Copiar Link 📋
          </button>
        </div>
      )}

      {status === "error" && (
        <p style={{ color: "red", fontSize: "0.8rem" }}>
          Convite gerado, mas falha ao enviar email. Envie o link acima
          manualmente.
        </p>
      )}
    </div>
  );
}