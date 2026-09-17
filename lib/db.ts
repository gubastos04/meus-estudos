import "server-only";
import { PrismaClient } from "@prisma/client";

// Uma instância só. Em dev, o hot reload recriaria o cliente a cada mudança
// e esgotaria conexões; guardar no globalThis evita isso.
const global = globalThis as unknown as { prisma?: PrismaClient };

export const db = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = db;
