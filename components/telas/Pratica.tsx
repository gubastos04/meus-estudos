"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Abas } from "@/components/Abas";
import { QuestaoImediata } from "@/components/Quiz";
import { GerarDemanda } from "@/components/IA";
import { useProgresso } from "@/lib/progresso";
import type { Demanda, Questao } from "@/lib/conteudo";
import { embaralhar } from "@/lib/sorteio";

export type Aba = "demandas" | "treino" | "provas" | "revisar";

const ABAS = [
  { id: "demandas", rotulo: "Demandas" }, { id: "treino", rotulo: "Treino" },
  { id: "provas", rotulo: "Provas" }, { id: "revisar", rotulo: "Revisar" },
] as const;

type DemandaItem = Pick<Demanda, "id" | "titulo" | "de" | "canal" | "numero" | "prazo" | "nivel">;
type TreinoItem = { id: string; titulo: string; nivel: string; tempo: number };
type ProvaItem = { id: string; titulo: string; tipo: "alternativas" | "pratica"; escopo: string; tempo: number; total: number };
type QuestaoRevisao = Questao & { aulaId: string; aulaTitulo: string };

export const rotuloCanal = (d: Pick<Demanda, "canal" | "numero">) => (d.numero ? `${d.canal} ${d.numero}` : d.canal);

export function Pratica({ abaInicial, demandas, treinos, provas, questoes, semente, titulosAulas }: {
  abaInicial: Aba; demandas: DemandaItem[]; treinos: TreinoItem[]; provas: ProvaItem[];
  questoes: QuestaoRevisao[]; semente: number; titulosAulas: Record<string, string>;
}) {
  const { progresso, acoes } = useProgresso();
  // títulos das aulas concluídas alimentam o gerador de demandas (nível do aluno)
  const aulasFeitas = Object.keys(progresso.feitas).map((id) => titulosAulas[id]).filter(Boolean);
  const [aba, setAba] = useState<Aba>(abaInicial);

  // geradas por IA primeiro, com selo "nova"; depois as do conteúdo
  const lista = [
    ...progresso.geradas.map((g) => ({ ...g, gerada: true })),
    ...demandas.map((d) => ({ ...d, gerada: false })),
  ];

  return (
    <>
      <Abas itens={ABAS} ativa={aba} aoMudar={setAba} />

      {aba === "demandas" && (
        <>
          <h2 className="h2">Demandas</h2>
          <p className="sub">
            Chegam como chegariam no trabalho: pedido meio vago, prazo, e às vezes o escopo muda no meio.
            Você resolve no seu editor e confere pela lista de critérios.
          </p>
          {lista.map((d) => {
            const ok = Boolean(progresso.demandas[d.id]);
            return (
              <Link key={d.id} href={`/pratica/demandas/${d.id}`} className={`cartao ${ok ? "ok" : ""}`}>
                <span style={{ flex: 1 }}>
                  <span className="cartao-t">{d.titulo}</span>
                  <span className="cartao-m">{d.de} · {rotuloCanal(d)} · prazo: {d.prazo}</span>
                </span>
                <span className={`selo ${ok ? "ok" : ""}`}>{ok ? "entregue" : d.gerada ? "nova" : `nível ${d.nivel}`}</span>
              </Link>
            );
          })}
          <GerarDemanda aulasFeitas={aulasFeitas} aoGerar={acoes.adicionarGerada} />
        </>
      )}

      {aba === "treino" && (
        <>
          <h2 className="h2">Treino</h2>
          <p className="sub">
            Algoritmo puro, do tipo que cai em entrevista técnica. Tente sozinho primeiro.
            Olhar a solução não é derrota, mas o app anota a diferença.
          </p>
          {treinos.map((t) => {
            const r = progresso.treinos[t.id];
            return (
              <Link key={t.id} href={`/pratica/treino/${t.id}`} className={`cartao ${r ? "ok" : ""}`}>
                <span style={{ flex: 1 }}>
                  <span className="cartao-t">{t.titulo}</span>
                  <span className="cartao-m">
                    {t.nivel} · {t.tempo} min{r && (r.sozinho ? " · resolvido sozinho" : " · com ajuda")}
                  </span>
                </span>
                <span className={`selo ${r ? "ok" : ""}`}>{r ? "feito" : "aberto"}</span>
              </Link>
            );
          })}
        </>
      )}

      {aba === "provas" && (
        <>
          <h2 className="h2">Provas</h2>
          <p className="sub">
            Duas categorias. A de alternativas não dá resposta no meio: você responde tudo e vê a nota no fim.
            A prática você resolve no editor e confere por critérios objetivos.
          </p>
          {provas.map((p) => {
            const r = progresso.provas[p.id];
            return (
              <Link key={p.id} href={`/pratica/provas/${p.id}`} className={`cartao ${r && r.melhor === p.total ? "ok" : ""}`}>
                <span style={{ flex: 1 }}>
                  <span className="cartao-t">{p.titulo}</span>
                  <span className="cartao-m">
                    {p.tipo === "alternativas" ? "Alternativas" : "Prática"} · {p.escopo} · {p.tempo} min
                    {r && ` · melhor: ${r.melhor}/${p.total}`}
                  </span>
                </span>
                <span className={`selo ${r ? "ok" : ""}`}>{r ? `${r.tentativas}x` : "nova"}</span>
              </Link>
            );
          })}
        </>
      )}

      {aba === "revisar" && <Revisar questoes={questoes} semente={semente} />}
    </>
  );
}

/* ── Revisar: sem nota, sem fim ────────────────────────────────── */

function Revisar({ questoes, semente }: { questoes: QuestaoRevisao[]; semente: number }) {
  const { progresso } = useProgresso();
  const feitas = progresso.feitas;
  // só questões de aulas concluídas, embaralhadas uma vez por visita
  const banco = useMemo(
    () => embaralhar(questoes.filter((q) => feitas[q.aulaId]), semente),
    [questoes, feitas, semente],
  );
  const [i, setI] = useState(0);
  const [respondida, setRespondida] = useState(false);

  if (!banco.length) {
    return (
      <>
        <h2 className="h2">Revisar</h2>
        <p className="sub">Perguntas das aulas que você já fez, embaralhadas.</p>
        <div className="vazio">Nada pra revisar ainda. Termine uma aula e as perguntas dela aparecem aqui.</div>
      </>
    );
  }

  const q = banco[i % banco.length];

  return (
    <>
      <h2 className="h2">Revisar</h2>
      <p className="sub">Pergunta {(i % banco.length) + 1} de {banco.length}, da aula &quot;{q.aulaTitulo}&quot;. É revisão, não avaliação.</p>
      <QuestaoImediata key={i} q={q} aoResponder={() => setRespondida(true)} />
      {respondida && (
        <button type="button" className="bt" onClick={() => { setI(i + 1); setRespondida(false); }}>Próxima pergunta</button>
      )}
    </>
  );
}
