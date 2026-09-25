// Única porta de entrada para /content. Nenhum componente importa JSON direto.
// A validação roda no carregamento do módulo: conteúdo malformado quebra o build,
// não a tela do usuário.
//
// Modelo: base comum a todos + um foco escolhido. Todo conteúdo tem foco "base"
// (visível sempre) ou o id de um foco (visível só quando aquele foco está ativo).
import { z } from "zod";

import trilhaJson from "@/content/trilha.json";
import m1 from "@/content/aulas/m1.json";
import m2 from "@/content/aulas/m2.json";
import m3 from "@/content/aulas/m3.json";
import m4 from "@/content/aulas/m4.json";
import m5 from "@/content/aulas/m5.json";
import m6 from "@/content/aulas/m6.json";
import m7 from "@/content/aulas/m7.json";
import m8 from "@/content/aulas/m8.json";
import m9 from "@/content/aulas/m9.json";
import m10 from "@/content/aulas/m10.json";
import m11 from "@/content/aulas/m11.json";
import m12 from "@/content/aulas/m12.json";
import web1 from "@/content/aulas/web1.json";
import web2 from "@/content/aulas/web2.json";
import web3 from "@/content/aulas/web3.json";
import web4 from "@/content/aulas/web4.json";
import web5 from "@/content/aulas/web5.json";
import dados1 from "@/content/aulas/dados1.json";
import dados2 from "@/content/aulas/dados2.json";
import dados3 from "@/content/aulas/dados3.json";
import dados4 from "@/content/aulas/dados4.json";
import dados5 from "@/content/aulas/dados5.json";
import backend1 from "@/content/aulas/backend1.json";
import backend2 from "@/content/aulas/backend2.json";
import backend3 from "@/content/aulas/backend3.json";
import backend4 from "@/content/aulas/backend4.json";
import backend5 from "@/content/aulas/backend5.json";
import demandasJson from "@/content/demandas.json";
import treinosJson from "@/content/treinos.json";
import projetosJson from "@/content/projetos.json";
import provasJson from "@/content/provas.json";
import glossarioJson from "@/content/glossario.json";
import entrevistaJson from "@/content/entrevista.json";
import certificadosJson from "@/content/certificados.json";

/* ── Esquemas ─────────────────────────────────────────────────── */

// foco de um conteúdo: "base" (todos) ou o id de um foco
const Foco = z.string().min(1);
// Conteúdo de apoio pode valer pra mais de um foco: "web" ou ["web", "backend"].
// Módulos continuam com um foco só.
const FocoItem = z.union([Foco, z.array(Foco).min(1)]);

const Questao = z.object({
  pergunta: z.string(),
  opcoes: z.array(z.string()).min(2),
  correta: z.number().int().min(0),
  porque: z.string(),
}).refine((q) => q.correta < q.opcoes.length, { message: "índice da correta fora das opções" });

const Trecho = z.object({ nota: z.string().optional(), codigo: z.string(), linguagem: z.string().optional() });

const Aula = z.object({
  id: z.string(),
  titulo: z.string(),
  minutos: z.number().int().positive(),
  resumo: z.string().optional(),
  ideia: z.array(z.string()).min(1).optional(),
  exemplo: Trecho.optional(),
  // mesmo conceito, código em cada stack (back-end). A chave é o id da stack.
  // A aula usa exemplo OU exemplos, nunca os dois.
  exemplos: z.record(z.string(), Trecho).optional(),
  mais: z.object({ titulo: z.string(), linhas: z.array(z.string()).min(1) }).optional(),
  quiz: z.array(Questao).optional(),
  // linguagem da solução, quando difere da do exemplo (usada só pelo verificador de código)
  desafio: z.object({
    pergunta: z.string(),
    solucao: z.string().optional(),
    linguagem: z.string().optional(),
    // uma solução por stack, quando a aula tem código nas três
    solucoes: z.record(z.string(), z.object({ codigo: z.string(), linguagem: z.string().optional() })).optional(),
  }).refine((d) => Boolean(d.solucao) !== Boolean(d.solucoes), {
    message: "desafio precisa de solucao ou de solucoes, nunca os dois",
  }).optional(),
}).refine((a) => !(a.exemplo && a.exemplos), { message: "aula usa exemplo ou exemplos, nunca os dois" });

const FocoDef = z.object({ id: z.string(), nome: z.string(), descricao: z.string() });

const ModuloMeta = z.object({
  id: z.string(),
  ordem: z.number().int().positive(),
  nome: z.string(),
  faculdade: z.string().optional(),
  foco: Foco,
  descricao: z.string(),
});

