"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, CalendarCheck, CheckCircle2, Clock, Play, Shuffle, Timer, Zap } from "lucide-react";
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
      <p className="pagina-sub">Escolha sua energia — isso define o tamanho do bloco. Sem energia? Dez minutos já contam.</p>

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

      <div className="dash-secao">Seu progresso</div>
      <div className="dash-cards">
        <div className="card">
          <div className="card-rotulo"><CalendarCheck size={15} /> Dias ativos na semana</div>
          <div className="card-num">{ativos}<span style={{ color: "var(--dim)", fontSize: "0.5em", fontWeight: 600 }}> / {progresso.meta}</span></div>
          <div className="barras" aria-hidden="true" style={{ marginTop: 12 }}>
            {Array.from({ length: progresso.meta }).map((_, i) => (
              <div key={i} className={`tick ${i < ativos ? "on" : ""}`} />
            ))}
          </div>
        </div>
        <div className="card">
          <div className="card-rotulo"><CheckCircle2 size={15} /> Aulas concluídas</div>
          <div className="card-num ok">{feitasTotal}</div>
          <div className="card-pe">Total que não volta pra trás.</div>
        </div>
        <div className="card">
          <div className="card-rotulo"><Timer size={15} /> Tempo estudado</div>
          <div className="card-num">{tempo}</div>
          <div className="card-pe">Somando aulas, treinos e provas.</div>
        </div>
      </div>

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
