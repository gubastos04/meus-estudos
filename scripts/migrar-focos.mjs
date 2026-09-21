// Uso único: reclassifica o conteúdo por foco e cria os focos novos como estrutura.
// Base = comum a todos (lógica, Python, algoritmos). Segurança = o conteúdo que já existe.
// Web / Dados / Back-end entram como outline (módulos-esqueleto, títulos só, bloqueados).
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const raiz = resolve(import.meta.dirname, "..", "content");
const ler = (n) => JSON.parse(readFileSync(resolve(raiz, n), "utf8"));
const grava = (n, d) => writeFileSync(resolve(raiz, n), JSON.stringify(d, null, 2) + "\n", "utf8");

/* ── focos ─────────────────────────────────────────────────────── */
const focos = [
  { id: "seguranca", nome: "Segurança da informação", descricao: "Pentest, OWASP, criptografia, análise de log. Do zero até escrever suas próprias ferramentas." },
  { id: "web", nome: "Desenvolvimento web", descricao: "HTML, CSS, JavaScript, um framework de front e o back que serve tudo. Construir e publicar na web." },
  { id: "dados", nome: "Dados e IA", descricao: "Python para dados: limpar, analisar, visualizar e dar os primeiros passos em machine learning." },
  { id: "backend", nome: "Back-end e APIs", descricao: "Servidores, APIs REST, banco de dados, autenticação e deploy. A engenharia por trás dos apps." },
];

/* ── trilha: retag módulos + esqueletos ────────────────────────── */
const trilha = ler("trilha.json");
// m1, m2 são base; m3-m12 são segurança
for (const m of trilha.modulos) {
  m.foco = (m.id === "m1" || m.id === "m2") ? "base" : "seguranca";
  delete m.etiqueta;
}

// outlines dos focos novos (títulos só; viram aulas-esqueleto bloqueadas)
const OUTLINES = {
  web: [
    ["HTML: a estrutura da página", ["Tags e semântica", "Formulários", "Imagens e links", "Acessibilidade básica"]],
    ["CSS: layout sem sofrer", ["Seletores e box model", "Flexbox", "Grid", "Responsivo"]],
    ["JavaScript no navegador", ["Variáveis e funções", "Manipular o DOM", "Eventos", "Fetch e APIs"]],
    ["Front-end com React", ["Componentes", "Estado", "Props e listas", "Um app pequeno"]],
    ["Back-end e banco", ["Um servidor Node", "Rotas e API REST", "Banco de dados", "Publicar na web"]],
  ],
  dados: [
    ["Python para dados: Pandas", ["Series e DataFrame", "Ler CSV", "Selecionar e filtrar", "Agrupar"]],
    ["Limpar e preparar dados", ["Valores faltando", "Tipos e datas", "Juntar tabelas", "Duplicatas"]],
    ["Visualização", ["Linha e barra", "Distribuições", "Relação entre variáveis", "Contar história com dado"]],
    ["Estatística que importa", ["Média, mediana, desvio", "Amostra vs população", "Correlação não é causa", "Probabilidade básica"]],
    ["Introdução a machine learning", ["O que é um modelo", "Treino e teste", "Classificação simples", "Avaliar o resultado"]],
  ],
  backend: [
    ["Como uma API funciona", ["Cliente e servidor", "HTTP por dentro", "JSON", "Status e verbos"]],
    ["Construindo uma API REST", ["Rotas", "Receber e validar dados", "Respostas e erros", "Organização"]],
    ["Banco de dados e SQL", ["Tabelas e chaves", "SELECT e WHERE", "JOIN", "Consulta parametrizada"]],
    ["Autenticação e sessão", ["Login e senha com hash", "Sessão e cookie", "Autorização", "Segredos"]],
    ["Testes e deploy", ["Escrever um teste", "Tratar erro de verdade", "Variáveis de ambiente", "Publicar"]],
  ],
};

// remove esqueletos de uma rodada anterior, se houver
trilha.modulos = trilha.modulos.filter((m) => /^m\d+$/.test(m.id));

for (const [foco, mods] of Object.entries(OUTLINES)) {
  mods.forEach(([nome, aulas], i) => {
    const id = `${foco}${i + 1}`;
    trilha.modulos.push({ id, ordem: 3 + i, nome, foco, descricao: "Conteúdo em breve. Esta trilha está sendo escrita." });
    grava(`aulas/${id}.json`, { modulo: id, aulas: aulas.map((titulo, j) => ({ id: `${id}a${j + 1}`, titulo, minutos: 12 })) });
  });
}

trilha.focos = focos;
grava("trilha.json", trilha);

/* ── demais conteúdos: foco por item ───────────────────────────── */
const tag = (n, fn) => { const d = ler(n); grava(n, d.map(fn)); };

tag("projetos.json", (p) => ({ ...p, foco: "seguranca" }));
tag("demandas.json", (d) => ({ ...d, foco: "seguranca" }));
tag("treinos.json", (t) => ({ ...t, foco: "base" }));
tag("provas.json", (p) => ({ ...p, foco: "base" }));
tag("glossario.json", (g) => ({ ...g, foco: g.area === "Código" ? "base" : "seguranca" }));
tag("entrevista.json", (q) => ({ ...q, foco: q.tema === "Python" ? "base" : "seguranca" }));

const cert = ler("certificados.json");
grava("certificados.json", {
  certificados: cert.certificados.map((c) => ({ ...c, foco: "seguranca" })),
  labs: cert.labs.map((l) => ({ ...l, foco: "seguranca" })),
});

console.log("focos:", focos.map((f) => f.id).join(", "));
console.log("módulos:", trilha.modulos.length, "(base 2, seguranca 10, +15 esqueleto)");
console.log("projetos/demandas → seguranca; treinos/provas → base; glossário e entrevista por área/tema");
