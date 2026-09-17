"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useProgresso } from "@/lib/progresso";
import type { Prova } from "@/lib/conteudo";
import { Cronometro } from "@/components/Cronometro";
import { useCronometro } from "@/components/useCronometro";
import { Criterio } from "@/components/Checklist";
import { Codigo } from "@/components/Codigo";
import { Corretor } from "@/components/IA";

type Pratica = Extract<Prova, { tipo: "pratica" }>;

/** Todas as tarefas visíveis, autoavaliadas por critério. Finalizar abre todas as soluções. */
export function ProvaPratica({ prova: p }: { prova: Pratica }) {
  const { acoes } = useProgresso();
  const { segundos } = useCronometro();
  const [marcados, setMarcados] = useState<Record<string, boolean>>({});
  const [solucoes, setSolucoes] = useState<Record<number, boolean>>({});
  const [fim, setFim] = useState(false);
  const registrou = useRef(false);

  const total = p.tarefas.reduce((s, t) => s + t.criterios.length, 0);
  const atendidos = Object.values(marcados).filter(Boolean).length;

  const encerrar = () => {
    if (!registrou.current) {
      registrou.current = true;
      acoes.registrarProva(p.id, atendidos, total, segundos);
    }
    setFim(true);
    setSolucoes(Object.fromEntries(p.tarefas.map((_, ti) => [ti, true])));
  };

  return (
    <>
      <div className="barra-aula">
        <Link href="/pratica?aba=provas" className="bt-2"><ArrowLeft size={16} /> Voltar</Link>
        <Cronometro segundos={segundos} blocoMin={p.tempo} />
      </div>

      <h2 className="h2">{p.titulo}</h2>
      <p className="sub" style={{ marginBottom: 20 }}>{p.escopo}</p>

      {fim ? (
        <>
          <div className={`placar ${atendidos / total >= 0.7 ? "bom" : "ruim"}`}>{atendidos}/{total}</div>
          <p className="sub">
            Critérios atendidos. As soluções abaixo abriram. Compare com o seu código, principalmente
            nas tarefas que você deixou incompletas.
          </p>
        </>
      ) : (
        <div className="aviso" style={{ marginBottom: 26 }}>{p.aviso}</div>
      )}

      {p.tarefas.map((t, ti) => (
        <div className="tarefa" key={ti}>
          <h3 className="h3">{ti + 1}. {t.titulo}</h3>
          <p className="prosa">{t.enunciado}</p>

          <div className="secao-t" style={{ marginTop: 18 }}>Critérios</div>
          {t.criterios.map((c, ci) => {
            const chave = `${ti}-${ci}`;
            return (
              <Criterio key={ci} texto={c} marcado={Boolean(marcados[chave])}
                aoAlternar={fim ? undefined : () => setMarcados((m) => ({ ...m, [chave]: !m[chave] }))} />
            );
          })}

          <div style={{ marginTop: 16 }}>
            {solucoes[ti]
              ? <Codigo>{t.solucao}</Codigo>
              : <button type="button" className="bt-2" onClick={() => setSolucoes((s) => ({ ...s, [ti]: true }))}>Ver solução desta tarefa</button>}
          </div>
          <Corretor titulo={t.titulo} enunciado={t.enunciado} criterios={t.criterios} solucao={t.solucao} />
        </div>
      ))}

      <div className="rodape">
        {fim ? (
          <Link href="/pratica?aba=provas" className="bt-2">Voltar</Link>
        ) : (
          <>
            <div className="contador" style={{ marginTop: 0 }}>{atendidos} de {total} critérios marcados</div>
            <button type="button" className="bt" onClick={encerrar}><Check size={18} /> Finalizar a prova</button>
          </>
        )}
      </div>
    </>
  );
}