// Stack do foco back-end: o conceito é ensinado uma vez e o código vem em cada uma.
const StackDef = z.object({ id: z.string(), nome: z.string(), linguagem: z.string(), descricao: z.string() });

const Trilha = z.object({
  focos: z.array(FocoDef).min(1),
  stacks: z.array(StackDef).min(1),
  modulos: z.array(ModuloMeta).min(1),
  micro: z.array(z.string()).min(1),
});

const ArquivoAulas = z.object({ modulo: z.string(), aulas: z.array(Aula).min(1) });

export const Demanda = z.object({
  id: z.string(),
  nivel: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  titulo: z.string(),
  de: z.string(),
  canal: z.enum(["Slack", "E-mail", "Ticket"]),
  numero: z.string().optional(),
  prazo: z.string(),
  depois: z.string().optional(),
  mensagem: z.string(),
  criterios: z.array(z.string()).min(1),
  reviravolta: z.object({ texto: z.string(), criterios: z.array(z.string()).min(1) }).optional(),
  solucao: z.string(),
  aprendizado: z.string(),
  foco: FocoItem.optional(),
});

const Treino = z.object({
  id: z.string(),
  titulo: z.string(),
  nivel: z.enum(["Fácil", "Médio", "Difícil"]),
  tempo: z.number().int().positive(),
  enunciado: z.string(),
  exemplos: z.array(z.object({ entra: z.string(), sai: z.string() })).min(1),
  dica: z.string(),
  solucao: z.string(),
  custo: z.string(),
  foco: FocoItem.optional(),
});

const Projeto = z.object({
  id: z.string(),
  titulo: z.string(),
  nivel: z.number().int().positive(),
  tempo: z.string(),
  modulo: z.string(),
  pitch: z.string(),
  porque: z.string(),
  escopo: z.object({ faz: z.array(z.string()).min(1), naoFaz: z.array(z.string()).min(1) }),
  passos: z.array(z.object({ titulo: z.string(), descricao: z.string() })).min(1),
  pronto: z.array(z.string()).min(1),
  readme: z.string(),
  linkedin: z.string(),
  foco: FocoItem.optional(),
});

const ProvaBase = { id: z.string(), titulo: z.string(), escopo: z.string(), tempo: z.number().int().positive(), foco: FocoItem.optional() };
const Prova = z.discriminatedUnion("tipo", [
  z.object({ ...ProvaBase, tipo: z.literal("alternativas"), questoes: z.array(Questao).min(1) }),
  z.object({
    ...ProvaBase,
    tipo: z.literal("pratica"),
    aviso: z.string(),
    tarefas: z.array(z.object({
      titulo: z.string(),
      enunciado: z.string(),
      criterios: z.array(z.string()).min(1),
      solucao: z.string(),
    })).min(1),
  }),
]);

const Termo = z.object({ termo: z.string(), area: z.string(), definicao: z.string(), foco: FocoItem.optional() });

const PerguntaEntrevista = z.object({
  tema: z.string(),
  pergunta: z.string(),
  querem: z.string(),
  esqueleto: z.string(),
  cuidado: z.string(),
  foco: FocoItem.optional(),
});

const Certificado = z.object({
  nome: z.string(),
  orgao: z.string(),
  custo: z.string(),
  ordem: z.number().int().positive(),
  quando: z.string(),
  porque: z.string(),
  foco: FocoItem.optional(),
});

const Lab = z.object({ nome: z.string(), tema: z.string(), descricao: z.string(), url: z.string().optional(), foco: FocoItem.optional() });

/* ── Tipos ────────────────────────────────────────────────────── */

export type Questao = z.infer<typeof Questao>;
export type Aula = z.infer<typeof Aula>;
export type FocoDef = z.infer<typeof FocoDef>;
export type StackDef = z.infer<typeof StackDef>;
export type ModuloMeta = z.infer<typeof ModuloMeta>;
export type Modulo = ModuloMeta & { aulas: Aula[] };
export type Demanda = z.infer<typeof Demanda>;
export type Treino = z.infer<typeof Treino>;
export type Projeto = z.infer<typeof Projeto>;
export type Prova = z.infer<typeof Prova>;
export type Termo = z.infer<typeof Termo>;
export type PerguntaEntrevista = z.infer<typeof PerguntaEntrevista>;
export type Certificado = z.infer<typeof Certificado>;
export type Lab = z.infer<typeof Lab>;

/** Aula com o módulo a que pertence. É o que as telas usam. */
export type AulaComModulo = Aula & { moduloId: string; moduloNome: string; moduloOrdem: number; moduloFoco: string };

