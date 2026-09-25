// Checagem do conteúdo além do que o Zod já garante no build (npm run conteudo:checar).
// Erro (sai com 1): aula escrita incompleta, travessão, id fora do padrão, minutos fora da faixa,
// foco inexistente. Aviso: texto longo demais, referência a módulo ou aula que não existe no foco,
// linguagem desconhecida, termo repetido.
// No fim, um placar do que está escrito em cada foco.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const pasta = join(raiz, "content");
const ler = (rel) => JSON.parse(readFileSync(join(pasta, rel), "utf8"));

const erros = [];
const avisos = [];

/* ── travessão: a voz da casa não usa (vírgula, dois-pontos ou ponto no lugar) ── */

const listar = (dir) =>
  readdirSync(dir).flatMap((nome) => {
    const cam = join(dir, nome);
    return statSync(cam).isDirectory() ? listar(cam) : nome.endsWith(".json") ? [cam] : [];
  });

for (const arq of listar(pasta)) {
  readFileSync(arq, "utf8").split("\n").forEach((linha, i) => {
    const onde = `${relative(raiz, arq)}:${i + 1}`;
    if (linha.includes("—")) erros.push(`${onde}: travessão (—)`);
    if (linha.includes("–")) avisos.push(`${onde}: meia-risca (–)`);
  });
}

/* ── módulos e aulas ─────────────────────────────────────────── */

const trilha = ler("trilha.json");
const idsFocos = trilha.focos.map((f) => f.id);
const idsStacks = trilha.stacks.map((s) => s.id);
const modulos = trilha.modulos.map((m) => ({ ...m, aulas: ler(`aulas/${m.id}.json`).aulas }));
const escrita = (a) => Array.isArray(a.ideia) && a.ideia.length > 0;
const focosDoItem = (f) => (f === undefined ? ["base"] : Array.isArray(f) ? f : [f]);

const LINGUAGENS = new Set([
  "python", "javascript", "jsx", "typescript", "sql", "bash", "powershell",
  "html", "css", "php", "c", "json", "http", "dockerfile", "yaml", "texto",
]);

// todos os textos de um valor, em qualquer profundidade
const textos = (x) =>
  typeof x === "string" ? [x]
  : Array.isArray(x) ? x.flatMap(textos)
  : x && typeof x === "object" ? Object.values(x).flatMap(textos)
  : [];

// "aula 2.7" e "Módulo 3" precisam existir no foco de quem cita.
// Item da base só enxerga a base; item de um foco enxerga a base e o próprio foco.
function conferirRefs(onde, valor, focos) {
  for (const foco of focos) {
    const mods = modulos.filter((m) => m.foco === "base" || m.foco === foco);
    const porOrdem = new Map(mods.map((m) => [m.ordem, m]));
    for (const t of textos(valor)) {
      for (const [, x, y] of t.matchAll(/\baulas? (\d+)\.(\d+)/gi)) {
        const m = porOrdem.get(Number(x));
        if (!m) avisos.push(`${onde}: cita a aula ${x}.${y}, mas o foco ${foco} não tem módulo ${x}`);
        else if (!m.aulas[Number(y) - 1]) avisos.push(`${onde}: cita a aula ${x}.${y}, mas o módulo ${x} tem ${m.aulas.length} aulas`);
      }
      for (const [, x, y] of t.matchAll(/\bm[óo]dulos? (\d+)(?: e (\d+))?/gi)) {
        for (const n of [x, y].filter(Boolean)) {
          if (!porOrdem.has(Number(n))) avisos.push(`${onde}: cita o módulo ${n}, que não existe no foco ${foco}`);
        }
      }
    }
  }
}

