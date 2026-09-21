"use client";

import { useProgresso } from "@/lib/progresso";

// Aviso de gravação que falhou, visível em qualquer tela (mobile ou desktop).
export function AvisoFalha() {
  const { falha } = useProgresso();
  if (!falha) return null;
  return (
    <div className="wrap" style={{ paddingTop: 16, paddingBottom: 0 }}>
      <div className="aviso aviso-falha" role="alert">{falha}</div>
    </div>
  );
}
