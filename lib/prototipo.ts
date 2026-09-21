// Lê o JSON que o protótipo (Centro) salvava em window.storage, chave "centro:estado:v1".
// Formato documentado em docs/formato-prototipo.md. Puro: sem banco, sem React.

import { z } from "zod";
import { Demanda } from "@/lib/conteudo";
import { novoId, type Progresso } from "@/lib/modelo";

const dia = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data no formato AAAA-MM-DD");
const texto = z.string();

const Antigo = z.object({
  feitas: z.record(z.string(), dia).default({}),
  sessoes: z.array(z.object({
    d: dia, min: z.number(),
    aula: z.string().optional(), demanda: z.string().optional(),
    treino: z.string().optional(), prova: z.string().optional(),
  })).default([]),
  notas: z.array(z.object({
    id: z.union([z.number(), z.string()]), t: texto, d: dia,
    aula: z.string().nullish(), aulaT: z.string().nullish(),
  })).default([]),
  erros: z.array(z.object({
    id: z.union([z.number(), z.string()]), d: dia, msg: texto,
    onde: texto.optional(), causa: texto.optional(), sol: texto.optional(),
  })).default([]),
  demandas: z.record(z.string(), z.object({ d: dia, min: z.number() })).default({}),
  treinos: z.record(z.string(), z.object({ d: dia, sozinho: z.boolean() })).default({}),
  projetos: z.record(z.string(), z.object({ d: dia })).default({}),
  provas: z.record(z.string(), z.object({ melhor: z.number(), total: z.number(), tentativas: z.number(), d: dia })).default({}),
  geradas: z.array(z.record(z.string(), z.unknown())).default([]),
  meta: z.number().int().min(2).max(5).default(3),
  energia: z.enum(["baixa", "media", "alta"]).default("media"),
  tema: z.enum(["escuro", "claro"]).default("escuro"),
  fonte: z.union([z.literal(0), z.literal(1), z.literal(2)]).default(1),
});

export type Leitura =
  | { ok: true; progresso: Progresso; geradasIgnoradas: number }
  | { ok: false; erro: string };

/** "Ticket #4412" do protótipo vira canal "Ticket" e numero "#4412". */
function converterGerada(g: Record<string, unknown>) {
  const canalBruto = typeof g.canal === "string" ? g.canal : "";
  const [canal, numero] = canalBruto.split(" ");
  const { gerada: _ignorado, ...resto } = g;
  void _ignorado;
  return Demanda.safeParse({ ...resto, canal, ...(numero && { numero }) });
}

export function lerPrototipo(bruto: string): Leitura {
  let json: unknown;
  try {
    json = JSON.parse(bruto);
  } catch {
    return { ok: false, erro: "Isso não é JSON válido. Cole o valor inteiro, começando em { e terminando em }." };
  }
  // o protótipo às vezes era exportado como { key, value: "<json>" }
  if (json && typeof json === "object" && "value" in json && typeof (json as { value: unknown }).value === "string") {
    try { json = JSON.parse((json as { value: string }).value); } catch { /* segue com o objeto externo */ }
  }

  const r = Antigo.safeParse(json);
  if (!r.success) return { ok: false, erro: `O JSON não tem o formato do protótipo:\n${z.prettifyError(r.error)}` };
  const a = r.data;

  const geradas = a.geradas.map(converterGerada);

  const progresso: Progresso = {
    feitas: a.feitas,
    sessoes: a.sessoes.flatMap((s) => {
      const par = s.aula ? ["aula", s.aula] : s.demanda ? ["demanda", s.demanda]
        : s.treino ? ["treino", s.treino] : s.prova ? ["prova", s.prova] : null;
      if (!par) return [];
      const [origem, refId] = par as [Progresso["sessoes"][number]["origem"], string];
      return [{ dia: s.d, minutos: Math.max(1, Math.round(s.min)), origem, refId }];
    }),
    notas: a.notas.map((n) => ({
      id: novoId(), texto: n.t, dia: n.d,
      ...(n.aula && { aulaId: n.aula }), ...(n.aulaT && { aulaTitulo: n.aulaT }),
    })),
    erros: a.erros.map((e) => ({
      id: novoId(), dia: e.d, mensagem: e.msg,
      ...(e.onde && { contexto: e.onde }), ...(e.causa && { causa: e.causa }), ...(e.sol && { solucao: e.sol }),
    })),
    demandas: Object.fromEntries(Object.entries(a.demandas).map(([k, v]) => [k, { dia: v.d, minutos: v.min }])),
    treinos: Object.fromEntries(Object.entries(a.treinos).map(([k, v]) => [k, { dia: v.d, sozinho: v.sozinho }])),
    projetos: Object.fromEntries(Object.entries(a.projetos).map(([k, v]) => [k, { dia: v.d }])),
    provas: Object.fromEntries(Object.entries(a.provas).map(([k, v]) => [k, { melhor: v.melhor, total: v.total, tentativas: v.tentativas, dia: v.d }])),
    geradas: geradas.flatMap((g) => (g.success ? [g.data] : [])),
    meta: a.meta, energia: a.energia, tema: a.tema, fonte: a.fonte, foco: null,
  };

  return { ok: true, progresso, geradasIgnoradas: geradas.filter((g) => !g.success).length };
}

/** Contagens para o usuário conferir antes de importar. */
export function resumir(p: Progresso) {
  return {
    aulas: Object.keys(p.feitas).length,
    minutos: p.sessoes.reduce((s, x) => s + x.minutos, 0),
    sessoes: p.sessoes.length,
    notas: p.notas.length,
    erros: p.erros.length,
    demandas: Object.keys(p.demandas).length,
    treinos: Object.keys(p.treinos).length,
    projetos: Object.keys(p.projetos).length,
    provas: Object.keys(p.provas).length,
    geradas: p.geradas.length,
  };
}
