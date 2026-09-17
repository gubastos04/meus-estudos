"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { useProgresso } from "@/lib/progresso";
import type { Demanda } from "@/lib/conteudo";
import { Cronometro } from "@/components/Cronometro";
import { useCronometro } from "@/components/useCronometro";
import { Criterio } from "@/components/Checklist";
import { Codigo } from "@/components/Codigo";
import { Corretor } from "@/components/IA";
import { rotuloCanal } from "@/components/telas/Pratica";

export function DemandaView({ demanda: d }: { demanda: Demanda }) {
  const { progresso, acoes } = useProgresso();
  const roteador = useRouter();
  const { segundos } = useCronometro();
  const [marcados, setMarcados] = useState<Record<number, boolean>>({});
  const [virou, setVirou] = useState(false);
  const [verSolucao, setVerSolucao] = useState(false);

  const feita = Boolean(progresso.demandas[d.id]);
  const remetente = d.de.split(",")[0];

  // A reviravolta entra depois da primeira entrega: o escopo muda, como no trabalho.
  const criterios = [...d.criterios, ...(virou && d.reviravolta ? d.reviravolta.criterios : [])];
  const atendidos = criterios.filter((_, i) => marcados[i]).length;
  const faltaVirada = !virou && Boolean(d.reviravolta);

  const entregar = () => {
    if (faltaVirada) { setVirou(true); return; }
    acoes.entregarDemanda(d.id, segundos);
    roteador.push("/pratica?aba=demandas");
  };

  return (
    <>
      <div className="barra-aula">
        <Link href="/pratica?aba=demandas" className="bt-2"><ArrowLeft size={16} /> Voltar</Link>
        <Cronometro segundos={segundos} />
      </div>

      <h2 className="h2">{d.titulo}</h2>
      <p className="sub" style={{ marginBottom: 22 }}>
        Prazo: {d.prazo}{d.depois ? ` · vem depois de: ${d.depois}` : ""}
      </p>

      <div className="msg">
        <div className="msg-cab">
          <span className="msg-de">{d.de}</span>
          <span className="msg-canal">{rotuloCanal(d)}</span>
        </div>
        <div className="msg-corpo">{d.mensagem}</div>
      </div>

      {virou && d.reviravolta && (
        <div className="msg novo">
          <div className="msg-cab">
            <span className="msg-de">{d.de}</span>
            <span className="msg-canal">mudou o escopo</span>
          </div>
          <div className="msg-corpo">{d.reviravolta.texto}</div>
        </div>
      )}

      <section className="secao">
        <div className="secao-t">Critérios de aceite</div>
        {criterios.map((c, i) => (
          <Criterio key={i} texto={c} marcado={Boolean(marcados[i])}
            aoAlternar={() => setMarcados((m) => ({ ...m, [i]: !m[i] }))} />
        ))}
        <div className="contador">{atendidos} de {criterios.length} atendidos</div>

        <button type="button" className="bt" onClick={entregar}>
          <Check size={18} /> {faltaVirada ? `Entregar pro ${remetente}` : feita ? "Entregar de novo" : "Fechar a demanda"}
        </button>
      </section>

      <section className="secao">
        <div className="secao-t">Uma solução possível</div>
        {verSolucao ? (
          <>
            <Codigo>{d.solucao}</Codigo>
            <p className="nota" style={{ marginTop: 12 }}>{d.aprendizado}</p>
          </>
        ) : (
          <button type="button" className="bt-2" onClick={() => setVerSolucao(true)}>Ver depois de tentar</button>
        )}
        <Corretor titulo={d.titulo} enunciado={d.mensagem} criterios={criterios} solucao={d.solucao} />
      </section>
    </>
  );
}
