"use client"; // Importante: componentes que usam estado PRECISAM disso

import { useState, useEffect } from "react";

export default function Timer() {
  const [tempo, setTempo] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  useEffect(() => {
    const dataFerias = new Date("2026-07-08T00:00:00");
    const timer = setInterval(() => {
      const agora = new Date();
      const diferenca = dataFerias.getTime() - agora.getTime();

      setTempo({
        dias: Math.floor(diferenca / (1000 * 60 * 60 * 24)),
        horas: Math.floor(
          (diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutos: Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60)),
        segundos: Math.floor((diferenca % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex gap-4 p-4 border border-white rounded-lg">
      <span className="text-xl font-bold">
        {tempo.dias}d {tempo.horas}h {tempo.minutos}m {tempo.segundos}s
      </span>
    </div>
  );
}