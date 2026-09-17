"use server";

// Ações que gravam progresso. Chamadas pelo cliente (lib/progresso.tsx)
// depois de já ter atualizado a tela; se falharem, o cliente avisa.
// O dia sempre vem do cliente: o servidor pode estar em outro fuso.

import { z } from "zod";
import { db } from "@/lib/db";
import { garantirUsuario, USUARIO_ID } from "@/lib/progresso-servidor";
import { lerPrototipo, resumir } from "@/lib/prototipo";
import type { Erro, Nota, Preferencias, Progresso } from "@/lib/modelo";

const Dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Id = z.string().min(1).max(64);

const Prefs = z.object({
  meta: z.number().int().min(2).max(5).optional(),
  energia: z.enum(["baixa", "media", "alta"]).optional(),
  tema: z.enum(["escuro", "claro"]).optional(),
  fonte: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export async function salvarPreferencias(prefs: Partial<Preferencias>) {
  const p = Prefs.parse(prefs);
  await garantirUsuario();
  await db.usuario.update({
    where: { id: USUARIO_ID },
    data: {
      ...(p.meta !== undefined && { metaSemanal: p.meta }),
      ...(p.energia && { energia: p.energia }),
      ...(p.tema && { tema: p.tema }),
      ...(p.fonte !== undefined && { fonte: p.fonte }),
    },
  });
}

export async function concluirAula(aulaId: string, dia: string, minutos: number) {
  Id.parse(aulaId); Dia.parse(dia);
  const min = Math.max(1, Math.round(minutos));
  await garantirUsuario();
  await db.$transaction([
    db.aulaFeita.upsert({
      where: { usuarioId_aulaId: { usuarioId: USUARIO_ID, aulaId } },
      update: { dia },
      create: { usuarioId: USUARIO_ID, aulaId, dia },
    }),
    db.sessao.create({ data: { usuarioId: USUARIO_ID, dia, minutos: min, origem: "aula", refId: aulaId } }),
  ]);
}

export async function desmarcarAula(aulaId: string) {
  Id.parse(aulaId);
  await db.aulaFeita.deleteMany({ where: { usuarioId: USUARIO_ID, aulaId } });
}

export async function salvarNota(nota: Nota) {
  const n = z.object({
    id: Id, texto: z.string().min(1).max(5000), dia: Dia,
    aulaId: Id.optional(), aulaTitulo: z.string().max(200).optional(),
  }).parse(nota);
  await garantirUsuario();
  await db.nota.create({ data: { ...n, usuarioId: USUARIO_ID } });
}

export async function apagarNota(id: string) {
  Id.parse(id);
  await db.nota.deleteMany({ where: { usuarioId: USUARIO_ID, id } });
}

export async function registrarErro(erro: Erro) {
  const e = z.object({
    id: Id, dia: Dia, mensagem: z.string().min(1).max(5000),
    contexto: z.string().max(2000).optional(), causa: z.string().max(5000).optional(), solucao: z.string().max(5000).optional(),
  }).parse(erro);
  await garantirUsuario();
  await db.erro.create({ data: { ...e, usuarioId: USUARIO_ID } });
}

export async function apagarErro(id: string) {
  Id.parse(id);
  await db.erro.deleteMany({ where: { usuarioId: USUARIO_ID, id } });
}

export async function marcarProjeto(projetoId: string, feito: boolean, dia: string) {
  Id.parse(projetoId); Dia.parse(dia);
  await garantirUsuario();
  if (feito) {
    await db.projetoFeito.upsert({
      where: { usuarioId_projetoId: { usuarioId: USUARIO_ID, projetoId } },
      update: { dia },
      create: { usuarioId: USUARIO_ID, projetoId, dia },
    });
  } else {
    await db.projetoFeito.deleteMany({ where: { usuarioId: USUARIO_ID, projetoId } });
  }
}

export async function entregarDemanda(demandaId: string, dia: string, minutos: number) {
  Id.parse(demandaId); Dia.parse(dia);
  const min = Math.max(1, Math.round(minutos));
  await garantirUsuario();
  await db.$transaction([
    db.demandaFeita.upsert({
      where: { usuarioId_demandaId: { usuarioId: USUARIO_ID, demandaId } },
      update: { dia, minutos: min },
      create: { usuarioId: USUARIO_ID, demandaId, dia, minutos: min },
    }),
    db.sessao.create({ data: { usuarioId: USUARIO_ID, dia, minutos: min, origem: "demanda", refId: demandaId } }),
  ]);
}

export async function resolverTreino(treinoId: string, sozinho: boolean, dia: string, minutos: number) {
  Id.parse(treinoId); Dia.parse(dia); z.boolean().parse(sozinho);
  const min = Math.max(1, Math.round(minutos));
  await garantirUsuario();
  await db.$transaction([
    db.treinoFeito.upsert({
      where: { usuarioId_treinoId: { usuarioId: USUARIO_ID, treinoId } },
      update: { dia, sozinho },
      create: { usuarioId: USUARIO_ID, treinoId, dia, sozinho },
    }),
    db.sessao.create({ data: { usuarioId: USUARIO_ID, dia, minutos: min, origem: "treino", refId: treinoId } }),
  ]);
}

/** Guarda a melhor nota e conta a tentativa. Nunca diminui a melhor. */
export async function registrarProva(provaId: string, acertos: number, total: number, dia: string, minutos: number) {
  Id.parse(provaId); Dia.parse(dia);
  z.number().int().min(0).parse(acertos); z.number().int().positive().parse(total);
  const min = Math.max(1, Math.round(minutos));
  await garantirUsuario();
  const antes = await db.provaFeita.findUnique({ where: { usuarioId_provaId: { usuarioId: USUARIO_ID, provaId } } });
  await db.$transaction([
    db.provaFeita.upsert({
      where: { usuarioId_provaId: { usuarioId: USUARIO_ID, provaId } },
      update: { melhor: Math.max(acertos, antes?.melhor ?? 0), total, tentativas: (antes?.tentativas ?? 0) + 1, dia },
      create: { usuarioId: USUARIO_ID, provaId, melhor: acertos, total, tentativas: 1, dia },
    }),
    db.sessao.create({ data: { usuarioId: USUARIO_ID, dia, minutos: min, origem: "prova", refId: provaId } }),
  ]);
}

/** Apaga o progresso, preservando tema e tamanho de fonte (seção 6.7). */
export async function apagarTudo() {
  const u = await garantirUsuario();
  await db.$transaction([
    db.usuario.delete({ where: { id: USUARIO_ID } }), // cascade leva as tabelas filhas
    db.usuario.create({ data: { id: USUARIO_ID, tema: u.tema, fonte: u.fonte } }),
  ]);
}

/* ── Importação do protótipo ──────────────────────────────────── */

export async function conferirPrototipo(bruto: string) {
  const r = lerPrototipo(bruto);
  if (!r.ok) return { ok: false as const, erro: r.erro };
  return { ok: true as const, resumo: resumir(r.progresso), geradasIgnoradas: r.geradasIgnoradas };
}

/** Substitui todo o progresso pelo do protótipo. Devolve o progresso já gravado. */
export async function importarPrototipo(bruto: string): Promise<{ ok: true; progresso: Progresso } | { ok: false; erro: string }> {
  const r = lerPrototipo(bruto);
  if (!r.ok) return { ok: false, erro: r.erro };
  const p = r.progresso;
  const u = USUARIO_ID;

  await db.$transaction([
    db.usuario.deleteMany({ where: { id: u } }),
    db.usuario.create({ data: { id: u, metaSemanal: p.meta, energia: p.energia, tema: p.tema, fonte: p.fonte } }),
    db.aulaFeita.createMany({ data: Object.entries(p.feitas).map(([aulaId, dia]) => ({ usuarioId: u, aulaId, dia })) }),
    db.sessao.createMany({ data: p.sessoes.map((s) => ({ usuarioId: u, ...s })) }),
    db.nota.createMany({ data: p.notas.map((n) => ({ usuarioId: u, ...n })) }),
    db.erro.createMany({ data: p.erros.map((e) => ({ usuarioId: u, ...e })) }),
    db.demandaFeita.createMany({ data: Object.entries(p.demandas).map(([demandaId, v]) => ({ usuarioId: u, demandaId, ...v })) }),
    db.treinoFeito.createMany({ data: Object.entries(p.treinos).map(([treinoId, v]) => ({ usuarioId: u, treinoId, ...v })) }),
    db.projetoFeito.createMany({ data: Object.entries(p.projetos).map(([projetoId, v]) => ({ usuarioId: u, projetoId, ...v })) }),
    db.provaFeita.createMany({ data: Object.entries(p.provas).map(([provaId, v]) => ({ usuarioId: u, provaId, ...v })) }),
    db.demandaGerada.createMany({ data: p.geradas.map((g) => ({ usuarioId: u, json: JSON.stringify(g) })) }),
  ]);

  return { ok: true, progresso: p };
}
