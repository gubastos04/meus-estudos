"use server";

// Ponte para o cliente chamar as funções de sessão (que escrevem o cookie).
import * as auth from "@/lib/auth";

export async function entrar(email: string, senha: string) {
  return auth.entrar(email, senha);
}
export async function criarConta(email: string, senha: string, codigo?: string) {
  return auth.criarConta(email, senha, codigo);
}
export async function sair() {
  return auth.sair();
}