/** O mínimo que listas e a tela Agora precisam saber de uma aula, sem carregar o texto. */
export type AulaResumo = {
  id: string; titulo: string; minutos: number;
  moduloId: string; moduloNome: string; temConteudo: boolean;
};

/* ── Carga e validação ────────────────────────────────────────── */

function valida<T>(nome: string, esquema: z.ZodType<T>, dados: unknown): T {
  const r = esquema.safeParse(dados);
  if (!r.success) {
    throw new Error(`content/${nome} inválido:\n${z.prettifyError(r.error)}`);
  }
  return r.data;
}

const trilha = valida("trilha.json", Trilha, trilhaJson);
const FOCOS = trilha.focos;
const STACKS = trilha.stacks;

const arquivosAulas = {
  m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12,
  web1, web2, web3, web4, web5,
  dados1, dados2, dados3, dados4, dados5,
  backend1, backend2, backend3, backend4, backend5,
} as Record<string, unknown>;

const MODULOS: Modulo[] = trilha.modulos
  .slice()
  .sort((a, b) => a.ordem - b.ordem)
  .map((meta) => {
    const bruto = arquivosAulas[meta.id];
    if (!bruto) throw new Error(`content/aulas/${meta.id}.json não existe, mas o módulo está em trilha.json`);
    const arq = valida(`aulas/${meta.id}.json`, ArquivoAulas, bruto);
    if (arq.modulo !== meta.id) throw new Error(`content/aulas/${meta.id}.json declara modulo "${arq.modulo}"`);
    if (meta.foco !== "base" && !FOCOS.some((f) => f.id === meta.foco)) {
      throw new Error(`módulo ${meta.id} tem foco "${meta.foco}" que não existe em focos`);
    }
    return { ...meta, aulas: arq.aulas };
  });

const TODAS_AULAS: AulaComModulo[] = MODULOS.flatMap((m) =>
  m.aulas.map((a) => ({ ...a, moduloId: m.id, moduloNome: m.nome, moduloOrdem: m.ordem, moduloFoco: m.foco }))
);

{
  const ids = new Set<string>();
  for (const a of TODAS_AULAS) {
    if (ids.has(a.id)) throw new Error(`id de aula repetido: ${a.id}`);
    ids.add(a.id);
  }
}

// Aula com código por stack precisa cobrir todas: quem escolheu Express não pode
// abrir a aula e não encontrar código.
{
  const todas = STACKS.map((s) => s.id);
  const conferir = (onde: string, chaves: string[]) => {
    for (const id of chaves) if (!todas.includes(id)) throw new Error(`${onde}: stack "${id}" não existe em stacks`);
    for (const id of todas) if (!chaves.includes(id)) throw new Error(`${onde}: falta a stack "${id}"`);
  };
  for (const a of TODAS_AULAS) {
    if (a.exemplos) conferir(`aula ${a.id} (exemplos)`, Object.keys(a.exemplos));
    if (a.desafio?.solucoes) conferir(`aula ${a.id} (solucoes)`, Object.keys(a.desafio.solucoes));
  }
}

const DEMANDAS = valida("demandas.json", z.array(Demanda), demandasJson);
const TREINOS = valida("treinos.json", z.array(Treino), treinosJson);
const PROJETOS = valida("projetos.json", z.array(Projeto), projetosJson);
const PROVAS = valida("provas.json", z.array(Prova), provasJson);
const GLOSSARIO = valida("glossario.json", z.array(Termo), glossarioJson);
const ENTREVISTA = valida("entrevista.json", z.array(PerguntaEntrevista), entrevistaJson);
const { certificados: CERTIFICADOS, labs: LABS } = valida(
  "certificados.json",
  z.object({ certificados: z.array(Certificado), labs: z.array(Lab) }),
  certificadosJson
);

// Foco de um item como lista. Sem foco = base.
type FocoDoItem = string | string[] | undefined;
const focosDoItem = (f: FocoDoItem): string[] => (f === undefined ? ["base"] : Array.isArray(f) ? f : [f]);

