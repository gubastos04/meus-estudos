import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const COOKIE = "sessao";
const DIAS = 60;
// hash fixo para comparar quando o e-mail não existe, evitando vazar isso pelo tempo de resposta
const HASH_FALSO = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8DvY4V0i7Xr7e0f5N9y2b8s6qE0m1a";

export type UsuarioSessao = { id: string; email: string };

const Email = z.string().trim().toLowerCase().email("E-mail inválido").max(200);
const Senha = z.string().min(8, "A senha precisa de pelo menos 8 caracteres").max(200);

/** Usuário logado nesta requisição, ou null. Deduplicado por requisição. */
export const usuarioAtual = cache(async (): Promise<UsuarioSessao | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const sessao = await db.sessaoLogin.findUnique({ where: { token }, include: { usuario: true } });
  if (!sessao || sessao.expiraEm < new Date()) return null;
  return { id: sessao.usuario.id, email: sessao.usuario.email };
});

/** Para actions e rotas: exige login, senão lança. */
export async function requisitarUsuario(): Promise<UsuarioSessao> {
  const u = await usuarioAtual();
  if (!u) throw new Error("não autenticado");
  return u;
}

async function abrirSessao(usuarioId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + DIAS * 864e5);
  await db.sessaoLogin.create({ data: { token, usuarioId, expiraEm } });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DIAS * 86400,
  });
}

type Resultado = { ok: true } | { ok: false; erro: string };

export async function criarConta(email: string, senha: string, codigo?: string): Promise<Resultado> {
  const exige = process.env.CODIGO_CONVITE;
  if (exige && (codigo ?? "").trim() !== exige) {
    return { ok: false, erro: "Código de convite errado. Este app é por convite." };
  }
  const e = Email.safeParse(email);
  if (!e.success) return { ok: false, erro: e.error.issues[0].message };
  const s = Senha.safeParse(senha);
  if (!s.success) return { ok: false, erro: s.error.issues[0].message };

  const jaTem = await db.usuario.findUnique({ where: { email: e.data } });
  if (jaTem) return { ok: false, erro: "Já existe uma conta com esse e-mail. Tente entrar." };

  const senhaHash = await bcrypt.hash(s.data, 10);
  const u = await db.usuario.create({ data: { email: e.data, senhaHash } });
  await abrirSessao(u.id);
  return { ok: true };
}

export async function entrar(email: string, senha: string): Promise<Resultado> {
  const e = Email.safeParse(email);
  if (!e.success) return { ok: false, erro: "E-mail ou senha errados." };

  const u = await db.usuario.findUnique({ where: { email: e.data } });
  const confere = await bcrypt.compare(senha, u?.senhaHash ?? HASH_FALSO);
  if (!u || !confere) return { ok: false, erro: "E-mail ou senha errados." };

  await abrirSessao(u.id);
  return { ok: true };
}

export async function sair() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db.sessaoLogin.deleteMany({ where: { token } });
  jar.delete(COOKIE);
}
