// Roda de verdade o código das aulas escritas, pra aula nunca ensinar código quebrado.
// Uso: npm run conteudo:rodar            (todos os módulos)
//      npm run conteudo:rodar -- m2 m3   (só esses)
//
// A linguagem vem de exemplo.linguagem; a solução do desafio usa desafio.linguagem ou,
// sem ela, a do exemplo. python e javascript rodam; sql roda num SQLite em memória;
// o resto (bash, html, texto...) é conferido à mão e aparece como "manual".
// Um comentário com ERRO no trecho marca erro proposital da aula (ex.: "# ERRO").
// Trecho que não roda sozinho vai em scripts/rodar-exemplos.ignorar.json com o motivo:
//   { "m8a2:exemplo": "depende da tabela criada na aula anterior" }
// RODAR_PYTHON aponta outro Python (ex.: um venv com pandas e FastAPI).
// Todo input() recebe "10".

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const ler = (rel) => JSON.parse(readFileSync(join(raiz, rel), "utf8"));
const trilha = ler("content/trilha.json");
const arqIgnorar = join(raiz, "scripts", "rodar-exemplos.ignorar.json");
const ignorar = existsSync(arqIgnorar) ? JSON.parse(readFileSync(arqIgnorar, "utf8")) : {};

const PYTHON = process.env.RODAR_PYTHON || (process.platform === "win32" ? "python" : "python3");
const ENTRADA = "10\n".repeat(50);
const LIMITE_MS = 20_000;

// executa um .sql comando por comando e imprime o resultado de cada SELECT
const RODA_SQL = [
  "import sqlite3, sys",
  "sql = open(sys.argv[1], encoding='utf-8').read()",
  "con = sqlite3.connect(':memory:')",
  "buf = ''",
  "for linha in sql.splitlines(keepends=True):",
  "    buf += linha",
  "    if sqlite3.complete_statement(buf):",
  "        for r in con.execute(buf).fetchall():",
  "            print(r)",
  "        buf = ''",
].join("\n");

function rodar(linguagem, codigo) {
  const dir = mkdtempSync(join(tmpdir(), "aula-"));
  try {
    let cmd;
    let args;
    if (linguagem === "python") {
      writeFileSync(join(dir, "main.py"), codigo);
      [cmd, args] = [PYTHON, ["main.py"]];
    } else if (linguagem === "javascript") {
      const arq = /^\s*import\s/m.test(codigo) ? "main.mjs" : "main.js";
      writeFileSync(join(dir, arq), codigo);
      [cmd, args] = [process.execPath, [arq]];
    } else if (linguagem === "sql") {
      writeFileSync(join(dir, "q.sql"), codigo);
      writeFileSync(join(dir, "roda.py"), RODA_SQL);
      [cmd, args] = [PYTHON, ["roda.py", "q.sql"]];
    } else {
      return null;
    }
    const r = spawnSync(cmd, args, {
      cwd: dir, input: ENTRADA, timeout: LIMITE_MS, encoding: "utf8",
      env: { ...process.env, PYTHONIOENCODING: "utf-8", PYTHONUTF8: "1", MPLBACKEND: "Agg" },
    });
    const falha = r.error ? r.error.message : r.stderr;
    return { ok: !r.error && r.status === 0, saida: (falha || "").trim() };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const filtro = process.argv.slice(2);
const modulos = trilha.modulos.filter((m) => !filtro.length || filtro.includes(m.id));
const conta = { ok: 0, falhas: 0, manuais: 0, ignorados: 0 };

// roda um trecho e imprime o resultado, respeitando a lista de ignorados
function conferir(chave, codigo, linguagem) {
  if (!codigo || !linguagem) return;
  if (ignorar[chave]) {
    conta.ignorados++;
    console.log(`  ·  ${chave}  ignorado: ${ignorar[chave]}`);
    return;
  }
  const r = rodar(linguagem, codigo);
  if (!r) {
    conta.manuais++;
    console.log(`  ·  ${chave}  manual (${linguagem})`);
    return;
  }
  const proposital = /(#|\/\/|--)\s*ERRO\b/.test(codigo);
  if (r.ok !== proposital) {
    conta.ok++;
    console.log(`  ok ${chave}${proposital ? "  (erro proposital)" : ""}`);
  } else {
    conta.falhas++;
    console.log(`  XX ${chave}  ${proposital ? "marcado com ERRO, mas rodou sem erro" : "falhou:"}`);
    if (!proposital) console.log(r.saida.split("\n").slice(-4).map((l) => `       ${l}`).join("\n"));
  }
}

for (const m of modulos) {
  const { aulas } = ler(`content/aulas/${m.id}.json`);
  for (const a of aulas) {
    if (!a.ideia?.length) continue;
    conferir(`${a.id}:exemplo`, a.exemplo?.codigo, a.exemplo?.linguagem);
    conferir(`${a.id}:solucao`, a.desafio?.solucao, a.desafio?.linguagem ?? a.exemplo?.linguagem);
  }
}

// Treino, demanda e prova prática também ensinam código, então também rodam.
// Não têm campo linguagem: o conteúdo é Python. Só entram quando não há filtro
// de módulo, ou com "apoio" na linha de comando.
if (!filtro.length || filtro.includes("apoio")) {
  for (const t of ler("content/treinos.json")) conferir(`${t.id}:solucao`, t.solucao, "python");
  for (const d of ler("content/demandas.json")) conferir(`${d.id}:solucao`, d.solucao, "python");
  for (const p of ler("content/provas.json")) {
    (p.tarefas ?? []).forEach((t, i) => conferir(`${p.id}.${i + 1}:solucao`, t.solucao, "python"));
  }
}

console.log(`\n${conta.ok} ok · ${conta.falhas} falhas · ${conta.manuais} manuais · ${conta.ignorados} ignorados`);
process.exit(conta.falhas ? 1 : 0);
