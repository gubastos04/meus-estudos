/*
  Warnings:

  - Added the required column `email` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senhaHash` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "SessaoLogin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "expiraEm" DATETIME NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessaoLogin_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "iaChave" TEXT,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metaSemanal" INTEGER NOT NULL DEFAULT 3,
    "energia" TEXT NOT NULL DEFAULT 'media',
    "tema" TEXT NOT NULL DEFAULT 'escuro',
    "fonte" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Usuario" ("criadoEm", "energia", "fonte", "id", "metaSemanal", "tema") SELECT "criadoEm", "energia", "fonte", "id", "metaSemanal", "tema" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SessaoLogin_token_key" ON "SessaoLogin"("token");

-- CreateIndex
CREATE INDEX "SessaoLogin_usuarioId_idx" ON "SessaoLogin"("usuarioId");
