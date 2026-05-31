"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Bell,
  Layers,
  WifiOff,
  MessageSquare,
  Image,
  CheckSquare,
} from "lucide-react";

// Mudei a versão para refletir esse salto gigante de funcionalidades!
const CURRENT_VERSION = "2.0.0";

export function ReleaseModal() {
  const [exibir, setExibir] = useState(false);

  useEffect(() => {
    const ultimaVersaoVista = localStorage.getItem("app-version");
    if (ultimaVersaoVista !== CURRENT_VERSION) {
      setExibir(true);
    }
  }, []);

  const fecharModal = () => {
    localStorage.setItem("app-version", CURRENT_VERSION);
    setExibir(false);
  };

  return (
    <AnimatePresence>
      {exibir && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={fecharModal}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(12px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "var(--card-overlay, #1e293b)",
              color: "var(--text, #fff)",
              maxWidth: "500px",
              width: "100%",
              borderRadius: "var(--radius, 24px)",
              padding: "32px",
              boxShadow: "var(--shadow-premium, 0 20px 40px rgba(0,0,0,0.3))",
              border: "var(--border)",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {/* Header com Ícone Animado */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <div
                style={{
                  padding: "10px",
                  background: "var(--accent-light, rgba(59, 130, 246, 0.15))",
                  borderRadius: "12px",
                }}
              >
                <Sparkles size={24} color="var(--accent)" />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: "800",
                    letterSpacing: "-0.5px",
                  }}
                >
                  A Maior Atualização Até Aqui! 🚀
                </h3>
                <span
                  style={{
                    fontSize: "12px",
                    opacity: 0.6,
                    color: "var(--text)",
                  }}
                >
                  Versão {CURRENT_VERSION}
                </span>
              </div>
            </div>

            {/* Texto introdutório */}
            <p
              style={{
                margin: "0 0 24px 0",
                fontSize: "14px",
                opacity: 0.8,
                lineHeight: "1.6",
              }}
            >
              Deixei o sistema mais inteligente, interativo e lindo. Olha só
              tudo o que mudei:
            </p>

            {/* Lista de Recursos rolável caso a tela seja pequena */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                marginBottom: "32px",
              }}
            >
              {/* 1. Push Notifications */}
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ color: "var(--accent)", marginTop: "2px" }}>
                  <Bell size={18} />
                </div>
                <div style={{ fontSize: "14px" }}>
                  <strong style={{ display: "block", marginBottom: "2px" }}>
                    Avisos na Tela (Push Notifications)
                  </strong>
                  <span style={{ opacity: 0.7, lineHeight: "1.5" }}>
                    Você vai saber no exato segundo em que uma nova tarefa for
                    adicionada, direto na central de notificações do seu celular
                    ou PC.
                  </span>
                </div>
              </div>

              {/* 2. Drag and Drop */}
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ color: "var(--accent)", marginTop: "2px" }}>
                  <Layers size={18} />
                </div>
                <div style={{ fontSize: "14px" }}>
                  <strong style={{ display: "block", marginBottom: "2px" }}>
                    Arrastar e Organizar (Drag & Drop)
                  </strong>
                  <span style={{ opacity: 0.7, lineHeight: "1.5" }}>
                    Agora dá para reordenar suas tarefas segurando e arrastando!
                    Organize seu dia com movimentos fluidos e fáceis.
                  </span>
                </div>
              </div>

              {/* 3. Service Worker Real (Offline) */}
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ color: "var(--accent)", marginTop: "2px" }}>
                  <WifiOff size={18} />
                </div>
                <div style={{ fontSize: "14px" }}>
                  <strong style={{ display: "block", marginBottom: "2px" }}>
                    Funcionamento Offline Total
                  </strong>
                  <span style={{ opacity: 0.7, lineHeight: "1.5" }}>
                    Implementei um Service Worker manual para que o PWA abra
                    instantaneamente e funcione mesmo se vocês estiverem sem
                    internet.
                  </span>
                </div>
              </div>

              {/* 4. Chat entre o Casal */}
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ color: "var(--accent)", marginTop: "2px" }}>
                  <MessageSquare size={18} />
                </div>
                <div style={{ fontSize: "14px" }}>
                  <strong style={{ display: "block", marginBottom: "2px" }}>
                    Nosso Chat
                  </strong>
                  <span style={{ opacity: 0.7, lineHeight: "1.5" }}>
                    Conversas em tempo real integradas via Supabase Realtime com
                    direito a proteção contra bugs e carregamento instantâneo.
                  </span>
                </div>
              </div>

              {/* 5. Foto de Perfil & Upload */}
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ color: "var(--accent)", marginTop: "2px" }}>
                  <Image size={18} />
                </div>
                <div style={{ fontSize: "14px" }}>
                  <strong style={{ display: "block", marginBottom: "2px" }}>
                    Fotos de Perfil Reais
                  </strong>
                  <span style={{ opacity: 0.7, lineHeight: "1.5" }}>
                    Diga adeus aos avatares genéricos. O app agora faz o upload
                    e exibe a foto real da sua conta sincronizada direto no
                    chat.
                  </span>
                </div>
              </div>

              {/* 6. Badge e Animações */}
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <div style={{ color: "var(--accent)", marginTop: "2px" }}>
                  <CheckSquare size={18} />
                </div>
                <div style={{ fontSize: "14px" }}>
                  <strong style={{ display: "block", marginBottom: "2px" }}>
                    Visual Premium & Notificações Invisíveis
                  </strong>
                  <span style={{ opacity: 0.7, lineHeight: "1.5" }}>
                    Contador inteligente de tarefas não vistas para você não
                    perder nada, tudo envelopado com animações suaves e
                    delicadas usando Framer Motion.
                  </span>
                </div>
              </div>
            </div>

            {/* Botão de Confirmação */}
            <button
              onClick={fecharModal}
              style={{
                width: "100%",
                padding: "16px",
                background: "var(--accent)",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius, 14px)",
                fontWeight: "bold",
                fontSize: "15px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 14px var(--accent-light)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "var(--accent-hover, var(--accent))")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--accent)")
              }
            >
              Começar a Explorar <ArrowRight size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
