"use client";

// Progresso do usuário no cliente. O layout carrega o estado inicial do banco;
// cada ação atualiza a tela na hora e grava no servidor em seguida.
// Se a gravação falhar, um aviso aparece e a próxima ação tenta de novo.

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import * as servidor from "@/lib/acoes";
import { hoje, segundosParaMinutos } from "@/lib/datas";
import { ESCALA, type Energia, type Fonte } from "@/lib/constantes";
import { novoId, VAZIO, type Erro, type Nota, type Progresso } from "@/lib/modelo";

export type { Progresso, Nota, Sessao, Erro } from "@/lib/modelo";
export { diasAtivos, minutosTotais, proximaAula } from "@/lib/modelo";

/* ── Reducer ──────────────────────────────────────────────────── */

type Acao =
  | { tipo: "prefs"; prefs: Partial<Pick<Progresso, "meta" | "energia" | "tema" | "fonte">> }
  | { tipo: "concluirAula"; aulaId: string; dia: string; minutos: number }
  | { tipo: "desmarcarAula"; aulaId: string }
  | { tipo: "anotar"; nota: Nota }
  | { tipo: "apagarNota"; id: string }
  | { tipo: "registrarErro"; erro: Erro }
  | { tipo: "apagarErro"; id: string }
  | { tipo: "projeto"; projetoId: string; feito: boolean; dia: string }
  | { tipo: "demanda"; demandaId: string; dia: string; minutos: number }
  | { tipo: "treino"; treinoId: string; sozinho: boolean; dia: string; minutos: number }
  | { tipo: "prova"; provaId: string; acertos: number; total: number; dia: string; minutos: number }
  | { tipo: "adicionarGerada"; demanda: Progresso["geradas"][number] }
  | { tipo: "substituir"; progresso: Progresso };

