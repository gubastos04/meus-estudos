"use client";

// Progresso do usuário. Fase 1: só em memória, some ao recarregar.
// A Fase 2 troca o miolo deste arquivo por leitura/escrita no banco
// sem mudar a interface que as telas usam (useProgresso).

import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import { hoje, segundosParaMinutos, ultimosDias } from "@/lib/datas";
import { ESCALA, META_PADRAO, type Energia, type Fonte, type Tema } from "@/lib/constantes";
import type { Demanda } from "@/lib/conteudo";

/* ── Modelo ───────────────────────────────────────────────────── */

export type OrigemSessao = "aula" | "demanda" | "treino" | "prova";

export type Sessao = { dia: string; minutos: number; origem: OrigemSessao; refId: string };
export type Nota = { id: string; texto: string; dia: string; aulaId?: string; aulaTitulo?: string };
export type Erro = { id: string; dia: string; mensagem: string; contexto?: string; causa?: string; solucao?: string };

export type Progresso = {
  feitas: Record<string, string>;                       // aulaId -> dia
  sessoes: Sessao[];
  notas: Nota[];
  erros: Erro[];
  demandas: Record<string, { dia: string; minutos: number }>;
  treinos: Record<string, { dia: string; sozinho: boolean }>;
  projetos: Record<string, { dia: string }>;
  provas: Record<string, { melhor: number; total: number; tentativas: number; dia: string }>;
  geradas: Demanda[];
  meta: number;
  energia: Energia;
  tema: Tema;
  fonte: Fonte;
};

export const VAZIO: Progresso = {
  feitas: {}, sessoes: [], notas: [], erros: [],
  demandas: {}, treinos: {}, projetos: {}, provas: {}, geradas: [],
  meta: META_PADRAO, energia: "media", tema: "escuro", fonte: 1,
};

/* ── Derivados ────────────────────────────────────────────────── */

export const minutosTotais = (p: Progresso) => p.sessoes.reduce((s, x) => s + x.minutos, 0);

/** Dias distintos com sessão nos últimos 7 dias. É a métrica da meta semanal. */
export function diasAtivos(p: Progresso): number {
  const janela = ultimosDias(7);
  return new Set(p.sessoes.map((s) => s.dia).filter((d) => janela.has(d))).size;
}

/** Próxima aula não concluída que já tem conteúdo escrito. Aula só com título é pulada. */
export function proximaAula<T extends { id: string; temConteudo: boolean }>(aulas: T[], p: Progresso): T | null {
  return aulas.find((a) => !p.feitas[a.id] && a.temConteudo) ?? null;
}

/* ── Reducer ──────────────────────────────────────────────────── */

type Acao =
  | { tipo: "energia"; energia: Energia }
  | { tipo: "tema"; tema: Tema }
  | { tipo: "fonte"; fonte: Fonte }
  | { tipo: "meta"; meta: number }
  | { tipo: "concluirAula"; aulaId: string; segundos: number }
  | { tipo: "desmarcarAula"; aulaId: string }
  | { tipo: "anotar"; texto: string; aula?: { id: string; titulo: string } }
  | { tipo: "apagarNota"; id: string }
  | { tipo: "alternarProjeto"; projetoId: string }
  | { tipo: "substituir"; progresso: Progresso };

const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

function reduzir(p: Progresso, a: Acao): Progresso {
  switch (a.tipo) {
    case "energia": return { ...p, energia: a.energia };
    case "tema": return { ...p, tema: a.tema };
    case "fonte": return { ...p, fonte: a.fonte };
    case "meta": return { ...p, meta: a.meta };

    case "concluirAula": {
      const dia = hoje();
      return {
        ...p,
        feitas: { ...p.feitas, [a.aulaId]: dia },
        sessoes: [...p.sessoes, { dia, minutos: segundosParaMinutos(a.segundos), origem: "aula", refId: a.aulaId }],
      };
    }
    case "desmarcarAula": {
      const feitas = { ...p.feitas };
      delete feitas[a.aulaId];
      return { ...p, feitas };
    }

    case "anotar": {
      const nota: Nota = {
        id: novoId(), texto: a.texto, dia: hoje(),
        ...(a.aula && { aulaId: a.aula.id, aulaTitulo: a.aula.titulo }),
      };
      return { ...p, notas: [nota, ...p.notas] };
    }
    case "apagarNota": return { ...p, notas: p.notas.filter((n) => n.id !== a.id) };

    case "alternarProjeto": {
      const projetos = { ...p.projetos };
      if (projetos[a.projetoId]) delete projetos[a.projetoId];
      else projetos[a.projetoId] = { dia: hoje() };
      return { ...p, projetos };
    }

    case "substituir": return a.progresso;
  }
}

/* ── Contexto ─────────────────────────────────────────────────── */

type Acoes = {
  setEnergia: (e: Energia) => void;
  alternarTema: () => void;
  proximaFonte: () => void;
  setMeta: (n: number) => void;
  concluirAula: (aulaId: string, segundos: number) => void;
  desmarcarAula: (aulaId: string) => void;
  anotar: (texto: string, aula?: { id: string; titulo: string }) => void;
  apagarNota: (id: string) => void;
  alternarProjeto: (projetoId: string) => void;
  apagarTudo: () => void;
};

const Ctx = createContext<{ progresso: Progresso; acoes: Acoes } | null>(null);

export function ProgressoProvider({ children }: { children: ReactNode }) {
  const [progresso, despachar] = useReducer(reduzir, VAZIO);

  // Tema e escala de fonte vivem no <html>, para o CSS inteiro reagir.
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.tema = progresso.tema;
    raiz.style.setProperty("--esc", String(ESCALA[progresso.fonte]));
  }, [progresso.tema, progresso.fonte]);

  const d = despachar; // estável entre renders, por contrato do useReducer
  const acoes = useMemo<Acoes>(() => ({
    setEnergia: (energia) => d({ tipo: "energia", energia }),
    alternarTema: () => d({ tipo: "tema", tema: progresso.tema === "claro" ? "escuro" : "claro" }),
    proximaFonte: () => d({ tipo: "fonte", fonte: ((progresso.fonte + 1) % 3) as Fonte }),
    setMeta: (meta) => d({ tipo: "meta", meta }),
    concluirAula: (aulaId, segundos) => d({ tipo: "concluirAula", aulaId, segundos }),
    desmarcarAula: (aulaId) => d({ tipo: "desmarcarAula", aulaId }),
    anotar: (texto, aula) => d({ tipo: "anotar", texto, aula }),
    apagarNota: (id) => d({ tipo: "apagarNota", id }),
    alternarProjeto: (projetoId) => d({ tipo: "alternarProjeto", projetoId }),
    // preserva tema e fonte, como a spec pede
    apagarTudo: () => d({ tipo: "substituir", progresso: { ...VAZIO, tema: progresso.tema, fonte: progresso.fonte } }),
  }), [d, progresso.tema, progresso.fonte]);

  const valor = useMemo(() => ({ progresso, acoes }), [progresso, acoes]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useProgresso() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgresso precisa estar dentro de <ProgressoProvider>");
  return ctx;
}
