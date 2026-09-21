import "server-only";
import { db } from "@/lib/db";
import { Demanda } from "@/lib/conteudo";
import type { Energia, Fonte, Tema } from "@/lib/constantes";
import type { OrigemSessao, Preferencias, Progresso } from "@/lib/modelo";
import { META_PADRAO } from "@/lib/constantes";

/** Só as preferências, para o <html> (tema e fonte) sem carregar o progresso todo. */
export async function preferencias(usuarioId: string): Promise<Preferencias> {
  const u = await db.usuario.findUnique({
    where: { id: usuarioId },
    select: { metaSemanal: true, energia: true, tema: true, fonte: true },
  });
  return {
    meta: u?.metaSemanal ?? META_PADRAO,
    energia: (u?.energia as Energia) ?? "media",
    tema: (u?.tema as Tema) ?? "escuro",
    fonte: (u?.fonte as Fonte) ?? 1,
  };
}

/** Monta o Progresso inteiro de um usuário. Chamado uma vez por requisição, no layout. */
export async function carregarProgresso(usuarioId: string): Promise<Progresso> {
  const u = await db.usuario.findUniqueOrThrow({
    where: { id: usuarioId },
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
    foco: u.foco,
  };
}

/** Demanda gerada por IA, pelo id que está dentro do JSON (não o id da linha). */
export async function demandaGerada(usuarioId: string, id: string) {
  const linhas = await db.demandaGerada.findMany({ where: { usuarioId } });
  for (const l of linhas) {
    const r = Demanda.safeParse(JSON.parse(l.json));
    if (r.success && r.data.id === id) return r.data;
  }
  return null;
}

/** Salva uma demanda gerada por IA (JSON no formato Demanda). */
export async function salvarDemandaGerada(usuarioId: string, demanda: unknown) {
  await db.demandaGerada.create({ data: { usuarioId, json: JSON.stringify(demanda) } });
}
