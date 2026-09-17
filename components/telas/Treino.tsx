"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { useProgresso } from "@/lib/progresso";
import type { Treino } from "@/lib/conteudo";
import { Cronometro } from "@/components/Cronometro";
import { useCronometro } from "@/components/useCronometro";
import { Codigo } from "@/components/Codigo";

export function TreinoView({ treino: t }: { treino: Treino }) {
  const { progresso, acoes } = useProgresso();
  const roteador = useRouter();
  const { segundos } = useCronometro();
  const [verDica, setVerDica] = useState(false);
  const [verSolucao, setVerSolucao] = useState(false);

  const feito = progresso.treinos[t.id];

  const resolver = (sozinho: boolean) => {
    acoes.resolverTreino(t.id, sozinho, segundos);
    roteador.push("/pratica?aba=treino");
  };

  return (
    <>
      <div className="barra-aula">
        <Link href="/pratica?aba=treino" className="bt-2"><ArrowLeft size={16} /> Voltar</Link>
        <Cronometro segundos={segundos} blocoMin={t.tempo} />
      </div>

      <h2 className="h2">{t.titulo}</h2>
      <p className="sub" style={{ marginBottom: 22 }}>{t.nivel}</p>

      <p className="resumo">{t.enunciado}</p>

      <section className="secao">
        <div className="secao-t">Exemplos</div>
        {t.exemplos.map((x, i) => (
          <div className="ex" key={i}>
            <span><b>entra</b> {x.entra}</span>
            <span><b>sai</b> {x.sai}</span>
          </div>
        ))}
      </section>

      <section className="secao">
        {verDica
          ? <div className="porque">{t.dica}</div>
          : <button type="button" className="bt-2" onClick={() => setVerDica(true)}>Estou travado, me dá uma dica</button>}
      </section>

      <section className="secao">
        {verSolucao ? (
          <>
            <div className="secao-t">Uma solução</div>
            <Codigo>{t.solucao}</Codigo>
            <div className="custo">{t.custo}</div>
          </>
        ) : (
          <button type="button" className="bt-2" onClick={() => setVerSolucao(true)}>Ver a solução</button>
        )}
      </section>

      <div className="rodape">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" className="bt" onClick={() => resolver(true)}>
            <Check size={18} /> Resolvi sozinho
          </button>
          <button type="button" className="bt-2" onClick={() => resolver(false)}>
            Resolvi com ajuda
          </button>
        </div>
        <p className="nota" style={{ marginTop: 14 }}>
          {feito
            ? `Já feito em ${feito.dia}${feito.sozinho ? ", sozinho" : ", com ajuda"}. Refazer daqui a uma semana é o que fixa.`
            : "Seja honesto aqui. O registro só serve se for verdade."}
        </p>
      </div>
    </>
  );
}
