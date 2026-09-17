"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProgresso } from "@/lib/progresso";
import type { Prova } from "@/lib/conteudo";
import { Cronometro } from "@/components/Cronometro";
import { useCronometro } from "@/components/useCronometro";

type Alternativas = Extract<Prova, { tipo: "alternativas" }>;

/** Uma questão por vez, sem retorno até o fim. A nota só aparece depois de finalizar. */
export function ProvaAlternativas({ prova: p }: { prova: Alternativas }) {
  const { acoes } = useProgresso();
  const { segundos, reiniciar } = useCronometro();
  const [i, setI] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number>>({});
  const [fim, setFim] = useState(false);
  const registrou = useRef(false);

  const total = p.questoes.length;
  const acertos = p.questoes.filter((q, qi) => respostas[qi] === q.correta).length;

  const encerrar = () => {
    if (!registrou.current) {
      registrou.current = true;
      acoes.registrarProva(p.id, acertos, total, segundos);
    }
    setFim(true);
  };

  const refazer = () => {
    setRespostas({}); setI(0); setFim(false);
    registrou.current = false;
    reiniciar();
  };

  if (fim) {
    const erradas = p.questoes.map((q, qi) => ({ q, qi })).filter(({ q, qi }) => respostas[qi] !== q.correta);
    const bom = acertos / total >= 0.7;
    return (
      <>
        <div className="barra-aula">
          <Link href="/pratica?aba=provas" className="bt-2"><ArrowLeft size={16} /> Voltar</Link>
          <span className="cartao-m">{Math.floor(segundos / 60)} min</span>
        </div>

        <div className={`placar ${bom ? "bom" : "ruim"}`}>{acertos}/{total}</div>
        <p className="sub">
          {bom
            ? "Passou. O que você errou abaixo é onde vale voltar."
            : "Abaixo de 70%. Não é drama, é informação: revise as aulas dos itens abaixo antes de seguir."}
        </p>

        {erradas.length > 0 && <div className="secao-t">O que você errou</div>}
        {erradas.map(({ q, qi }) => (
          <div className="rev-q" key={qi}>
            <b>{q.pergunta}</b>
            Você marcou: {respostas[qi] === undefined ? "nada" : q.opcoes[respostas[qi]]}<br />
            Resposta certa: {q.opcoes[q.correta]}<br /><br />
            {q.porque}
          </div>
        ))}

        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <button type="button" className="bt" onClick={refazer}>Refazer a prova</button>
          <Link href="/pratica?aba=provas" className="bt-2">Voltar</Link>
        </div>
      </>
    );
  }

  const q = p.questoes[i];
  const marcada = respostas[i];

  return (
    <>
      <div className="barra-aula">
        <Link href="/pratica?aba=provas" className="bt-2"><ArrowLeft size={16} /> Sair</Link>
        <Cronometro segundos={segundos} blocoMin={p.tempo} />
      </div>

      <div className="prog-q" aria-hidden="true">
        {p.questoes.map((_, qi) => <i key={qi} className={respostas[qi] !== undefined ? "on" : ""} />)}
      </div>

      <p className="sub" style={{ marginBottom: 14 }}>Questão {i + 1} de {total}. Sem resposta até o fim.</p>
      <p className="prosa" style={{ fontSize: "calc(18px * var(--esc))", marginBottom: 18 }}>{q.pergunta}</p>

      {q.opcoes.map((o, oi) => (
        <button key={oi} type="button" className={`opt ${marcada === oi ? "certa" : ""}`}
          aria-pressed={marcada === oi} onClick={() => setRespostas((r) => ({ ...r, [i]: oi }))}>
          {o}
        </button>
      ))}

      <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
        {i > 0 && <button type="button" className="bt-2" onClick={() => setI(i - 1)}>Anterior</button>}
        {i < total - 1
          ? <button type="button" className="bt" onClick={() => setI(i + 1)}>Próxima</button>
          : <button type="button" className="bt" onClick={encerrar}>Finalizar e ver a nota</button>}
      </div>
    </>
  );
}
