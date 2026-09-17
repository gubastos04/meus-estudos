"use client";

import { useEffect, useRef, useState } from "react";

/** Conta segundos desde a montagem. Informativo, nunca bloqueante. */
export function useCronometro() {
  const inicio = useRef<number | null>(null);
  const [segundos, setSegundos] = useState(0);

  useEffect(() => {
    inicio.current ??= Date.now();
    const id = setInterval(() => setSegundos(Math.floor((Date.now() - (inicio.current ?? Date.now())) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const reiniciar = () => { inicio.current = Date.now(); setSegundos(0); };
  return { segundos, reiniciar };
}
