"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Abas } from "@/components/Abas";
import { useProgresso } from "@/lib/progresso";
import type { Termo } from "@/lib/conteudo";

export type Aba = "notas" | "erros" | "glossario";

const ABAS = [
  { id: "notas", rotulo: "Notas" }, { id: "erros", rotulo: "Erros" }, { id: "glossario", rotulo: "Glossário" },
] as const;

export function Caderno({ abaInicial, termos }: { abaInicial: Aba; termos: Termo[] }) {
  const [aba, setAba] = useState<Aba>(abaInicial);
  return (
    <>
      <Abas itens={ABAS} ativa={aba} aoMudar={setAba} />
      {aba === "notas" && <Notas />}
      {aba === "erros" && <Erros />}
      {aba === "glossario" && <Glossario termos={termos} />}
    </>
  );
}

/* ── Notas ────────────────────────────────────────────────────── */

type Filtro = "todas" | "aulas" | "soltas";

function Notas() {
  const { progresso, acoes } = useProgresso();
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");

  const salvar = () => {
    const t = texto.trim();
    if (!t) return;
    acoes.anotar(t);
    setTexto("");
  };

  const lista = progresso.notas.filter((n) => filtro === "todas" || (filtro === "aulas" ? n.aulaId : !n.aulaId));

  return (
    <>
      <h2 className="h2">Caderno</h2>
      <p className="sub">Tudo que você anotou, inclusive dentro das aulas. Escreva curto.</p>

      <textarea className="campo" value={texto} onChange={(ev) => setTexto(ev.target.value)} placeholder="O que ficou na cabeça?" />
      <button type="button" className="bt" style={{ marginTop: 10, marginBottom: 26 }} onClick={salvar} disabled={!texto.trim()}>
        <Plus size={18} /> Salvar nota
      </button>

      {progresso.notas.length > 0 && (
        <div className="linha-bt" role="radiogroup" aria-label="Filtro">
          {([["todas", "Todas"], ["aulas", "Das aulas"], ["soltas", "Soltas"]] as const).map(([k, r]) => (
            <button key={k} type="button" role="radio" aria-checked={filtro === k}
              className={`pill ${filtro === k ? "on" : ""}`} onClick={() => setFiltro(k)}>{r}</button>
          ))}
        </div>
      )}

      {lista.length === 0
        ? <div className="vazio">Nada aqui. A primeira nota costuma ser a dúvida que você tem agora.</div>
        : lista.map((n) => (
          <div className="nota-item" key={n.id}>
            <div style={{ flex: 1 }}>
              {n.aulaTitulo && <div className="tag">{n.aulaTitulo}</div>}
              <div className="nota-data">{n.dia}</div>
              {n.texto}
            </div>
            <button type="button" className="lixo" onClick={() => acoes.apagarNota(n.id)} aria-label="Apagar nota">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
    </>
  );
}

/* ── Diário de erro ───────────────────────────────────────────── */

const VAZIO = { mensagem: "", contexto: "", causa: "", solucao: "" };

function Erros() {
  const { progresso, acoes } = useProgresso();
  const [f, setF] = useState(VAZIO);
  const [busca, setBusca] = useState("");

  const salvar = () => {
    if (!f.mensagem.trim()) return;
    const limpo = (s: string) => s.trim() || undefined;
    acoes.registrarErro({ mensagem: f.mensagem.trim(), contexto: limpo(f.contexto), causa: limpo(f.causa), solucao: limpo(f.solucao) });
    setF(VAZIO);
  };

  const b = busca.trim().toLowerCase();
  const lista = progresso.erros.filter((e) =>
    !b || [e.mensagem, e.contexto, e.causa, e.solucao].filter(Boolean).join(" ").toLowerCase().includes(b)
  );

  const campo = (chave: keyof typeof VAZIO, rotulo: string, dica: string, mono = false) => (
    <div style={{ marginBottom: 12 }}>
      <label className="rotulo" htmlFor={`erro-${chave}`}>{rotulo}</label>
      <textarea id={`erro-${chave}`} className="campo" value={f[chave]} onChange={(ev) => setF({ ...f, [chave]: ev.target.value })}
        placeholder={dica} style={{ minHeight: 64, ...(mono && { fontFamily: "var(--font-mono)", fontSize: "var(--f-code)" }) }} />
    </div>
  );

  return (
    <>
      <h2 className="h2">Diário de erro</h2>
      <p className="sub">
        Todo erro que te custar mais de 15 minutos entra aqui. Daqui a três meses você vai esbarrar
        no mesmo erro e não vai lembrar da solução. E numa entrevista, quando perguntarem de um
        problema que te travou, você vai ter a resposta escrita.
      </p>

      {campo("mensagem", "A mensagem de erro", "Cole exatamente o que apareceu", true)}
      {campo("contexto", "O que você estava fazendo", "Contexto em uma linha")}
      {campo("causa", "A causa real", "Não o sintoma. O motivo de verdade.")}
      {campo("solucao", "Como resolveu", "O que funcionou, e por quê")}

      <button type="button" className="bt" style={{ marginBottom: 26 }} onClick={salvar} disabled={!f.mensagem.trim()}>
        <Plus size={18} /> Registrar erro
      </button>

      {progresso.erros.length > 0 && (
        <input type="search" className="busca" value={busca} onChange={(ev) => setBusca(ev.target.value)}
          placeholder="Buscar nos seus erros" aria-label="Buscar nos seus erros" style={{ marginBottom: 18 }} />
      )}

      {lista.length === 0 ? (
        <div className="vazio">
          {progresso.erros.length === 0
            ? "Nenhum erro registrado ainda. O primeiro costuma aparecer na instalação do Python."
            : "Nada encontrado com esse termo."}
        </div>
      ) : lista.map((e) => (
        <div className="perg" key={e.id}>
          <div className="perg-cab">
            <span className="perg-p" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--f-code)" }}>{e.mensagem}</span>
            <button type="button" className="lixo" onClick={() => acoes.apagarErro(e.id)} aria-label="Apagar erro"><Trash2 size={15} /></button>
          </div>
          <div className="perg-tema">{e.dia}</div>
          {e.contexto && <div className="perg-bl"><div className="rotulo">Contexto</div><div className="perg-d">{e.contexto}</div></div>}
          {e.causa && <div className="perg-bl"><div className="rotulo">Causa</div><div className="perg-d">{e.causa}</div></div>}
          {e.solucao && <div className="perg-bl"><div className="rotulo">Solução</div><div className="perg-d">{e.solucao}</div></div>}
        </div>
      ))}
    </>
  );
}

/* ── Glossário ────────────────────────────────────────────────── */

function Glossario({ termos }: { termos: Termo[] }) {
  const [busca, setBusca] = useState("");
  const [area, setArea] = useState("Todas");
  const areas = ["Todas", ...Array.from(new Set(termos.map((t) => t.area)))];

  const b = busca.trim().toLowerCase();
  const lista = termos.filter((t) =>
    (area === "Todas" || t.area === area) &&
    (!b || t.termo.toLowerCase().includes(b) || t.definicao.toLowerCase().includes(b))
  );

  return (
    <>
      <h2 className="h2">Glossário</h2>
      <p className="sub">
        {termos.length} termos. Quando esbarrar numa palavra que não conhece, procure aqui antes
        de abrir outra aba.
      </p>

      <input type="search" className="busca" value={busca} onChange={(ev) => setBusca(ev.target.value)}
        placeholder="Buscar termo ou definição" aria-label="Buscar termo ou definição" style={{ marginBottom: 14 }} />

      <div className="linha-bt" style={{ flexWrap: "wrap" }} role="radiogroup" aria-label="Área">
        {areas.map((a) => (
          <button key={a} type="button" role="radio" aria-checked={area === a}
            className={`pill ${area === a ? "on" : ""}`} onClick={() => setArea(a)} style={{ flex: "1 1 28%" }}>{a}</button>
        ))}
      </div>

      {lista.length === 0
        ? <div className="vazio">Nenhum termo encontrado. Se é uma palavra que deveria estar aqui, ela entra em content/glossario.json.</div>
        : lista.map((t) => (
          <div className="termo" key={t.termo}>
            <div className="termo-t">{t.termo}<span className="termo-a">{t.area}</span></div>
            <div className="termo-d">{t.definicao}</div>
          </div>
        ))}
    </>
  );
}
