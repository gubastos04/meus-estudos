"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { escolherFoco, escolherStack } from "@/lib/acoes";
import type { FocoDef, StackDef } from "@/lib/conteudo";

// O foco back-end tem uma segunda pergunta: qual stack. O conceito é ensinado
// uma vez e o código vem nas três, então dá pra trocar depois sem perder nada.
const COM_STACK = "backend";

export function EscolherFoco({ focos, stacks, atual, stackAtual }: {
  focos: FocoDef[]; stacks: StackDef[]; atual: string | null; stackAtual: string | null;
}) {
  const roteador = useRouter();
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const [escolhido, setEscolhido] = useState<string | null>(atual);
  const [stack, setStack] = useState<string | null>(stackAtual);

  const sair = () => { roteador.replace("/"); roteador.refresh(); };

  const confirmarFoco = (id: string) => {
    setEscolhido(id);
    setErro(null);
    iniciar(async () => {
      const r = await escolherFoco(id);
      if (!r.ok) { setErro(r.erro); return; }
      if (id !== COM_STACK) sair();   // no back-end, a tela continua na pergunta da stack
    });
  };

  const confirmarStack = (id: string) => {
    setStack(id);
    setErro(null);
    iniciar(async () => {
      const r = await escolherStack(id);
      if (r.ok) sair();
      else setErro(r.erro);
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
            onClick={() => confirmarFoco(f.id)} style={{ alignItems: "flex-start" }}>
            <span style={{ flex: 1 }}>
              <span className="cartao-t">{f.nome}</span>
              <span className="cartao-m">{f.descricao}</span>
            </span>
            {on && <Check size={18} color="var(--done)" style={{ flexShrink: 0, marginTop: 2 }} />}
          </button>
        );
      })}

      {escolhido === COM_STACK && (
        <>
          <h2 className="h2" style={{ marginTop: 32 }}>E com qual stack?</h2>
          <p className="sub">
            A trilha é uma só: o conceito é explicado uma vez e o código aparece nas três, lado a lado.
            Esta escolha decide qual delas abre primeiro em cada aula, e você troca quando quiser.
          </p>

          {stacks.map((s) => {
            const on = stack === s.id;
            return (
              <button key={s.id} type="button" className={`cartao ${on ? "ok" : ""}`} disabled={pendente}
                onClick={() => confirmarStack(s.id)} style={{ alignItems: "flex-start" }}>
                <span style={{ flex: 1 }}>
                  <span className="cartao-t">{s.nome}</span>
                  <span className="cartao-m">{s.descricao}</span>
                </span>
                {on && <Check size={18} color="var(--done)" style={{ flexShrink: 0, marginTop: 2 }} />}
              </button>
            );
          })}

          {/* uma decisão por vez: dá pra começar sem escolher, e a primeira stack abre por padrão */}
          <button type="button" className="bt-2" style={{ marginTop: 12 }} disabled={pendente} onClick={sair}>
            Decidir depois
          </button>
        </>
      )}

      {erro && <div className="aviso aviso-falha" style={{ marginTop: 12 }}>{erro}</div>}
    </div>
  );
}
