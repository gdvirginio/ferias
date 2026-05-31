const CACHE_NAME = "amor-tarefas-v3"; // Versão atualizada para forçar a limpeza do cache problemático
const ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/imgs/spiderman-bg.jpeg",
  "/imgs/hellokitty-bg.jpeg",
];

// Instalação do SW e Cache de Ativos Estáticos
self.addEventListener("install", (event) => {
  self.skipWaiting(); // <-- CRÍTICO: Força a atualização do SW paralisado
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)),
  );
});

// Ativação e Limpeza de Caches Antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        }),
      );
    }),
  );
  self.clients.claim(); // <-- CRÍTICO: Assume o controle imediato da página
});

// Interceptador para funcionamento Offline
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // <-- CRÍTICO: Ignora Turbopack (_next), APIs, Extensões E O SUPABASE
  if (
    event.request.method !== "GET" ||
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.hostname.includes("supabase.co") || // Protege as rotas em Produção
    url.hostname.includes("supabase.in") || // Protege domínios alternativos/locais do Supabase
    url.protocol === "chrome-extension:"
  ) {
    return; // Passa direto para a rede, sem travar o Next.js
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).catch(() => {
          // Só retorna a página inicial offline se for uma requisição de NAVEGAÇÃO de página
          // Se for imagem ou script faltando, não fazemos fallback pro HTML para não quebrar o React
          if (event.request.mode === "navigate") {
            return caches.match("/");
          }
        })
      );
    }),
  );
});

// Escuta os eventos de Push enviados pelo servidor (Web Push API)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      vibrate: [200, 100, 200],
      data: { url: "/" },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (error) {
    console.error("Erro ao processar push notification payload:", error);
  }
});

// Clique na Notificação redireciona para o app
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow("/");
      }),
  );
});
