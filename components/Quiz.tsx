"use client";

import { useState } from "react";
import type { Questao } from "@/lib/conteudo";

/** Uma questão com retorno imediato. Depois de marcar, trava. */
export function QuestaoImediata({ q, aoResponder }: { q: Questao; aoResponder?: (acertou: boolean) => void }) {
  const [escolha, setEscolha] = useState<number | null>(null);

  const marcar = (i: number) => {
    if (escolha !== null) return;
    setEscolha(i);
    aoResponder?.(i === q.correta);
  };

  return (
    <div style={{ marginBottom: 18 }}>
      <p className="prosa" style={{ marginBottom: 12 }}>{q.pergunta}</p>
      {q.opcoes.map((o, i) => {
        let cls = "opt";
        if (escolha !== null) {
          if (i === q.correta) cls += " certa";
          else if (i === escolha) cls += " errada";
        }
        return (
          <button key={i} type="button" className={cls} onClick={() => marcar(i)} aria-disabled={escolha !== null}>
            {o}
          </button>
        );
      })}
      {escolha !== null && <div className="porque">{q.porque}</div>}
    </div>
  );
}
