import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushManager(userId: string | undefined) {
  useEffect(() => {
    if (
      !userId ||
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window)
    ) {
      return;
    }

    // Puxa a chave pública das suas variáveis de ambiente do Next.js
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

    async function registerAndSubscribe() {
      try {
        if (!publicKey) {
          console.warn(
            "Chave pública VAPID não encontrada em process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY",
          );
          return;
        }

        // 1. Registra o arquivo do service worker
        await navigator.serviceWorker.register("/sw.js");

        // 2. Aguarda até que o Service Worker esteja 100% ATIVO e pronto
        const registration = await navigator.serviceWorker.ready;

        // 3. Busca uma inscrição existente ou cria uma nova
        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        // 4. Salva a inscrição diretamente no Supabase com segurança
        const { error } = await supabase.from("push_subscriptions").upsert(
          {
            user_id: userId,
            subscription: subscription.toJSON(),
          },
          { onConflict: "user_id" },
        );

        if (error) throw error;
      } catch (error) {
        console.error("Erro ao configurar PWA/Push:", error);
      }
    }

    registerAndSubscribe();
  }, [userId]);
}
