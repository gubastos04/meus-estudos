import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { Demanda, type Demanda as TDemanda } from "@/lib/conteudo";
import { db } from "@/lib/db";
import { decifrar } from "@/lib/cripto";
import { areaDoFoco } from "@/lib/conteudo";
import { hoje } from "@/lib/datas";

// Cada usuário usa a própria chave (paga o próprio uso). A chave nunca vai para
// o navegador: fica criptografada no banco e é decifrada só aqui, no servidor.
// Modelo e limite diário são configuráveis por env.
const MODELO = process.env.IA_MODELO || "claude-sonnet-5";
const LIMITE_DIARIO = Number(process.env.IA_LIMITE_DIARIO || "40");

/** IA só liga para quem cadastrou a própria chave. Sem chave, os botões nem aparecem. */
export async function temChaveIA(usuarioId: string): Promise<boolean> {
  const u = await db.usuario.findUnique({ where: { id: usuarioId }, select: { iaChave: true } });
  return Boolean(u?.iaChave);
}

/** Decifra a chave do usuário e descobre a área do foco (para a voz). */
async function chaveEArea(usuarioId: string): Promise<{ chave: string; area: string }> {
  const u = await db.usuario.findUnique({ where: { id: usuarioId }, select: { iaChave: true, foco: true } });
  if (!u?.iaChave) throw new ErroIA("Você ainda não cadastrou sua chave da API. Vá em Você e adicione uma para usar a IA.");
  const chave = decifrar(u.iaChave);
  if (!chave) throw new ErroIA("Não consegui ler sua chave (o segredo do servidor pode ter mudado). Recadastre a chave em Você.");
  return { chave, area: areaDoFoco(u.foco) };
}

// Voz compartilhada (seção 7). Texto puro, direto, sem elogio vazio. A área vem do foco.
const voz = (area: string) => `Você é professor particular de um aluno brasileiro que está começando programação do zero, com foco em ${area}.

Regras de estilo, sem exceção:
- Português do Brasil, direto, sem enrolação.
- Frases curtas. Nada de introdução ou despedida.
- Exemplo concreto sempre que possível.
- Texto puro. Nada de markdown, asterisco, cerquilha ou emoji.
- Código, quando houver, em linhas soltas, sem cercas de crase.
- Máximo 250 palavras.
- Nunca elogie por elogiar. Se estiver errado, diga que está errado.`;

const vozJson = (area: string) => `Você gera demandas de trabalho realistas para um aluno brasileiro que está aprendendo programação com foco em ${area}.

Responda APENAS com um objeto JSON válido. Sem markdown, sem cercas de crase, sem texto antes ou depois.`;

/** Erro com mensagem já pronta para o usuário (sem stack trace). */
export class ErroIA extends Error {}

/** Barra se o uso do dia do usuário já chegou ao limite. Só leitura — não consome. */
async function checarCota(usuarioId: string) {
  const uso = await db.usoIA.findUnique({ where: { usuarioId_dia: { usuarioId, dia: hoje() } } });
  if ((uso?.total ?? 0) >= LIMITE_DIARIO) {
    throw new ErroIA(`Você chegou ao limite de ${LIMITE_DIARIO} usos de IA hoje. Isso existe para o custo não fugir do controle. Volta amanhã, ou aumenta o limite em IA_LIMITE_DIARIO.`);
  }
}

/** Conta um uso do dia. Chamado só depois de a chamada dar certo (aí sim custou). */
async function registrarUso(usuarioId: string) {
  const dia = hoje();
  await db.usoIA.upsert({
    where: { usuarioId_dia: { usuarioId, dia } },
    update: { total: { increment: 1 } },
    create: { usuarioId, dia, total: 1 },
  });
}

