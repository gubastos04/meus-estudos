// Formato do progresso como as telas enxergam. Puro: sem React, sem banco.
// O servidor monta este objeto a partir do Prisma; o cliente o mantém e atualiza.

import { ultimosDias } from "@/lib/datas";
import { META_PADRAO, type Energia, type Fonte, type Tema } from "@/lib/constantes";
import type { Demanda } from "@/lib/conteudo";

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
  foco: string | null;
  stack: string | null;   // stack do foco back-end
};

export const VAZIO: Progresso = {
  feitas: {}, sessoes: [], notas: [], erros: [],
  demandas: {}, treinos: {}, projetos: {}, provas: {}, geradas: [],
  meta: META_PADRAO, energia: "media", tema: "escuro", fonte: 1, foco: null, stack: null,
};

export type Preferencias = Pick<Progresso, "meta" | "energia" | "tema" | "fonte" | "stack">;

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

export const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
