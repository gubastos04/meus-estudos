// Única porta de entrada para /content. Nenhum componente importa JSON direto.
// A validação roda no carregamento do módulo: conteúdo malformado quebra o build,
// não a tela do usuário.
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
import demandasJson from "@/content/demandas.json";
import treinosJson from "@/content/treinos.json";
import projetosJson from "@/content/projetos.json";
import provasJson from "@/content/provas.json";
import glossarioJson from "@/content/glossario.json";
import entrevistaJson from "@/content/entrevista.json";
import certificadosJson from "@/content/certificados.json";

/* ── Esquemas ─────────────────────────────────────────────────── */

const Questao = z.object({
  pergunta: z.string(),
  opcoes: z.array(z.string()).min(2),
  correta: z.number().int().min(0),
  porque: z.string(),
}).refine((q) => q.correta < q.opcoes.length, { message: "índice da correta fora das opções" });

const Aula = z.object({
  id: z.string(),
  titulo: z.string(),
  minutos: z.number().int().positive(),
  resumo: z.string().optional(),
  ideia: z.array(z.string()).min(1).optional(),
  exemplo: z.object({ nota: z.string().optional(), codigo: z.string(), linguagem: z.string().optional() }).optional(),
  mais: z.object({ titulo: z.string(), linhas: z.array(z.string()).min(1) }).optional(),
  quiz: z.array(Questao).optional(),
  desafio: z.object({ pergunta: z.string(), solucao: z.string() }).optional(),
});

const ModuloMeta = z.object({
  id: z.string(),
  ordem: z.number().int().positive(),
  nome: z.string(),
  faculdade: z.string(),
  etiqueta: z.enum(["base", "fullstack", "seguranca"]),
  descricao: z.string(),
});

const Trilha = z.object({
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
});

const ProvaBase = { id: z.string(), titulo: z.string(), escopo: z.string(), tempo: z.number().int().positive() };
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

const Termo = z.object({ termo: z.string(), area: z.string(), definicao: z.string() });

const PerguntaEntrevista = z.object({
  tema: z.string(),
  pergunta: z.string(),
  querem: z.string(),
  esqueleto: z.string(),
  cuidado: z.string(),
});

const Certificado = z.object({
  nome: z.string(),
  orgao: z.string(),
  custo: z.string(),
  ordem: z.number().int().positive(),
  quando: z.string(),
  porque: z.string(),
});

const Lab = z.object({ nome: z.string(), tema: z.string(), descricao: z.string(), url: z.string().optional() });

/* ── Tipos ────────────────────────────────────────────────────── */

export type Questao = z.infer<typeof Questao>;
export type Aula = z.infer<typeof Aula>;
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
export type AulaComModulo = Aula & { moduloId: string; moduloNome: string; moduloOrdem: number };

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

const arquivosAulas = { m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12 } as Record<string, unknown>;

const MODULOS: Modulo[] = trilha.modulos
  .slice()
  .sort((a, b) => a.ordem - b.ordem)
  .map((meta) => {
    const bruto = arquivosAulas[meta.id];
    if (!bruto) throw new Error(`content/aulas/${meta.id}.json não existe, mas o módulo está em trilha.json`);
    const arq = valida(`aulas/${meta.id}.json`, ArquivoAulas, bruto);
    if (arq.modulo !== meta.id) throw new Error(`content/aulas/${meta.id}.json declara modulo "${arq.modulo}"`);
    return { ...meta, aulas: arq.aulas };
  });

const TODAS_AULAS: AulaComModulo[] = MODULOS.flatMap((m) =>
  m.aulas.map((a) => ({ ...a, moduloId: m.id, moduloNome: m.nome, moduloOrdem: m.ordem }))
);

{
  const ids = new Set<string>();
  for (const a of TODAS_AULAS) {
    if (ids.has(a.id)) throw new Error(`id de aula repetido: ${a.id}`);
    ids.add(a.id);
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

/* ── API ──────────────────────────────────────────────────────── */

/** Uma aula "tem conteúdo" quando a ideia foi escrita. Só o título não conta. */
export const temConteudo = (a: Aula) => Boolean(a.ideia && a.ideia.length > 0);

export const resumoAula = (a: AulaComModulo): AulaResumo => ({
  id: a.id, titulo: a.titulo, minutos: a.minutos,
  moduloId: a.moduloId, moduloNome: a.moduloNome, temConteudo: temConteudo(a),
});

export const modulos = () => MODULOS;
export const modulo = (id: string) => MODULOS.find((m) => m.id === id) ?? null;
export const todasAulas = () => TODAS_AULAS;
export const aula = (id: string) => TODAS_AULAS.find((a) => a.id === id) ?? null;
export const microMissoes = () => trilha.micro;

export const demandas = () => DEMANDAS;
export const demanda = (id: string) => DEMANDAS.find((d) => d.id === id) ?? null;
export const treinos = () => TREINOS;
export const treino = (id: string) => TREINOS.find((t) => t.id === id) ?? null;
export const projetos = () => PROJETOS;
export const projeto = (id: string) => PROJETOS.find((p) => p.id === id) ?? null;
export const provas = () => PROVAS;
export const prova = (id: string) => PROVAS.find((p) => p.id === id) ?? null;
export const glossario = () => GLOSSARIO;
export const entrevista = () => ENTREVISTA;
export const certificados = () => CERTIFICADOS;
export const labs = () => LABS;