function reduzir(p: Progresso, a: Acao): Progresso {
  switch (a.tipo) {
    case "prefs": return { ...p, ...a.prefs };

    case "concluirAula":
      return {
        ...p,
        feitas: { ...p.feitas, [a.aulaId]: a.dia },
        sessoes: [...p.sessoes, { dia: a.dia, minutos: a.minutos, origem: "aula", refId: a.aulaId }],
      };
    case "desmarcarAula": {
      const feitas = { ...p.feitas };
      delete feitas[a.aulaId];
      return { ...p, feitas };
    }

    case "anotar": return { ...p, notas: [a.nota, ...p.notas] };
    case "apagarNota": return { ...p, notas: p.notas.filter((n) => n.id !== a.id) };

    case "registrarErro": return { ...p, erros: [a.erro, ...p.erros] };
    case "apagarErro": return { ...p, erros: p.erros.filter((e) => e.id !== a.id) };

    case "projeto": {
      const projetos = { ...p.projetos };
      if (a.feito) projetos[a.projetoId] = { dia: a.dia };
      else delete projetos[a.projetoId];
      return { ...p, projetos };
    }

    case "demanda":
      return {
        ...p,
        demandas: { ...p.demandas, [a.demandaId]: { dia: a.dia, minutos: a.minutos } },
        sessoes: [...p.sessoes, { dia: a.dia, minutos: a.minutos, origem: "demanda", refId: a.demandaId }],
      };
    case "treino":
      return {
        ...p,
        treinos: { ...p.treinos, [a.treinoId]: { dia: a.dia, sozinho: a.sozinho } },
        sessoes: [...p.sessoes, { dia: a.dia, minutos: a.minutos, origem: "treino", refId: a.treinoId }],
      };
    case "prova": {
      const antes = p.provas[a.provaId];
      return {
        ...p,
        provas: {
          ...p.provas,
          [a.provaId]: {
            melhor: Math.max(a.acertos, antes?.melhor ?? 0),
            total: a.total,
            tentativas: (antes?.tentativas ?? 0) + 1,
            dia: a.dia,
          },
        },
        sessoes: [...p.sessoes, { dia: a.dia, minutos: a.minutos, origem: "prova", refId: a.provaId }],
      };
    }

    case "adicionarGerada": return { ...p, geradas: [a.demanda, ...p.geradas] };

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
  registrarErro: (campos: { mensagem: string; contexto?: string; causa?: string; solucao?: string }) => void;
  apagarErro: (id: string) => void;
  alternarProjeto: (projetoId: string) => void;
  entregarDemanda: (demandaId: string, segundos: number) => void;
  resolverTreino: (treinoId: string, sozinho: boolean, segundos: number) => void;
  registrarProva: (provaId: string, acertos: number, total: number, segundos: number) => void;
  apagarTudo: () => void;
  /** Adiciona uma demanda gerada por IA (já salva no servidor pela rota). */
  adicionarGerada: (demanda: Progresso["geradas"][number]) => void;
  /** Troca o estado inteiro (usado pelo importador, que já gravou no servidor). */
  substituir: (p: Progresso) => void;
};

type Valor = { progresso: Progresso; acoes: Acoes; falha: string | null };

const Ctx = createContext<Valor | null>(null);

export function ProgressoProvider({ inicial, children }: { inicial: Progresso; children: ReactNode }) {
  const [progresso, despachar] = useReducer(reduzir, inicial);
  const [falha, setFalha] = useState<string | null>(null);

  // Tema e escala de fonte vivem no <html>. O servidor já manda certo; isto cobre as trocas.
  useEffect(() => {
    const raiz = document.documentElement;
    raiz.dataset.tema = progresso.tema;
    raiz.style.setProperty("--esc", String(ESCALA[progresso.fonte]));
  }, [progresso.tema, progresso.fonte]);

  const acoes = useMemo<Acoes>(() => {
    // atualiza a tela primeiro, grava depois; falha vira aviso, não tela travada
    const executar = (acao: Acao, gravar: () => Promise<unknown>) => {
      despachar(acao);
      gravar().then(
        () => setFalha(null),
        (e) => {
          console.error("não salvou:", e);
          setFalha("A última ação não foi salva. Ela aparece na tela, mas some ao recarregar. Tente de novo.");
        },
      );
    };
    const prefs = (p: Acao & { tipo: "prefs" }) => executar(p, () => servidor.salvarPreferencias(p.prefs));

    return {
      setEnergia: (energia) => prefs({ tipo: "prefs", prefs: { energia } }),
      alternarTema: () => prefs({ tipo: "prefs", prefs: { tema: progresso.tema === "claro" ? "escuro" : "claro" } }),
      proximaFonte: () => prefs({ tipo: "prefs", prefs: { fonte: ((progresso.fonte + 1) % 3) as Fonte } }),
      setMeta: (meta) => prefs({ tipo: "prefs", prefs: { meta } }),

      concluirAula: (aulaId, segundos) => {
        const dia = hoje(), minutos = segundosParaMinutos(segundos);
        executar({ tipo: "concluirAula", aulaId, dia, minutos }, () => servidor.concluirAula(aulaId, dia, minutos));
      },
      desmarcarAula: (aulaId) => executar({ tipo: "desmarcarAula", aulaId }, () => servidor.desmarcarAula(aulaId)),

      anotar: (texto, aula) => {
        const nota: Nota = { id: novoId(), texto, dia: hoje(), ...(aula && { aulaId: aula.id, aulaTitulo: aula.titulo }) };
        executar({ tipo: "anotar", nota }, () => servidor.salvarNota(nota));
      },
      apagarNota: (id) => executar({ tipo: "apagarNota", id }, () => servidor.apagarNota(id)),

      registrarErro: (campos) => {
        const erro: Erro = { id: novoId(), dia: hoje(), ...campos };
        executar({ tipo: "registrarErro", erro }, () => servidor.registrarErro(erro));
      },
      apagarErro: (id) => executar({ tipo: "apagarErro", id }, () => servidor.apagarErro(id)),

      alternarProjeto: (projetoId) => {
        const feito = !progresso.projetos[projetoId], dia = hoje();
        executar({ tipo: "projeto", projetoId, feito, dia }, () => servidor.marcarProjeto(projetoId, feito, dia));
      },

      entregarDemanda: (demandaId, segundos) => {
        const dia = hoje(), minutos = segundosParaMinutos(segundos);
        executar({ tipo: "demanda", demandaId, dia, minutos }, () => servidor.entregarDemanda(demandaId, dia, minutos));
      },
      resolverTreino: (treinoId, sozinho, segundos) => {
        const dia = hoje(), minutos = segundosParaMinutos(segundos);
        executar({ tipo: "treino", treinoId, sozinho, dia, minutos }, () => servidor.resolverTreino(treinoId, sozinho, dia, minutos));
      },
      registrarProva: (provaId, acertos, total, segundos) => {
        const dia = hoje(), minutos = segundosParaMinutos(segundos);
        executar({ tipo: "prova", provaId, acertos, total, dia, minutos }, () => servidor.registrarProva(provaId, acertos, total, dia, minutos));
      },

      // preserva tema e fonte, como a spec pede
      apagarTudo: () => executar(
        { tipo: "substituir", progresso: { ...VAZIO, tema: progresso.tema, fonte: progresso.fonte } },
        () => servidor.apagarTudo(),
      ),
      adicionarGerada: (demanda) => despachar({ tipo: "adicionarGerada", demanda }),
      substituir: (p) => despachar({ tipo: "substituir", progresso: p }),
    };
  }, [progresso.tema, progresso.fonte, progresso.projetos]);

  const valor = useMemo(() => ({ progresso, acoes, falha }), [progresso, acoes, falha]);
  return <Ctx.Provider value={valor}>{children}</Ctx.Provider>;
}

export function useProgresso() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useProgresso precisa estar dentro de <ProgressoProvider>");
  return ctx;
}
