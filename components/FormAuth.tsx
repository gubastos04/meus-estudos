"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { criarConta, entrar } from "@/lib/acoes-auth";

type Modo = "entrar" | "criar";

export function FormAuth({ modo, exigeConvite }: { modo: Modo; exigeConvite: boolean }) {
  const roteador = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const criando = modo === "criar";

  // Inputs não-controlados: lê tudo do formulário no envio. Funciona com
  // gerenciador de senha e não depende de estado a cada tecla.
  const enviar = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const dados = new FormData(ev.currentTarget);
    const email = String(dados.get("email") ?? "");
    const senha = String(dados.get("senha") ?? "");
    const codigo = String(dados.get("codigo") ?? "");
    setErro(null);
    iniciar(async () => {
      const r = criando ? await criarConta(email, senha, codigo) : await entrar(email, senha);
      if (r.ok) {
        roteador.replace("/");
        roteador.refresh();
      } else {
        setErro(r.erro);
      }
    });
  };

  return (
    <div className="auth-cartao">
      <div className="marca auth-marca-mobile">Meus Estudos<span>.</span></div>
      <h1 className="h2" style={{ marginBottom: 6 }}>{criando ? "Criar conta" : "Entrar"}</h1>
      <p className="sub" style={{ marginBottom: 22 }}>
        {criando
          ? "Uma conta, o mesmo progresso no celular e no computador."
          : "Bem-vindo de volta. Continue de onde parou."}
      </p>

      <form onSubmit={enviar}>
        <div style={{ marginBottom: 14 }}>
          <label className="rotulo" htmlFor="email">E-mail</label>
          <input id="email" name="email" className="busca" type="email" autoComplete="email" required
            placeholder="voce@exemplo.com" />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="rotulo" htmlFor="senha">Senha</label>
          <input id="senha" name="senha" className="busca" type="password"
            autoComplete={criando ? "new-password" : "current-password"} required minLength={8}
            placeholder={criando ? "pelo menos 8 caracteres" : "sua senha"} />
        </div>
        {criando && exigeConvite && (
          <div style={{ marginBottom: 14 }}>
            <label className="rotulo" htmlFor="codigo">Código de convite</label>
            <input id="codigo" name="codigo" className="busca" type="text" placeholder="o código que te passaram" />
          </div>
        )}

        {erro && <div className="aviso aviso-falha" style={{ marginBottom: 16 }}>{erro}</div>}

        <button type="submit" className="bt" style={{ width: "100%", justifyContent: "center" }} disabled={pendente}>
          {pendente ? "Um instante..." : criando ? "Criar conta" : "Entrar"}
        </button>
      </form>

      <p className="nota" style={{ marginTop: 20, textAlign: "center" }}>
        {criando ? (
          <>Já tem conta? <Link href="/entrar" className="link">Entrar</Link></>
        ) : (
          <>Ainda não tem conta? <Link href="/criar-conta" className="link">Criar uma</Link></>
        )}
      </p>
    </div>
  );
}
