// Prepara o banco LOCAL (SQLite) para `next dev`, sem tocar no schema de produção.
//
// Problema que resolve: `prisma/schema.prisma` fica em `postgresql` (é o que a
// Vercel usa no build). Localmente usamos SQLite (`.env.local` → file:./dev.db).
// O `provider` do Prisma é fixo no schema, então local e produção brigavam.
//
// Solução: derivar um schema SQLite a partir do schema versionado (trocando só o
// provider), gerar o client e sincronizar o dev.db — automático, antes do dev.
// O schema derivado é gitignored; o versionado continua postgresql.

import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const origem = join(raiz, "prisma", "schema.prisma");
const derivado = join(raiz, "prisma", "schema.local.prisma");

const schema = readFileSync(origem, "utf8");
if (!schema.includes('provider = "postgresql"')) {
  console.log('[dev-local] schema.prisma não está em postgresql — pulando (nada a derivar).');
  process.exit(0);
}

writeFileSync(
  derivado,
  "// GERADO por scripts/dev-local.mjs — não editar, não versionar.\n" +
    schema.replace('provider = "postgresql"', 'provider = "sqlite"'),
);

// SQLite local, ignorando a DATABASE_URL de produção (.env é Neon).
const env = { ...process.env, DATABASE_URL: "file:./dev.db" };
const run = (cmd) => execSync(cmd, { cwd: raiz, env, stdio: "inherit" });

console.log("[dev-local] sincronizando dev.db (SQLite) e gerando o client...");
run(`npx prisma db push --schema "${derivado}" --skip-generate`);
run(`npx prisma generate --schema "${derivado}"`);
console.log("[dev-local] pronto.");
