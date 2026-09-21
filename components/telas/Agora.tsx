"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Play, Shuffle, Zap } from "lucide-react";
import { BLOCO, ROTULO_ENERGIA, type Energia } from "@/lib/constantes";
import { diasAtivos, minutosTotais, proximaAula, useProgresso } from "@/lib/progresso";
import type { AulaResumo } from "@/lib/conteudo";

export const rotaAula = (a: { moduloId: string; id: string }) => `/trilha/${a.moduloId}/${a.id}`;

export function Agora({ aulas, micro }: { aulas: AulaResumo[]; micro: string[] }) {
  const { progresso, acoes } = useProgresso();
  const roteador = useRouter();
  const [missao, setMissao] = useState<string | null>(null);

  const bloco = BLOCO[progresso.energia];
  const proxima = proximaAula(aulas, progresso);
  const ativos = diasAtivos(progresso);
  const feitasTotal = Object.keys(progresso.feitas).length;
  const minutos = minutosTotais(progresso);
  const tempo = minutos >= 60 ? `${Math.floor(minutos / 60)}h ${minutos % 60}m` : `${minutos}m`;

  // ~60% abre uma aula que cabe no bloco, ~40% dá uma micro-missão de 5 minutos
  const sortear = () => {
    const cabem = aulas.filter((a) => !progresso.feitas[a.id] && a.temConteudo && a.minutos <= bloco + 5);
    if (cabem.length && Math.random() < 0.6) {
      roteador.push(rotaAula(cabem[Math.floor(Math.random() * cabem.length)]));
    } else {
      setMissao(micro[Math.floor(Math.random() * micro.length)]);
    }
  };

  return (
    <>
      <h1 className="pagina-t">No que vamos avançar?</h1>
      <p className="pagina-sub">Escolha sua energia: isso define o tamanho do bloco. Sem energia? Dez minutos já contam.</p>

      <div className="linha-bt" role="radiogroup" aria-label="Energia">
        {(Object.keys(BLOCO) as Energia[]).map((k) => (
          <button key={k} type="button" role="radio" aria-checked={progresso.energia === k}
            className={`pill ${progresso.energia === k ? "on" : ""}`} onClick={() => acoes.setEnergia(k)}>
            {ROTULO_ENERGIA[k]}<br />{BLOCO[k]} min
          </button>
        ))}
      </div>

      {proxima ? (
        <div className="agora">
          <div className="onde">Próxima aula · {proxima.moduloNome}</div>
          <div className="titulo">{proxima.titulo}</div>
          <div className="dur"><Clock size={15} /> {proxima.minutos} minutos</div>
          <Link href={rotaAula(proxima)} className="bt"><Play size={18} /> Começar aula</Link>
        </div>
      ) : (
        <div className="agora">
          <div className="onde">Por enquanto é isso</div>
          <div className="titulo">Você terminou o que está pronto do seu foco</div>
          <p className="nota" style={{ marginBottom: 18 }}>
            {feitasTotal} aulas concluídas. Mais conteúdo do seu foco vem chegando. Enquanto isso, dá pra revisar ou treinar.
          </p>
          <Link href="/trilha" className="bt-2"><BookOpen size={16} /> Ver a trilha</Link>
        </div>
      )}

      <div className="dash-secao">Sua semana</div>
      <div className="meta">
        <div className="meta-linha">
          <span>Dias ativos</span>
          <span>{ativos} de {progresso.meta}</span>
        </div>
        <div className="barras" aria-hidden="true">
          {Array.from({ length: progresso.meta }).map((_, i) => (
            <div key={i} className={`tick ${i < ativos ? "on" : ""}`} />
          ))}
        </div>
      </div>
      <p className="nota" style={{ marginTop: -12 }}>
        {feitasTotal} {feitasTotal === 1 ? "aula concluída" : "aulas concluídas"}, {tempo} estudados. O total não volta pra trás.
      </p>

      <div className="dash-secao">Sem saber por onde ir?</div>
      <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
        <button type="button" className="bt-2" onClick={sortear}><Shuffle size={16} /> Tô entediado</button>
        <Link href="/pratica" className="bt-2"><Zap size={16} /> Pegar uma demanda</Link>
      </div>

      {missao && (
        <div className="aviso" style={{ marginTop: 16 }}>
          <strong style={{ display: "block", marginBottom: 7 }}>Missão de 5 minutos</strong>
          {missao}
        </div>
      )}
    </>
  );
}