// Todo foco citado precisa existir, e id repetido quebra o build: com dezenas de
// itens novos por foco, erro de digitação tem que aparecer aqui, não na tela.
{
  const validos = new Set(["base", ...FOCOS.map((f) => f.id)]);
  const conferir = (onde: string, f: FocoDoItem) => {
    for (const id of focosDoItem(f)) {
      if (!validos.has(id)) throw new Error(`${onde}: foco "${id}" não existe em focos`);
    }
  };
  const unicos = (tipo: string, ids: string[]) => {
    const vistos = new Set<string>();
    for (const id of ids) {
      if (vistos.has(id)) throw new Error(`id de ${tipo} repetido: ${id}`);
      vistos.add(id);
    }
  };
  DEMANDAS.forEach((d) => conferir(`demanda ${d.id}`, d.foco));
  TREINOS.forEach((t) => conferir(`treino ${t.id}`, t.foco));
  PROJETOS.forEach((p) => conferir(`projeto ${p.id}`, p.foco));
  PROVAS.forEach((p) => conferir(`prova ${p.id}`, p.foco));
  GLOSSARIO.forEach((g) => conferir(`termo ${g.termo}`, g.foco));
  ENTREVISTA.forEach((q) => conferir(`pergunta "${q.pergunta.slice(0, 40)}"`, q.foco));
  CERTIFICADOS.forEach((c) => conferir(`certificado ${c.nome}`, c.foco));
  LABS.forEach((l) => conferir(`lab ${l.nome}`, l.foco));
  unicos("demanda", DEMANDAS.map((d) => d.id));
  unicos("treino", TREINOS.map((t) => t.id));
  unicos("projeto", PROJETOS.map((p) => p.id));
  unicos("prova", PROVAS.map((p) => p.id));
}

/* ── API ──────────────────────────────────────────────────────── */

/** Id de um foco (ex.: "seguranca"), ou undefined para "tudo, sem filtrar". */
export type FocoId = string;

// Visível quando: sem filtro (foco undefined), ou o item é base, ou vale pro foco ativo.
const visivel = (itemFoco: FocoDoItem, foco: FocoId | undefined) => {
  if (foco === undefined) return true;
  const fs = focosDoItem(itemFoco);
  return fs.includes("base") || fs.includes(foco);
};

/** Uma aula "tem conteúdo" quando a ideia foi escrita. Só o título não conta. */
export const temConteudo = (a: Aula) => Boolean(a.ideia && a.ideia.length > 0);

export const resumoAula = (a: AulaComModulo): AulaResumo => ({
  id: a.id, titulo: a.titulo, minutos: a.minutos,
  moduloId: a.moduloId, moduloNome: a.moduloNome, temConteudo: temConteudo(a),
});

export const focos = () => FOCOS;
export const foco = (id: string) => FOCOS.find((f) => f.id === id) ?? null;
export const focoValido = (id: string | null | undefined): boolean => Boolean(id) && FOCOS.some((f) => f.id === id);

export const stacks = () => STACKS;
export const stackValida = (id: string | null | undefined): boolean => Boolean(id) && STACKS.some((s) => s.id === id);

// Nas listas, foco opcional: com foco filtra base+foco; sem foco devolve tudo
// (usado por generateStaticParams e por buscas por id).
export const modulos = (foco?: FocoId) => MODULOS.filter((m) => visivel(m.foco, foco));
export const modulo = (id: string) => MODULOS.find((m) => m.id === id) ?? null;
export const todasAulas = (foco?: FocoId) => TODAS_AULAS.filter((a) => visivel(a.moduloFoco, foco));
export const aula = (id: string) => TODAS_AULAS.find((a) => a.id === id) ?? null;
export const microMissoes = () => trilha.micro;

export const demandas = (foco?: FocoId) => DEMANDAS.filter((d) => visivel(d.foco, foco));
export const demanda = (id: string) => DEMANDAS.find((d) => d.id === id) ?? null;
export const treinos = (foco?: FocoId) => TREINOS.filter((t) => visivel(t.foco, foco));
export const treino = (id: string) => TREINOS.find((t) => t.id === id) ?? null;
export const projetos = (foco?: FocoId) => PROJETOS.filter((p) => visivel(p.foco, foco));
export const projeto = (id: string) => PROJETOS.find((p) => p.id === id) ?? null;
export const provas = (foco?: FocoId) => PROVAS.filter((p) => visivel(p.foco, foco));
export const prova = (id: string) => PROVAS.find((p) => p.id === id) ?? null;
export const glossario = (foco?: FocoId) => GLOSSARIO.filter((g) => visivel(g.foco, foco));
export const entrevista = (foco?: FocoId) => ENTREVISTA.filter((q) => visivel(q.foco, foco));
export const certificados = (foco?: FocoId) => CERTIFICADOS.filter((c) => visivel(c.foco, foco));
export const labs = (foco?: FocoId) => LABS.filter((l) => visivel(l.foco, foco));

/** Descrição curta da área para a voz da IA. */
export function areaDoFoco(id: string | null | undefined): string {
  switch (id) {
    case "seguranca": return "segurança da informação";
    case "web": return "desenvolvimento web";
    case "dados": return "dados e IA";
    case "backend": return "back-end e APIs";
    default: return "programação";
  }
}
