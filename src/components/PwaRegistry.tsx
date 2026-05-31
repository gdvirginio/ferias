"use client";

import { useEffect } from "react";

export function PwaRegistry() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.isSecureContext) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log(
              "PWA: ServiceWorker registrado com sucesso.",
              reg.scope,
            );
          })
          .catch((err) => {
            console.error("PWA: Erro ao registrar ServiceWorker:", err);
          });
      });
    }
  }, []);

  return null;
}