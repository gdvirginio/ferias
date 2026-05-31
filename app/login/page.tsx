// app/login/page.tsx
"use client";
import { useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

// O Next.js 15 pede que componentes usando useSearchParams sejam envolvidos em Suspense
function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Captura para onde o usuário deve ir após logar (ou volta pra Home)
  const redirectUrl = searchParams.get("redirect") || "/";

  const handleAuth = async (type: "in" | "up") => {
    const { error } =
      type === "in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      // Redireciona para o fluxo de convite ou para a Home
      router.push(redirectUrl);
    }
  };

  return (
    <div className="login-card">
      <h1 style={{ textAlign: "center", marginBottom: "10px" }}>Acessar</h1>

      <input
        type="email"
        placeholder="Email"
        className="input-field"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Senha"
        className="input-field"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn-primary" onClick={() => handleAuth("in")}>
        Entrar
      </button>

      <button className="btn-secondary" onClick={() => handleAuth("up")}>
        Criar Conta
      </button>
    </div>
  );
}

export default function Login() {
  return (
    <div className="login-container">
      <Suspense fallback={<p>Carregando...</p>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}