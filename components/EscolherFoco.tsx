"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { escolherFoco } from "@/lib/acoes";
import type { FocoDef } from "@/lib/conteudo";

export function EscolherFoco({ focos, atual }: { focos: FocoDef[]; atual: string | null }) {
  const roteador = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const [escolhido, setEscolhido] = useState<string | null>(atual);

  const confirmar = (id: string) => {
    setEscolhido(id);
    setErro(null);
    iniciar(async () => {
      const r = await escolherFoco(id);
      if (r.ok) { roteador.replace("/"); roteador.refresh(); }
      else { setErro(r.erro); }
    });
  };

  return (
    <div className="wrap" style={{ paddingTop: 40, maxWidth: 560 }}>
      <div className="marca" style={{ marginBottom: 10 }}>Meus Estudos<span>.</span></div>
      <h1 className="h2">{atual ? "Trocar de foco" : "Qual é o seu foco?"}</h1>
      <p className="sub">
        Todo mundo faz a mesma base (lógica e Python). Depois, o seu foco define os módulos avançados,
        os projetos e a voz da IA. Dá pra trocar depois, sem perder o progresso da base.
      </p>

      {focos.map((f) => {
        const on = escolhido === f.id;
        return (
          <button key={f.id} type="button" className={`cartao ${on ? "ok" : ""}`} disabled={pendente}
            onClick={() => confirmar(f.id)} style={{ alignItems: "flex-start" }}>
            <span style={{ flex: 1 }}>
              <span className="cartao-t">{f.nome}</span>
              <span className="cartao-m">{f.descricao}</span>
            </span>
            {on && <Check size={18} color="var(--done)" style={{ flexShrink: 0, marginTop: 2 }} />}
          </button>
        );
      })}

      {erro && <div className="aviso aviso-falha" style={{ marginTop: 12 }}>{erro}</div>}
    </div>
  );
}
