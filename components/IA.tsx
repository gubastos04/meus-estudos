"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { Zap } from "lucide-react";
import type { Demanda } from "@/lib/conteudo";

/* ── Ligada ou não ────────────────────────────────────────────── */

const CtxIA = createContext(false);
export function IAProvider({ ligada, children }: { ligada: boolean; children: ReactNode }) {
  return <CtxIA.Provider value={ligada}>{children}</CtxIA.Provider>;
}
export const useIA = () => useContext(CtxIA);

/** Aviso curto quando a IA está desligada. IA é botão, nunca automático (seção 7). */
export function IADesligada({ children = "Este recurso usa IA. Adicione sua chave da API em Você para ligar (cada um usa a própria e paga o próprio uso)." }: { children?: ReactNode }) {
  return <p className="nota" style={{ marginTop: 12 }}>{children}</p>;
}

/* ── Chamada genérica a uma rota /api/ia/* ────────────────────── */

async function pedir<T>(rota: string, corpo: unknown): Promise<{ ok: true; dados: T } | { ok: false; erro: string }> {
  try {
    const r = await fetch(`/api/ia/${rota}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(corpo),
    });
    const json = await r.json();
    if (json?.ok) return { ok: true, dados: json as T };
    return { ok: false, erro: typeof json?.erro === "string" ? json.erro : "Não consegui responder agora." };
  } catch {
    return { ok: false, erro: "Sem conexão com o servidor. Tenta de novo." };
  }
}

/* ── Bloco de resposta em texto (corrigir, explicar, perguntar) ─ */

export function BlocoIA({ rotulo, rotoloPensando = "Pensando...", rota, corpo, dica, desabilitado }: {
  rotulo: string; rotoloPensando?: string; rota: string; corpo: () => unknown; dica?: string; desabilitado?: boolean;
}) {
  const [estado, setEstado] = useState<"parado" | "pensando" | "pronto" | "erro">("parado");
  const [saida, setSaida] = useState("");

  const rodar = async () => {
    setEstado("pensando"); setSaida("");
    const r = await pedir<{ texto: string }>(rota, corpo());
    if (r.ok) { setSaida(r.dados.texto); setEstado("pronto"); }
    else { setSaida(r.erro); setEstado("erro"); }
  };

  return (
    <div style={{ marginTop: 14 }}>
      <button type="button" className="bt-2" onClick={rodar} disabled={desabilitado || estado === "pensando"}>
        <Zap size={16} /> {estado === "pensando" ? rotoloPensando : rotulo}
      </button>
      {dica && estado === "parado" && <p className="nota" style={{ marginTop: 9 }}>{dica}</p>}
      {saida && <div className={`ia-out ${estado === "erro" ? "erro" : ""}`}>{saida}</div>}
    </div>
  );
}

/* ── Corretor de código (aula, demanda, prova prática) ────────── */

export function Corretor({ titulo, enunciado, criterios, solucao }: {
  titulo: string; enunciado: string; criterios: string[]; solucao?: string;
}) {
  const ligada = useIA();
  const [codigo, setCodigo] = useState("");

  return (
    <div className="ia">
      <div className="ia-t"><Zap size={14} /> Corrigir o meu código</div>
      {ligada ? (
        <>
          <textarea className="campo" value={codigo} onChange={(ev) => setCodigo(ev.target.value)}
            placeholder="Cole aqui o código que você escreveu"
            style={{ fontFamily: "var(--font-mono)", fontSize: "var(--f-code)", minHeight: 120 }} />
          <BlocoIA rotulo="Corrigir" rota="corrigir"
            desabilitado={!codigo.trim()}
            dica={!codigo.trim() ? "Cole o seu código acima pra liberar o botão." : undefined}
            corpo={() => ({ titulo, enunciado, criterios, solucao, codigo })} />
        </>
      ) : (
        <IADesligada>Cole seu código e a IA corrige critério por critério, quando estiver ligada. Por enquanto, confira você mesmo pela lista acima.</IADesligada>
      )}
    </div>
  );
}

/* ── Não entendeu? Explicar de outro jeito + pergunta livre ───── */

export function NaoEntendeu({ titulo, modulo, resumo, ideia, exemplo }: {
  titulo: string; modulo: string; resumo?: string; ideia: string[]; exemplo?: string;
}) {
  const ligada = useIA();
  const [pergunta, setPergunta] = useState("");

  return (
    <div className="ia">
      <div className="ia-t"><Zap size={14} /> Não entendeu?</div>
      {ligada ? (
        <>
          <BlocoIA rotulo="Explica de outro jeito" rota="explicar"
            corpo={() => ({ titulo, modulo, resumo, ideia })} />
          <div style={{ marginTop: 22, borderTop: "1px solid var(--line)", paddingTop: 18 }}>
            <div className="rotulo">Ou pergunte direto</div>
            <textarea className="campo" value={pergunta} onChange={(ev) => setPergunta(ev.target.value)}
              placeholder="O que ficou confuso nesta aula?" style={{ minHeight: 70 }} />
            <BlocoIA rotulo="Perguntar" rota="perguntar"
              desabilitado={!pergunta.trim()}
              corpo={() => ({ titulo, modulo, resumo, ideia, exemplo, pergunta })} />
          </div>
        </>
      ) : (
        <IADesligada>Aqui a IA reexplica a aula de outro jeito e responde suas perguntas, quando estiver ligada.</IADesligada>
      )}
    </div>
  );
}

/* ── Gerar demanda (fim da lista de demandas) ─────────────────── */

export function GerarDemanda({ aulasFeitas, aoGerar }: { aulasFeitas: string[]; aoGerar: (d: Demanda) => void }) {
  const ligada = useIA();
  const [estado, setEstado] = useState<"parado" | "pensando" | "erro">("parado");
  const [erro, setErro] = useState("");

  const gerar = async () => {
    setEstado("pensando"); setErro("");
    const r = await pedir<{ demanda: Demanda }>("demanda", { aulasFeitas });
    if (r.ok) { aoGerar(r.dados.demanda); setEstado("parado"); }
    else { setErro(r.erro); setEstado("erro"); }
  };

  return (
    <div className="ia" style={{ marginTop: 24 }}>
      <div className="ia-t"><Zap size={14} /> Acabaram as demandas?</div>
      {ligada ? (
        <>
          <p className="nota" style={{ marginBottom: 12 }}>
            Gera uma demanda nova, com reviravolta e critérios, no nível do que você já estudou. Ela fica salva na lista.
          </p>
          <button type="button" className="bt" onClick={gerar} disabled={estado === "pensando"}>
            <Zap size={17} /> {estado === "pensando" ? "O gestor está digitando..." : "Gerar demanda nova"}
          </button>
          {erro && <div className="ia-out erro">{erro}</div>}
        </>
      ) : (
        <IADesligada>Quando a IA estiver ligada, dá pra gerar demandas novas no seu nível aqui. Por enquanto, as {aulasFeitas.length ? "" : ""}demandas acima já dão bastante trabalho.</IADesligada>
      )}
    </div>
  );
}
