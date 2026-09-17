"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Abas } from "@/components/Abas";
import { METAS } from "@/lib/constantes";
import { diasAtivos, minutosTotais, useProgresso } from "@/lib/progresso";
import type { Certificado, Lab, PerguntaEntrevista } from "@/lib/conteudo";

export type Aba = "progresso" | "entrevista" | "certificados";

const ABAS = [
  { id: "progresso", rotulo: "Progresso" }, { id: "entrevista", rotulo: "Entrevista" }, { id: "certificados", rotulo: "Certificados" },
] as const;

type ModuloIds = { id: string; aulas: string[] };

export function Voce({ abaInicial, modulos, totalTreinos, perguntas, certificados, labs }: {
  abaInicial: Aba; modulos: ModuloIds[]; totalTreinos: number;
  perguntas: PerguntaEntrevista[]; certificados: Certificado[]; labs: Lab[];
}) {
  const [aba, setAba] = useState<Aba>(abaInicial);
  return (
    <>
      <Abas itens={ABAS} ativa={aba} aoMudar={setAba} />
      {aba === "progresso" && <Progresso modulos={modulos} totalTreinos={totalTreinos} />}
      {aba === "entrevista" && <Entrevista perguntas={perguntas} />}
      {aba === "certificados" && <Certificados certificados={certificados} labs={labs} />}
    </>
  );
}

/* ── Progresso ────────────────────────────────────────────────── */

function Progresso({ modulos, totalTreinos }: { modulos: ModuloIds[]; totalTreinos: number }) {
  const { progresso: p, acoes } = useProgresso();
  const [confirmando, setConfirmando] = useState(false);

  const minutos = minutosTotais(p);
  const modulosCompletos = modulos.filter((m) => m.aulas.every((a) => p.feitas[a])).length;
  const treinosFeitos = Object.values(p.treinos);
  const sozinho = treinosFeitos.filter((t) => t.sozinho).length;

  const linhas: [string, string | number][] = [
    ["Aulas concluídas", Object.keys(p.feitas).length],
    ["Tempo total estudado", `${Math.floor(minutos / 60)}h ${minutos % 60}m`],
    ["Módulos completos", modulosCompletos],
    ["Projetos no GitHub", Object.keys(p.projetos).length],
    ["Demandas entregues", Object.keys(p.demandas).length],
    ["Treinos resolvidos sozinho", `${sozinho} de ${treinosFeitos.length}`],
    ["Dias ativos na semana", diasAtivos(p)],
    ["Notas no caderno", p.notas.length],
  ];

  return (
    <>
      <h2 className="h2">Você</h2>
      <p className="sub">O número que importa não é a sequência perfeita. É o total que não volta pra trás.</p>

      {linhas.map(([rotulo, valor], i) => (
        <div className="stat" key={rotulo} style={i === linhas.length - 1 ? { borderBottom: "none" } : undefined}>
          <span className="stat-l">{rotulo}</span>
          <span className="stat-n">{valor}</span>
        </div>
      ))}
      {treinosFeitos.length > 0 && sozinho < treinosFeitos.length && (
        <p className="nota" style={{ marginTop: 8 }}>{totalTreinos} treinos no total. Os feitos com ajuda valem refazer daqui a uma semana.</p>
      )}

      <h3 className="h3" style={{ marginTop: 32 }}>Meta da semana</h3>
      <p className="nota">Quantos dias por semana você quer estudar? Comece baixo. Aumentar é fácil.</p>
      <div className="linha-bt" role="radiogroup" aria-label="Meta semanal">
        {METAS.map((n) => (
          <button key={n} type="button" role="radio" aria-checked={p.meta === n}
            className={`pill ${p.meta === n ? "on" : ""}`} onClick={() => acoes.setMeta(n)}>{n} dias</button>
        ))}
      </div>

      <h3 className="h3" style={{ marginTop: 32 }}>Trazer o progresso do protótipo</h3>
      <p className="nota">Se você usou a versão anterior no claude.ai, dá para importar o que fez lá.</p>
      <Link href="/importar" className="bt-2">Importar do protótipo</Link>

      <h3 className="h3" style={{ marginTop: 32 }}>Recomeçar do zero</h3>
      <p className="nota">Apaga progresso, tempo e notas. Tema e tamanho de fonte ficam. Não dá pra desfazer.</p>
      {confirmando ? (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="bt bt-alerta" onClick={() => { acoes.apagarTudo(); setConfirmando(false); }}>
            Apagar tudo mesmo
          </button>
          <button type="button" className="bt-2" onClick={() => setConfirmando(false)}>Cancelar</button>
        </div>
      ) : (
        <button type="button" className="bt-2" onClick={() => setConfirmando(true)}><Trash2 size={16} /> Apagar meus dados</button>
      )}
    </>
  );
}