const idsAulas = new Set();
for (const m of modulos) {
  if (m.foco !== "base" && !idsFocos.includes(m.foco)) erros.push(`módulo ${m.id}: foco "${m.foco}" não existe`);
  m.aulas.forEach((a, i) => {
    const onde = `${m.id}/${a.id}`;
    if (idsAulas.has(a.id)) erros.push(`${onde}: id de aula repetido`);
    idsAulas.add(a.id);
    if (!a.id.startsWith(`${m.id}a`)) erros.push(`${onde}: id deveria começar com ${m.id}a`);
    else if (a.id !== `${m.id}a${i + 1}`) avisos.push(`${onde}: está na posição ${i + 1}, o esperado seria ${m.id}a${i + 1}`);
    if (a.minutos < 5 || a.minutos > 30) erros.push(`${onde}: ${a.minutos} minutos (fora de 5 a 30)`);

    if (!escrita(a)) {
      if (a.resumo || a.exemplo || a.quiz || a.desafio) avisos.push(`${onde}: tem campos mas não tem ideia, então não conta como escrita`);
      return;
    }
    for (const campo of ["resumo", "desafio"]) {
      if (!a[campo]) erros.push(`${onde}: aula escrita sem ${campo}`);
    }
    if (!a.exemplo && !a.exemplos) erros.push(`${onde}: aula escrita sem exemplo`);
    if (a.exemplo && a.exemplos) erros.push(`${onde}: tem exemplo e exemplos; use um dos dois`);
    if (!a.quiz?.length) erros.push(`${onde}: aula escrita sem quiz`);
    if (a.resumo?.length > 160) avisos.push(`${onde}: resumo com ${a.resumo.length} caracteres (a ideia é uma frase)`);
    if (a.ideia.length > 3) avisos.push(`${onde}: ideia com ${a.ideia.length} linhas (o padrão é 2, no máximo 3)`);
    a.ideia.forEach((l, j) => {
      if (l.length > 240) avisos.push(`${onde}: linha ${j + 1} da ideia com ${l.length} caracteres`);
    });
    if (a.exemplo && !a.exemplo.codigo?.trim()) erros.push(`${onde}: exemplo sem código`);
    // sem linguagem o verificador pula o trecho em silêncio: "texto" é o rótulo de quem não roda
    if (a.exemplo && !a.exemplo.linguagem) erros.push(`${onde}: exemplo sem linguagem`);
    if (a.desafio?.solucao && !(a.desafio.linguagem ?? a.exemplo?.linguagem)) erros.push(`${onde}: solução sem linguagem`);

    // aula com código por stack: uma por stack existente, e todas presentes
    const porStack = { exemplos: a.exemplos, solucoes: a.desafio?.solucoes };
    for (const [campo, mapa] of Object.entries(porStack)) {
      if (!mapa) continue;
      for (const id of Object.keys(mapa)) {
        if (!idsStacks.includes(id)) erros.push(`${onde}: ${campo} traz a stack "${id}", que não existe`);
        if (!mapa[id].codigo?.trim()) erros.push(`${onde}: ${campo}.${id} sem código`);
      }
      for (const id of idsStacks) {
        if (!mapa[id]) erros.push(`${onde}: falta a stack "${id}" em ${campo}`);
      }
    }

    const linguagens = [
      a.exemplo?.linguagem, a.desafio?.linguagem,
      ...Object.values(a.exemplos ?? {}).map((t) => t.linguagem),
      ...Object.values(a.desafio?.solucoes ?? {}).map((s) => s.linguagem),
    ];
    for (const ling of linguagens) {
      if (ling && !LINGUAGENS.has(ling)) avisos.push(`${onde}: linguagem "${ling}" desconhecida`);
    }
    a.quiz?.forEach((q, j) => {
      if (q.opcoes.length > 4) avisos.push(`${onde}: quiz ${j + 1} com ${q.opcoes.length} opções`);
      if (!q.porque?.trim()) erros.push(`${onde}: quiz ${j + 1} sem porque`);
    });
    if (a.desafio && (!a.desafio.pergunta?.trim() || !(a.desafio.solucao?.trim() || a.desafio.solucoes))) erros.push(`${onde}: desafio incompleto`);
    conferirRefs(onde, a, [m.foco]);
  });
}

/* ── conteúdo de apoio ───────────────────────────────────────── */

const certificados = ler("certificados.json");
const apoio = [
  ["demandas", ler("demandas.json"), (d) => `demanda ${d.id}`],
  ["treinos", ler("treinos.json"), (t) => `treino ${t.id}`],
  ["projetos", ler("projetos.json"), (p) => `projeto ${p.id}`],
  ["provas", ler("provas.json"), (p) => `prova ${p.id}`],
  ["termos", ler("glossario.json"), (g) => `termo ${g.termo}`],
  ["perguntas", ler("entrevista.json"), (q) => `pergunta "${q.pergunta.slice(0, 40)}"`],
  ["certificados", certificados.certificados, (c) => `certificado ${c.nome}`],
  ["labs", certificados.labs, (l) => `lab ${l.nome}`],
];

for (const [, itens, nome] of apoio) {
  for (const item of itens) {
    const focos = focosDoItem(item.foco);
    const existentes = focos.filter((f) => f === "base" || idsFocos.includes(f));
    for (const f of focos) if (!existentes.includes(f)) erros.push(`${nome(item)}: foco "${f}" não existe`);
    const semFoco = { ...item };
    delete semFoco.foco;
    conferirRefs(nome(item), semFoco, existentes);
  }
}

// o mesmo termo duas vezes num mesmo foco confunde a busca do glossário
const termosVistos = new Map();
for (const g of ler("glossario.json")) {
  const chave = g.termo.toLowerCase();
  const focos = focosDoItem(g.foco);
  const antes = termosVistos.get(chave) ?? [];
  const cruza = antes.includes("base") || focos.includes("base") || focos.some((f) => antes.includes(f));
  if (antes.length && cruza) avisos.push(`termo "${g.termo}" repetido no mesmo foco`);
  termosVistos.set(chave, [...antes, ...focos]);
}

/* ── placar ──────────────────────────────────────────────────── */

console.log("Conteúdo por foco");
for (const foco of ["base", ...idsFocos]) {
  const aulas = modulos.filter((m) => m.foco === foco).flatMap((m) => m.aulas);
  const partes = [`aulas ${aulas.filter(escrita).length}/${aulas.length}`];
  for (const [tipo, itens] of apoio) {
    partes.push(`${tipo} ${itens.filter((i) => focosDoItem(i.foco).includes(foco)).length}`);
  }
  console.log(`  ${foco.padEnd(10)} ${partes.join(" · ")}`);
}

if (avisos.length) console.log(`\nAvisos (${avisos.length})\n${avisos.map((a) => `  ${a}`).join("\n")}`);
if (erros.length) console.log(`\nErros (${erros.length})\n${erros.map((e) => `  ${e}`).join("\n")}`);
console.log(erros.length ? "\nConteúdo com erro." : "\nConteúdo ok.");
process.exit(erros.length ? 1 : 0);
