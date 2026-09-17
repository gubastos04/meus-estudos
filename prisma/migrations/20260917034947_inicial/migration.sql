-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metaSemanal" INTEGER NOT NULL DEFAULT 3,
    "energia" TEXT NOT NULL DEFAULT 'media',
    "tema" TEXT NOT NULL DEFAULT 'escuro',
    "fonte" INTEGER NOT NULL DEFAULT 1
);

-- CreateTable
CREATE TABLE "AulaFeita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "aulaId" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AulaFeita_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sessao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "minutos" INTEGER NOT NULL,
    "origem" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    CONSTRAINT "Sessao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Nota" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "aulaId" TEXT,
    "aulaTitulo" TEXT,
    "em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Nota_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Erro" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "contexto" TEXT,
    "causa" TEXT,
    "solucao" TEXT,
    "dia" TEXT NOT NULL,
    "em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Erro_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DemandaFeita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "demandaId" TEXT NOT NULL,
    "minutos" INTEGER NOT NULL,
    "dia" TEXT NOT NULL,
    "em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DemandaFeita_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TreinoFeito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "treinoId" TEXT NOT NULL,
    "sozinho" BOOLEAN NOT NULL,
    "dia" TEXT NOT NULL,
    "em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TreinoFeito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjetoFeito" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjetoFeito_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProvaFeita" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "provaId" TEXT NOT NULL,
    "melhor" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "tentativas" INTEGER NOT NULL,
    "dia" TEXT NOT NULL,
    "em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProvaFeita_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DemandaGerada" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "json" TEXT NOT NULL,
    "em" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DemandaGerada_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AulaFeita_usuarioId_aulaId_key" ON "AulaFeita"("usuarioId", "aulaId");

-- CreateIndex
CREATE INDEX "Sessao_usuarioId_dia_idx" ON "Sessao"("usuarioId", "dia");

-- CreateIndex
CREATE INDEX "Nota_usuarioId_aulaId_idx" ON "Nota"("usuarioId", "aulaId");

-- CreateIndex
CREATE UNIQUE INDEX "DemandaFeita_usuarioId_demandaId_key" ON "DemandaFeita"("usuarioId", "demandaId");

-- CreateIndex
CREATE UNIQUE INDEX "TreinoFeito_usuarioId_treinoId_key" ON "TreinoFeito"("usuarioId", "treinoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjetoFeito_usuarioId_projetoId_key" ON "ProjetoFeito"("usuarioId", "projetoId");

-- CreateIndex
CREATE UNIQUE INDEX "ProvaFeita_usuarioId_provaId_key" ON "ProvaFeita"("usuarioId", "provaId");
