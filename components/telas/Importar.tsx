"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { conferirPrototipo, importarPrototipo } from "@/lib/acoes";
import { useProgresso } from "@/lib/progresso";

type Resumo = Awaited<ReturnType<typeof conferirPrototipo>> & { ok: true };

export function Importar() {
  const { acoes } = useProgresso();
  const [bruto, setBruto] = useState("");
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [feito, setFeito] = useState(false);
  const [pendente, iniciar] = useTransition();

  const conferir = () => iniciar(async () => {
    setErro(null); setResumo(null); setFeito(false);
    const r = await conferirPrototipo(bruto);
    if (r.ok) setResumo(r);
    else setErro(r.erro);
  });

  const importar = () => iniciar(async () => {
    const r = await importarPrototipo(bruto);
    if (!r.ok) { setErro(r.erro); return; }
    acoes.substituir(r.progresso);
    setFeito(true);
  });

  const n = resumo?.resumo;

  return (
    <>
      <div className="barra-aula">
        <Link href="/voce" className="bt-2"><ArrowLeft size={16} /> Voltar</Link>
      </div>

      <h2 className="h2">Importar do protótipo</h2>
      <p className="sub">
        Cole aqui o JSON que o protótipo guardava (chave <code className="inl">centro:estado:v1</code>).
        Primeiro conferimos o que tem dentro; só depois grava.
      </p>

      <div className="aviso" style={{ marginBottom: 18 }}>
        Importar <strong>substitui</strong> todo o progresso que existe aqui hoje. Não é uma soma.
      </div>

      <textarea className="campo" value={bruto} onChange={(ev) => setBruto(ev.target.value)}
        placeholder='{"feitas":{"m1a1":"2026-09-01"}, ...}' spellCheck={false}
        style={{ fontFamily: "var(--font-mono)", fontSize: "var(--f-code)", minHeight: 160 }} />

      <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
        <button type="button" className="bt-2" onClick={conferir} disabled={!bruto.trim() || pendente}>
          {pendente && !resumo ? "Lendo..." : "Conferir"}
        </button>
      </div>

      {erro && <div className="aviso aviso-falha" style={{ marginTop: 18, whiteSpace: "pre-wrap" }}>{erro}</div>}

      {n && !feito && (
        <section className="secao" style={{ marginTop: 26 }}>
          <div className="secao-t">O que vai entrar</div>
          {[
            ["Aulas concluídas", n.aulas],
            ["Sessões de estudo", `${n.sessoes} (${Math.floor(n.minutos / 60)}h ${n.minutos % 60}m)`],
            ["Notas", n.notas],
            ["Erros no diário", n.erros],
            ["Demandas entregues", n.demandas],
            ["Treinos feitos", n.treinos],
            ["Projetos publicados", n.projetos],
            ["Provas feitas", n.provas],
            ["Demandas geradas por IA", n.geradas],
          ].map(([rotulo, valor]) => (
            <div className="stat" key={String(rotulo)}>
              <span className="stat-l">{rotulo}</span>
              <span className="stat-n">{valor}</span>
            </div>
          ))}
          {resumo.geradasIgnoradas > 0 && (
            <p className="nota" style={{ marginTop: 12 }}>
              {resumo.geradasIgnoradas} demanda(s) gerada(s) estava(m) em formato que não dá pra ler e vão ficar de fora.
            </p>
          )}
          <button type="button" className="bt" style={{ marginTop: 18 }} onClick={importar} disabled={pendente}>
            <Check size={18} /> {pendente ? "Gravando..." : "Importar e substituir o que existe"}
          </button>
        </section>
      )}

      {feito && (
        <div className="porque" style={{ marginTop: 22 }}>
          Importado. Seu progresso antigo está aqui agora, nos dois aparelhos assim que houver login.
          {" "}<Link href="/" style={{ color: "var(--amber)" }}>Ir para Agora</Link>
        </div>
      )}
    </>
  );
}
