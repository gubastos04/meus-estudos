import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

// Criptografa segredos por usuário (a chave da API de cada um) antes de guardar no banco.
// AES-256-GCM; a chave vem de APP_SECRET. Sem APP_SECRET, guardar chave de IA é bloqueado.

const SEGREDO = process.env.APP_SECRET;

function chave(): Buffer {
  if (!SEGREDO || SEGREDO.length < 16) {
    throw new Error("APP_SECRET ausente ou curto demais. Defina um segredo forte no ambiente.");
  }
  // salt fixo derivado do próprio segredo: um só usuário-dono do servidor, chave estável
  return scryptSync(SEGREDO, "meus-estudos:v1", 32);
}

export const temSegredo = () => Boolean(SEGREDO && SEGREDO.length >= 16);

/** Devolve "iv.tag.dados" em base64url. */
export function cifrar(texto: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", chave(), iv);
  const dados = Buffer.concat([c.update(texto, "utf8"), c.final()]);
  const tag = c.getAuthTag();
  return [iv, tag, dados].map((b) => b.toString("base64url")).join(".");
}

/** Volta ao texto; devolve null se o pacote estiver corrompido ou a chave mudou. */
export function decifrar(pacote: string): string | null {
  try {
    const [iv, tag, dados] = pacote.split(".").map((p) => Buffer.from(p, "base64url"));
    if (!iv || !tag || !dados) return null;
    const d = createDecipheriv("aes-256-gcm", chave(), iv);
    d.setAuthTag(tag);
    return Buffer.concat([d.update(dados), d.final()]).toString("utf8");
  } catch {
    return null;
  }
}
