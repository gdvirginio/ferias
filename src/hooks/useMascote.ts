import { useState } from "react";

// Isso é um Custom Hook. Ele "exporta" a lógica para qualquer componente usar.
export function useMascote() {
  const [felicidade, setFelicidade] = useState(50);

  const alimentar = () => {
    setFelicidade((prev) => Math.min(prev + 10, 100));
  };

  return { felicidade, alimentar };
}
