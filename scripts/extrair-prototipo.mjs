// Uso único: lê os dados do protótipo (centro.jsx) e grava /content/*.json
// com os nomes de campo da especificação. Rode: node scripts/extrair-prototipo.mjs <caminho do dados.mjs>
import { writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const origem = process.argv[2];
if (!origem) throw new Error("passe o caminho do módulo com os dados do protótipo");

const m = await import(pathToFileURL(resolve(origem)).href);

const ETIQUETA = { m5: "fullstack", m8: "fullstack", m12: "fullstack", m6: "seguranca", m7: "seguranca", m11: "seguranca" };

const questao = (q) => ({ pergunta: q.q, opcoes: q.opts, correta: q.a, porque: q.why });

const aula = (a) => ({
  id: a.id,
  titulo: a.t,
  minutos: a.min,
  ...(a.resumo && { resumo: a.resumo }),
  ...(a.ideia && { ideia: a.ideia }),
  ...(a.exemplo && { exemplo: { ...(a.exemplo.nota && { nota: a.exemplo.nota }), codigo: a.exemplo.code } }),
  ...(a.mais && { mais: { titulo: a.mais.t, linhas: a.mais.linhas } }),
  ...(a.quiz && { quiz: a.quiz.map(questao) }),
  ...(a.desafio && { desafio: { pergunta: a.desafio.q, solucao: a.desafio.sol } }),
});

const modulos = m.TRILHA.map((mod, i) => ({
  id: mod.id,
  ordem: i + 1,
  nome: mod.n,
  faculdade: mod.fac,
  etiqueta: ETIQUETA[mod.id] ?? "base",
  descricao: mod.desc,
}));

const canal = (c) => {
  const [nome, numero] = c.split(" ");
  return { canal: nome, ...(numero && { numero }) };
};

const demandas = m.DEMANDAS.map((d) => ({
  id: d.id,
  nivel: d.nivel,
  titulo: d.titulo,
  de: d.de,
  ...canal(d.canal),
  prazo: d.prazo,
  ...(d.depois && { depois: d.depois }),
  mensagem: d.mensagem,
  criterios: d.criterios,
  ...(d.reviravolta && { reviravolta: d.reviravolta }),
  solucao: d.solucao,
  aprendizado: d.aprendizado,
}));

const treinos = m.TREINOS.map((t) => ({
  ...t,
  exemplos: t.exemplos.map((x) => ({ entra: x.e, sai: x.s })),
}));

const projetos = m.PROJETOS.map((p) => ({
  ...p,
  passos: p.passos.map((s) => ({ titulo: s.t, descricao: s.d })),
}));

const provas = m.PROVAS.map((p) =>
  p.tipo === "alternativas" ? { ...p, questoes: p.questoes.map(questao) } : p
);

const glossario = m.GLOSSARIO.map((g) => ({ termo: g.t, area: g.a, definicao: g.d }));
const entrevista = m.ENTREVISTA.map((q) => ({ tema: q.tema, pergunta: q.p, querem: q.querem, esqueleto: q.esqueleto, cuidado: q.cuidado }));
const labs = m.LABS.map((l) => ({ nome: l.nome, tema: l.tema, descricao: l.d }));

const raiz = resolve(import.meta.dirname, "..", "content");
mkdirSync(resolve(raiz, "aulas"), { recursive: true });
const grava = (nome, dados) => writeFileSync(resolve(raiz, nome), JSON.stringify(dados, null, 2) + "\n", "utf8");

grava("trilha.json", { modulos, micro: m.MICRO });
for (const mod of m.TRILHA) grava(`aulas/${mod.id}.json`, { modulo: mod.id, aulas: mod.aulas.map(aula) });
grava("demandas.json", demandas);
grava("treinos.json", treinos);
grava("projetos.json", projetos);
grava("provas.json", provas);
grava("glossario.json", glossario);
grava("entrevista.json", entrevista);
grava("certificados.json", { certificados: m.CERTIFICADOS, labs });

console.log(`ok: ${modulos.length} módulos, ${m.TRILHA.reduce((s, x) => s + x.aulas.length, 0)} aulas, ${demandas.length} demandas, ${treinos.length} treinos, ${projetos.length} projetos, ${provas.length} provas, ${glossario.length} termos, ${entrevista.length} perguntas, ${m.CERTIFICADOS.length} certificados, ${labs.length} labs`);
