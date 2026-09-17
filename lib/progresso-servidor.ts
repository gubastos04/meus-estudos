import "server-only";
import { db } from "@/lib/db";
import { Demanda } from "@/lib/conteudo";
import type { Energia, Fonte, Tema } from "@/lib/constantes";
import type { OrigemSessao, Progresso } from "@/lib/modelo";

// App de uma pessoa só: um usuário fixo até a fase 6 (login).
export const USUARIO_ID = "eu";

export async function garantirUsuario() {
  return db.usuario.upsert({ where: { id: USUARIO_ID }, update: {}, create: { id: USUARIO_ID } });
}

/** Monta o Progresso inteiro a partir do banco. Chamado uma vez por requisição, no layout. */
export async function carregarProgresso(): Promise<Progresso> {
  await garantirUsuario();
  const u = await db.usuario.findUniqueOrThrow({
    where: { id: USUARIO_ID },
    include: {
      aulas: true, sessoes: true, notas: { orderBy: { em: "desc" } }, erros: { orderBy: { em: "desc" } },
      demandas: true, treinos: true, projetos: true, provas: true, geradas: { orderBy: { em: "desc" } },
    },
  });

  return {
    feitas: Object.fromEntries(u.aulas.map((a) => [a.aulaId, a.dia])),
    sessoes: u.sessoes.map((s) => ({ dia: s.dia, minutos: s.minutos, origem: s.origem as OrigemSessao, refId: s.refId })),
    notas: u.notas.map((n) => ({
      id: n.id, texto: n.texto, dia: n.dia,
      ...(n.aulaId && { aulaId: n.aulaId }), ...(n.aulaTitulo && { aulaTitulo: n.aulaTitulo }),
    })),
    erros: u.erros.map((e) => ({
      id: e.id, dia: e.dia, mensagem: e.mensagem,
      ...(e.contexto && { contexto: e.contexto }), ...(e.causa && { causa: e.causa }), ...(e.solucao && { solucao: e.solucao }),
    })),
    demandas: Object.fromEntries(u.demandas.map((d) => [d.demandaId, { dia: d.dia, minutos: d.minutos }])),
    treinos: Object.fromEntries(u.treinos.map((t) => [t.treinoId, { dia: t.dia, sozinho: t.sozinho }])),
    projetos: Object.fromEntries(u.projetos.map((p) => [p.projetoId, { dia: p.dia }])),
    provas: Object.fromEntries(u.provas.map((p) => [p.provaId, { melhor: p.melhor, total: p.total, tentativas: p.tentativas, dia: p.dia }])),
    // JSON inválido no banco é ignorado em vez de derrubar a tela
    geradas: u.geradas.flatMap((g) => {
      const r = Demanda.safeParse(JSON.parse(g.json));
      return r.success ? [r.data] : [];
    }),
    meta: u.metaSemanal,
    energia: u.energia as Energia,
    tema: u.tema as Tema,
    fonte: u.fonte as Fonte,
  };
}

/** Demanda gerada por IA, pelo id que está dentro do JSON (não o id da linha). */
export async function demandaGerada(id: string) {
  const linhas = await db.demandaGerada.findMany({ where: { usuarioId: USUARIO_ID } });
  for (const l of linhas) {
    const r = Demanda.safeParse(JSON.parse(l.json));
    if (r.success && r.data.id === id) return r.data;
  }
  return null;
}

/** Salva uma demanda gerada por IA (JSON no formato Demanda). */
export async function salvarDemandaGerada(demanda: unknown) {
  await garantirUsuario();
  await db.demandaGerada.create({ data: { usuarioId: USUARIO_ID, json: JSON.stringify(demanda) } });
}
