"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useProgresso } from "@/lib/progresso";
import type { Projeto } from "@/lib/conteudo";
import { Codigo } from "@/components/Codigo";

function BotaoCopiar({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<"parado" | "copiado" | "falhou">("parado");
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setEstado("copiado");
    } catch {
      setEstado("falhou");
    }
    setTimeout(() => setEstado("parado"), 2500);
  };
  return (
    <button type="button" className="mini" onClick={copiar}>
      {estado === "copiado" ? "copiado" : estado === "falhou" ? "selecione e copie" : "copiar"}
    </button>
  );
}

export function ProjetoView({ projeto: p }: { projeto: Projeto }) {
  const { progresso, acoes } = useProgresso();
  const feito = Boolean(progresso.projetos[p.id]);

  return (
    <>
      <div className="barra-aula">
        <Link href="/trilha" className="bt-2"><ArrowLeft size={16} /> Voltar</Link>
        <span className="cartao-m">{p.tempo}</span>
      </div>

      <h2 className="h2">{p.titulo}</h2>
      <p className="sub" style={{ marginBottom: 22 }}>{p.modulo}</p>

      <p className="pitch">{p.pitch}</p>

      <section className="secao">
        <div className="secao-t">Por que isso vale no portfólio</div>
        <p className="prosa">{p.porque}</p>
      </section>

      <section className="secao">
        <div className="secao-t">Escopo</div>
        <div className="col2">
          <div className="cx">
            <div className="cx-t sim">O projeto faz</div>
            <ul>{p.escopo.faz.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
          <div className="cx">
            <div className="cx-t nao">O projeto não faz</div>
            <ul>{p.escopo.naoFaz.map((x, i) => <li key={i}>{x}</li>)}</ul>
          </div>
        </div>
        <p className="nota" style={{ marginTop: 14 }}>
          A lista do que não faz é a mais importante. Projeto sem limite escrito é projeto que você abandona no meio.
        </p>
      </section>

      <section className="secao">
        <div className="secao-t">Passo a passo</div>
        {p.passos.map((s, i) => (
          <div className="passo" key={i}>
            <span className="passo-n">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="passo-t">{s.titulo}</span>
              <span className="passo-d">{s.descricao}</span>
            </span>
          </div>
        ))}
      </section>

      <section className="secao">
        <div className="secao-t">Está pronto quando</div>
        {p.pronto.map((c, i) => (
          <div className="crit" key={i}>
            <span className="caixa" aria-hidden="true" />
            <span>{c}</span>
          </div>
        ))}
      </section>

      <section className="secao">
        <div className="copiar">
          <div className="secao-t" style={{ marginBottom: 0 }}>README modelo</div>
          <BotaoCopiar texto={p.readme} />
        </div>
        <Codigo>{p.readme}</Codigo>
        <p className="nota" style={{ marginTop: 12 }}>As lacunas em [colchetes] são de propósito. Preencha com o que você viveu.</p>
      </section>

      <section className="secao">
        <div className="copiar">
          <div className="secao-t" style={{ marginBottom: 0 }}>Rascunho pro LinkedIn</div>
          <BotaoCopiar texto={p.linkedin} />
        </div>
        <Codigo>{p.linkedin}</Codigo>
        <p className="nota" style={{ marginTop: 12 }}>
          Troque pelas suas palavras antes de publicar. O valor do post está no detalhe específico que
          só você viveu, não no texto pronto.
        </p>
      </section>

      <div className="rodape">
        <button type="button" className={feito ? "bt-2" : "bt"} onClick={() => acoes.alternarProjeto(p.id)}>
          <Check size={18} /> {feito ? "Publicado, desmarcar" : "Publiquei no GitHub"}
        </button>
      </div>
    </>
  );
}
