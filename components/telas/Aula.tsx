"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, ChevronDown, ChevronRight, Plus, X } from "lucide-react";
import { BLOCO } from "@/lib/constantes";
import { useProgresso } from "@/lib/progresso";
import type { AulaComModulo } from "@/lib/conteudo";
import { Cronometro } from "@/components/Cronometro";
import { useCronometro } from "@/components/useCronometro";
import { QuestaoImediata } from "@/components/Quiz";
import { Codigo } from "@/components/Codigo";
import { Corretor, NaoEntendeu } from "@/components/IA";

export function AulaView({ aula }: { aula: AulaComModulo }) {
  const { progresso, acoes } = useProgresso();
  const roteador = useRouter();
  const { segundos } = useCronometro();
  const [verMais, setVerMais] = useState(false);
  const [verSolucao, setVerSolucao] = useState(false);
  const [texto, setTexto] = useState("");

  const bloco = BLOCO[progresso.energia];
  const passou = segundos >= bloco * 60;
  const jaFeita = Boolean(progresso.feitas[aula.id]);
  const notas = progresso.notas.filter((n) => n.aulaId === aula.id);

  const salvarNota = () => {
    const t = texto.trim();
    if (!t) return;
    acoes.anotar(t, { id: aula.id, titulo: aula.titulo });
    setTexto("");
  };

  const concluir = () => {
    acoes.concluirAula(aula.id, segundos);
    roteador.push("/");
  };

  const desmarcar = () => {
    acoes.desmarcarAula(aula.id);
    roteador.push("/trilha");
  };

  // Aula só com título: instrução, não tela vazia.
  if (!aula.ideia) {
    return (
      <>
        <div className="barra-aula">
          <Link href="/trilha" className="bt-2"><ArrowLeft size={16} /> Voltar</Link>
        </div>
        <h2 className="h2">{aula.titulo}</h2>
        <p className="sub">{aula.moduloNome}</p>
        <div className="aviso">
          Esta aula ainda não tem conteúdo escrito. Ela entra em
          {" "}<code className="inl">content/aulas/{aula.moduloId}.json</code>, no mesmo formato das aulas dos módulos 1 e 2.
          <br /><br />
          Peça no chat: <code className="inl">escreve o módulo &quot;{aula.moduloNome}&quot;</code>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="barra-aula">
        <Link href="/trilha" className="bt-2"><ArrowLeft size={16} /> Voltar</Link>
        <Cronometro segundos={segundos} blocoMin={bloco} />
      </div>

      <h2 className="h2">{aula.titulo}</h2>
      <p className="sub" style={{ marginBottom: 22 }}>{aula.moduloNome}</p>

      {aula.resumo && <p className="resumo">{aula.resumo}</p>}

      <section className="secao">
        <div className="secao-t">Ideia</div>
        {aula.ideia.map((l, i) => <p key={i} className="prosa">{l}</p>)}
      </section>

      {aula.exemplo && (
        <section className="secao">
          <div className="secao-t">Exemplo</div>
          {aula.exemplo.nota && <p className="nota">{aula.exemplo.nota}</p>}
          <Codigo>{aula.exemplo.codigo}</Codigo>
        </section>
      )}

      {aula.mais && (
        <section className="secao">
          <button type="button" className="mais-bt" aria-expanded={verMais} onClick={() => setVerMais(!verMais)}>
            {verMais ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {aula.mais.titulo}
          </button>
          {verMais && (
            <div className="mais-corpo">
              {aula.mais.linhas.map((l, i) => (
                <p key={i} className="prosa" style={{ marginBottom: i === aula.mais!.linhas.length - 1 ? 0 : 12 }}>{l}</p>
              ))}
            </div>
          )}
        </section>
      )}

      {aula.quiz && (
        <section className="secao">
          <div className="secao-t">Teste rápido</div>
          {aula.quiz.map((q, i) => <QuestaoImediata key={i} q={q} />)}
        </section>
      )}

      {aula.desafio && (
        <section className="secao">
          <div className="secao-t">Desafio</div>
          <p className="prosa">{aula.desafio.pergunta}</p>
          {verSolucao
            ? <Codigo>{aula.desafio.solucao}</Codigo>
            : <button type="button" className="bt-2" onClick={() => setVerSolucao(true)}>Ver uma solução</button>}
          <Corretor titulo={aula.titulo} enunciado={aula.desafio.pergunta} solucao={aula.desafio.solucao}
            criterios={["Resolve o que o enunciado pede", "O código roda sem erro", "Trata o caso vazio ou limite, se houver"]} />
        </section>
      )}

      <section className="secao">
        <NaoEntendeu titulo={aula.titulo} modulo={aula.moduloNome} resumo={aula.resumo}
          ideia={aula.ideia} exemplo={aula.exemplo?.codigo} />
      </section>

      <section className="secao">
        <div className="secao-t">Suas anotações desta aula</div>
        {notas.map((n) => (
          <div className="nota-item" key={n.id}>
            <div style={{ flex: 1 }}>
              <div className="nota-data">{n.dia}</div>
              {n.texto}
            </div>
            <button type="button" className="lixo" onClick={() => acoes.apagarNota(n.id)} aria-label="Apagar nota">
              <X size={16} />
            </button>
          </div>
        ))}
        <textarea className="campo" value={texto} onChange={(ev) => setTexto(ev.target.value)}
          placeholder="Dúvida, comando que você quer lembrar, o que não entendeu..." />
        <button type="button" className="bt-2" style={{ marginTop: 10 }} onClick={salvarNota} disabled={!texto.trim()}>
          <Plus size={16} /> Salvar nota
        </button>
      </section>

      <div className="rodape">
        {jaFeita ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--done)" }}>
              <Check size={18} /> Aula concluída
            </span>
            <button type="button" className="bt-2" onClick={desmarcar}>Desmarcar</button>
          </div>
        ) : (
          <button type="button" className="bt" onClick={concluir}>
            <Check size={18} /> Marcar como feita
          </button>
        )}
        <p className="nota" style={{ marginTop: 14 }}>
          {passou
            ? "Seu bloco acabou. Marcar como feita agora já é lucro."
            : "Parou no meio? Volte depois. Nada aqui te pune por isso."}
        </p>
      </div>
    </>
  );
}