/* ── Entrevista ───────────────────────────────────────────────── */

function Entrevista({ perguntas }: { perguntas: PerguntaEntrevista[] }) {
  const [tema, setTema] = useState("Todos");
  const [abertas, setAbertas] = useState<Record<string, boolean>>({});
  const temas = ["Todos", ...Array.from(new Set(perguntas.map((q) => q.tema)))];
  const lista = perguntas.filter((q) => tema === "Todos" || q.tema === tema);

  return (
    <>
      <h2 className="h2">Banco de entrevista</h2>
      <p className="sub">
        Perguntas que caem de verdade. Tente responder em voz alta antes de abrir. O que está
        escondido não é a resposta certa, é o que o entrevistador quer ouvir.
      </p>

      <div className="linha-bt" style={{ flexWrap: "wrap" }} role="radiogroup" aria-label="Tema">
        {temas.map((t) => (
          <button key={t} type="button" role="radio" aria-checked={tema === t}
            className={`pill ${tema === t ? "on" : ""}`} onClick={() => setTema(t)} style={{ flex: "1 1 28%" }}>{t}</button>
        ))}
      </div>

      {lista.map((q) => {
        const chave = q.pergunta;
        const aberta = Boolean(abertas[chave]);
        return (
          <div className="perg" key={chave}>
            <div className="perg-tema">{q.tema}</div>
            <div className="perg-p">{q.pergunta}</div>
            {aberta ? (
              <>
                <div className="perg-bl"><div className="rotulo">O que eles querem ouvir</div><div className="perg-d">{q.querem}</div></div>
                <div className="perg-bl"><div className="rotulo">Esqueleto de resposta</div><div className="perg-d">{q.esqueleto}</div></div>
                <div className="perg-bl"><div className="rotulo">Cuidado</div><div className="perg-d alerta">{q.cuidado}</div></div>
                <button type="button" className="mini" style={{ marginTop: 14 }}
                  onClick={() => setAbertas((a) => ({ ...a, [chave]: false }))}>fechar</button>
              </>
            ) : (
              <button type="button" className="mini" style={{ marginTop: 12 }}
                onClick={() => setAbertas((a) => ({ ...a, [chave]: true }))}>respondi, ver o gabarito</button>
            )}
          </div>
        );
      })}
    </>
  );
}

/* ── Certificados e labs ──────────────────────────────────────── */

function Certificados({ certificados, labs }: { certificados: Certificado[]; labs: Lab[] }) {
  const ordenados = certificados.slice().sort((a, b) => a.ordem - b.ordem);
  return (
    <>
      <h2 className="h2">Certificados e labs</h2>
      <p className="sub">
        Em ordem de custo, não de prestígio. Certificado caro sem projeto no GitHub não abre porta.
        Faça o inverso: construa primeiro, certifique depois.
      </p>
      <div className="aviso" style={{ marginBottom: 22 }}>
        Preços mudam. Confirme no site oficial antes de comprar qualquer coisa.
      </div>

      {ordenados.map((c) => {
        const gratis = c.custo === "Gratuito";
        return (
          <div className={`cert ${gratis ? "gratis" : ""}`} key={c.nome}>
            <div className="perg-cab">
              <span className="cert-n">{c.ordem}. {c.nome}</span>
              <span className={`cert-c ${gratis ? "gratis" : ""}`}>{c.custo}</span>
            </div>
            <div className="perg-tema" style={{ color: "var(--dim)" }}>{c.orgao} · {c.quando}</div>
            <div className="perg-d">{c.porque}</div>
          </div>
        );
      })}

      <h3 className="h3" style={{ marginTop: 34, marginBottom: 6 }}>Laboratórios gratuitos</h3>
      <p className="nota">Onde treinar de verdade. Tudo nesta lista é grátis ou tem camada grátis relevante.</p>
      {labs.map((l) => (
        <div className="termo" key={l.nome}>
          <div className="termo-t">
            {l.url ? <a href={l.url} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>{l.nome}</a> : l.nome}
            <span className="termo-a">{l.tema}</span>
          </div>
          <div className="termo-d">{l.descricao}</div>
        </div>
      ))}

      <div className="aviso" style={{ marginTop: 24 }}>
        Regra que vale mais que qualquer certificado: só teste em sistema seu ou em alvo que autoriza
        explicitamente. Escanear ou invadir máquina de terceiro sem autorização é crime no Brasil,
        mesmo sem causar dano e mesmo que você reporte depois.
      </div>
    </>
  );
}
