-- CreateTable
CREATE TABLE "UsoIA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "UsoIA_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UsoIA_usuarioId_dia_key" ON "UsoIA"("usuarioId", "dia");