async function conversar(usuarioId: string, prompt: string, sistema: (area: string) => string, maxTokens = 1024): Promise<string> {
  await checarCota(usuarioId);
  const { chave, area } = await chaveEArea(usuarioId);
  const cliente = new Anthropic({ apiKey: chave });
  let resposta;
  try {
    resposta = await cliente.messages.create({
      model: MODELO,
      max_tokens: maxTokens,
      system: sistema(area),
      messages: [{ role: "user", content: prompt }],
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new ErroIA("Sua chave da API foi recusada. Confira a chave em Você.");
    if (e instanceof Anthropic.RateLimitError) throw new ErroIA("A API está ocupada agora (limite de taxa). Tenta de novo em alguns segundos.");
    console.error("IA falhou:", e);
    throw new ErroIA("Não consegui responder agora. Tenta de novo daqui a pouco.");
  }
  const texto = resposta.content.filter((b) => b.type === "text").map((b) => b.text).join("\n").trim();
  if (!texto) throw new ErroIA("Veio uma resposta vazia. Tenta de novo.");
  await registrarUso(usuarioId);
  return texto;
}

/* ── 7.1 Corretor de código ───────────────────────────────────── */

export function corrigir(usuarioId: string, entrada: { titulo: string; enunciado: string; criterios: string[]; solucao?: string; codigo: string }) {
  const prompt = `Tarefa dada ao aluno: ${entrada.titulo}
Enunciado: ${entrada.enunciado}

Critérios de aceite:
${entrada.criterios.map((c, i) => `${i + 1}. ${c}`).join("\n")}
${entrada.solucao ? `\nUma solução de referência:\n${entrada.solucao}` : ""}

Código que o aluno escreveu:
${entrada.codigo}

Faça, nesta ordem:
1. Diga critério por critério se ele foi atendido. Use o formato: ATENDIDO ou FALTA, seguido do critério e de uma frase curta.
2. Aponte no máximo dois problemas além dos critérios, se existirem, priorizando bug real sobre estilo.
3. Termine com uma frase dizendo se está pronto pra entregar ou não.

Não reescreva o código inteiro. Se precisar mostrar correção, mostre só a linha ou o trecho.`;
  return conversar(usuarioId, prompt, voz, 1024);
}

/* ── 7.2 Explica de outro jeito ───────────────────────────────── */

export function explicar(usuarioId: string, entrada: { titulo: string; modulo: string; resumo?: string; ideia: string[] }) {
  const prompt = `O aluno está na aula "${entrada.titulo}", do módulo "${entrada.modulo}".

Resumo que ele leu: ${entrada.resumo ?? ""}
Explicação que ele leu:
${entrada.ideia.join("\n")}

Essa explicação não entrou na cabeça dele. Explique o MESMO conceito de outro jeito:
- Use uma analogia diferente da que está acima.
- Comece pelo exemplo concreto, não pela definição.
- Termine com uma pergunta curta que ele possa responder pra si mesmo e saber se entendeu.`;
  return conversar(usuarioId, prompt, voz, 700);
}

/* ── 7.3 Pergunta livre ───────────────────────────────────────── */

export function perguntar(usuarioId: string, entrada: { titulo: string; modulo: string; resumo?: string; ideia: string[]; exemplo?: string; pergunta: string }) {
  const prompt = `O aluno está na aula "${entrada.titulo}", do módulo "${entrada.modulo}".

Conteúdo que ele acabou de ler:
${entrada.resumo ?? ""}
${entrada.ideia.join("\n")}
${entrada.exemplo ? `\nExemplo mostrado:\n${entrada.exemplo}` : ""}

Pergunta dele:
${entrada.pergunta}

Responda a pergunta dele. Se a pergunta for sobre assunto de um módulo posterior, responda o essencial em duas frases e diga onde é aprofundado. Nunca responda apenas "depende".`;
  return conversar(usuarioId, prompt, voz, 900);
}

/* ── 7.4 Demanda gerada ───────────────────────────────────────── */

const IDS_PROIBIDOS = new Set(["validador de senha", "análise de log de login", "log de login"]);

/** Gera uma demanda nova, valida com Zod, tenta mais uma vez se falhar. */
export async function gerarDemanda(usuarioId: string, aulasFeitas: string[]): Promise<TDemanda> {
  const u = await db.usuario.findUnique({ where: { id: usuarioId }, select: { foco: true } });
  const area = areaDoFoco(u?.foco);
  const sabe = aulasFeitas.length ? aulasFeitas.join(", ") : "lógica básica, variáveis, condicionais, laços";
  const prompt = `O aluno já domina: ${sabe}.

Gere UMA demanda de trabalho nova, em português do Brasil, sobre um tema aplicado da área de ${area} (algo que aparece no trabalho de verdade nessa área). Não repita um tema que provavelmente ele já fez; seja específico e prático.

O JSON deve ter exatamente estas chaves:
{
 "id": "g seguido de um número qualquer",
 "titulo": "curto, 3 a 6 palavras",
 "nivel": 2,
 "de": "Nome, cargo",
 "canal": "Slack, E-mail ou Ticket",
 "prazo": "informal, como gente fala",
 "depois": "qual assunto ele precisa saber antes",
 "mensagem": "a mensagem do remetente, 3 a 6 linhas, do jeito que aquela pessoa escreveria naquele canal. Informal no Slack, formal no e-mail, seca no ticket. Levemente vaga, como pedido real. Use \\n entre as linhas.",
 "criterios": ["4 critérios objetivos e verificáveis"],
 "reviravolta": {
   "texto": "segunda mensagem com algo que a pessoa esqueceu de falar, mudando o escopo",
   "criterios": ["1 ou 2 critérios novos"]
 },
 "solucao": "código Python comentado que atende tudo, usando \\n entre as linhas",
 "aprendizado": "uma frase sobre o conceito que essa demanda ensina"
}

O campo canal deve ser exatamente Slack, E-mail ou Ticket, sem número junto.`;

  const tentar = async (): Promise<TDemanda> => {
    const txt = await conversar(usuarioId, prompt, vozJson, 2000);
    const limpo = txt.replace(/```json/gi, "").replace(/```/g, "").trim();
    let bruto: unknown;
    try {
      bruto = JSON.parse(limpo);
    } catch {
      throw new ErroIA("json inválido");
    }
    const r = Demanda.safeParse(bruto);
    if (!r.success) throw new ErroIA("formato inválido");
    if (IDS_PROIBIDOS.has(r.data.titulo.toLowerCase())) throw new ErroIA("tema repetido");
    return r.data;
  };

  try {
    return await tentar();
  } catch (primeira) {
    if (primeira instanceof ErroIA && primeira.message.startsWith("Você chegou ao limite")) throw primeira;
    try {
      return await tentar();
    } catch {
      throw new ErroIA("A demanda gerada veio fora do formato duas vezes seguidas. Tenta de novo daqui a pouco.");
    }
  }
}
