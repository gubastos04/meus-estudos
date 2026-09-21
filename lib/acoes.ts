"use server";

// Ações que gravam progresso. Chamadas pelo cliente (lib/progresso.tsx)
// depois de já ter atualizado a tela; se falharem, o cliente avisa.
// O usuário vem SEMPRE da sessão (cookie), nunca do cliente — é a garantia
// de que ninguém mexe no progresso de outra pessoa. O dia vem do cliente
// (o servidor pode estar em outro fuso).

import { z } from "zod";
import { db } from "@/lib/db";
import { requisitarUsuario } from "@/lib/auth";
import { cifrar } from "@/lib/cripto";
import { lerPrototipo, resumir } from "@/lib/prototipo";
import { focoValido } from "@/lib/conteudo";
import type { Erro, Nota, Preferencias, Progresso } from "@/lib/modelo";

const Dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Id = z.string().min(1).max(64);

const uid = async () => (await requisitarUsuario()).id;

const Prefs = z.object({
  meta: z.number().int().min(2).max(5).optional(),
  energia: z.enum(["baixa", "media", "alta"]).optional(),
  tema: z.enum(["escuro", "claro"]).optional(),
  fonte: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
});

export async function salvarPreferencias(prefs: Partial<Preferencias>) {
  const p = Prefs.parse(prefs);
  await db.usuario.update({
    where: { id: await uid() },
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
  const usuarioId = await uid();
  const min = Math.max(1, Math.round(minutos));
  await db.$transaction([
    db.aulaFeita.upsert({
      where: { usuarioId_aulaId: { usuarioId, aulaId } },
      update: { dia },
      create: { usuarioId, aulaId, dia },
    }),
    db.sessao.create({ data: { usuarioId, dia, minutos: min, origem: "aula", refId: aulaId } }),
  ]);
}

export async function desmarcarAula(aulaId: string) {
  Id.parse(aulaId);
  await db.aulaFeita.deleteMany({ where: { usuarioId: await uid(), aulaId } });
}

export async function salvarNota(nota: Nota) {
  const n = z.object({
    id: Id, texto: z.string().min(1).max(5000), dia: Dia,
    aulaId: Id.optional(), aulaTitulo: z.string().max(200).optional(),
  }).parse(nota);
  await db.nota.create({ data: { ...n, usuarioId: await uid() } });
}

export async function apagarNota(id: string) {
  Id.parse(id);
  await db.nota.deleteMany({ where: { usuarioId: await uid(), id } });
}

export async function registrarErro(erro: Erro) {
  const e = z.object({
    id: Id, dia: Dia, mensagem: z.string().min(1).max(5000),
    contexto: z.string().max(2000).optional(), causa: z.string().max(5000).optional(), solucao: z.string().max(5000).optional(),
  }).parse(erro);
  await db.erro.create({ data: { ...e, usuarioId: await uid() } });
}

export async function apagarErro(id: string) {
  Id.parse(id);
  await db.erro.deleteMany({ where: { usuarioId: await uid(), id } });
}

export async function marcarProjeto(projetoId: string, feito: boolean, dia: string) {
  Id.parse(projetoId); Dia.parse(dia);
  const usuarioId = await uid();
  if (feito) {
    await db.projetoFeito.upsert({
      where: { usuarioId_projetoId: { usuarioId, projetoId } },
      update: { dia },
      create: { usuarioId, projetoId, dia },
    });
  } else {
    await db.projetoFeito.deleteMany({ where: { usuarioId, projetoId } });
  }
}

export async function entregarDemanda(demandaId: string, dia: string, minutos: number) {
  Id.parse(demandaId); Dia.parse(dia);
  const usuarioId = await uid();
  const min = Math.max(1, Math.round(minutos));
  await db.$transaction([
    db.demandaFeita.upsert({
      where: { usuarioId_demandaId: { usuarioId, demandaId } },
      update: { dia, minutos: min },
      create: { usuarioId, demandaId, dia, minutos: min },
    }),
    db.sessao.create({ data: { usuarioId, dia, minutos: min, origem: "demanda", refId: demandaId } }),
  ]);
}

export async function resolverTreino(treinoId: string, sozinho: boolean, dia: string, minutos: number) {
  Id.parse(treinoId); Dia.parse(dia); z.boolean().parse(sozinho);
  const usuarioId = await uid();
  const min = Math.max(1, Math.round(minutos));
  await db.$transaction([
    db.treinoFeito.upsert({
      where: { usuarioId_treinoId: { usuarioId, treinoId } },
      update: { dia, sozinho },
      create: { usuarioId, treinoId, dia, sozinho },
    }),
    db.sessao.create({ data: { usuarioId, dia, minutos: min, origem: "treino", refId: treinoId } }),
  ]);
}

/** Guarda a melhor nota e conta a tentativa. Nunca diminui a melhor. */
export async function registrarProva(provaId: string, acertos: number, total: number, dia: string, minutos: number) {
  Id.parse(provaId); Dia.parse(dia);
  z.number().int().min(0).parse(acertos); z.number().int().positive().parse(total);
  const usuarioId = await uid();
  const min = Math.max(1, Math.round(minutos));
  const antes = await db.provaFeita.findUnique({ where: { usuarioId_provaId: { usuarioId, provaId } } });
  await db.$transaction([
    db.provaFeita.upsert({
      where: { usuarioId_provaId: { usuarioId, provaId } },
      update: { melhor: Math.max(acertos, antes?.melhor ?? 0), total, tentativas: (antes?.tentativas ?? 0) + 1, dia },
      create: { usuarioId, provaId, melhor: acertos, total, tentativas: 1, dia },
    }),
    db.sessao.create({ data: { usuarioId, dia, minutos: min, origem: "prova", refId: provaId } }),
  ]);
}

/** Apaga o progresso do usuário, preservando conta, tema e tamanho de fonte (seção 6.7). */
export async function apagarTudo() {
  const usuarioId = await uid();
  const onde = { where: { usuarioId } };
  await db.$transaction([
    db.aulaFeita.deleteMany(onde),
    db.sessao.deleteMany(onde),
    db.nota.deleteMany(onde),
    db.erro.deleteMany(onde),
    db.demandaFeita.deleteMany(onde),
    db.treinoFeito.deleteMany(onde),
    db.projetoFeito.deleteMany(onde),
    db.provaFeita.deleteMany(onde),
    db.demandaGerada.deleteMany(onde),
    db.usoIA.deleteMany(onde),
    db.usuario.update({ where: { id: usuarioId }, data: { metaSemanal: 3, energia: "media" } }),
  ]);
}

/* ── Chave de IA por usuário (cada um paga o seu) ─────────────── */

export async function salvarChaveIA(chave: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  const c = chave.trim();
  if (!c.startsWith("sk-ant-")) return { ok: false, erro: "Isso não parece uma chave da Anthropic (começa com sk-ant-)." };
  try {
    await db.usuario.update({ where: { id: await uid() }, data: { iaChave: cifrar(c) } });
    return { ok: true };
  } catch {
    return { ok: false, erro: "O servidor não está configurado para guardar a chave com segurança (falta APP_SECRET)." };
  }
}

export async function removerChaveIA() {
  await db.usuario.update({ where: { id: await uid() }, data: { iaChave: null } });
}

/* ── Foco (área de estudo) ────────────────────────────────────── */

export async function escolherFoco(foco: string): Promise<{ ok: true } | { ok: false; erro: string }> {
  if (!focoValido(foco)) return { ok: false, erro: "Esse foco não existe." };
  await db.usuario.update({ where: { id: await uid() }, data: { foco } });
  return { ok: true };
}

/* ── Importação do protótipo ──────────────────────────────────── */

export async function conferirPrototipo(bruto: string) {
  await requisitarUsuario();
  const r = lerPrototipo(bruto);
  if (!r.ok) return { ok: false as const, erro: r.erro };
  return { ok: true as const, resumo: resumir(r.progresso), geradasIgnoradas: r.geradasIgnoradas };
}

/** Substitui o progresso do usuário pelo do protótipo. Mantém conta e senha. */
export async function importarPrototipo(bruto: string): Promise<{ ok: true; progresso: Progresso } | { ok: false; erro: string }> {
  const usuarioId = await uid();
  const r = lerPrototipo(bruto);
  if (!r.ok) return { ok: false, erro: r.erro };
  const p = r.progresso;
  const u = usuarioId;
  const onde = { where: { usuarioId } };

  await db.$transaction([
    db.aulaFeita.deleteMany(onde), db.sessao.deleteMany(onde), db.nota.deleteMany(onde), db.erro.deleteMany(onde),
    db.demandaFeita.deleteMany(onde), db.treinoFeito.deleteMany(onde), db.projetoFeito.deleteMany(onde),
    db.provaFeita.deleteMany(onde), db.demandaGerada.deleteMany(onde),
    db.usuario.update({ where: { id: u }, data: { metaSemanal: p.meta, energia: p.energia, tema: p.tema, fonte: p.fonte } }),
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
