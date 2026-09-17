"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, ChevronRight, Circle, Lock } from "lucide-react";
import { Abas } from "@/components/Abas";
import { useProgresso } from "@/lib/progresso";
import type { ModuloMeta } from "@/lib/conteudo";

type AulaItem = { id: string; titulo: string; minutos: number; temConteudo: boolean };
type ModuloItem = ModuloMeta & { aulas: AulaItem[] };
type ProjetoItem = { id: string; titulo: string; nivel: number; tempo: string; modulo: string };

const ABAS = [{ id: "modulos", rotulo: "Módulos" }, { id: "projetos", rotulo: "Projetos" }] as const;
type Aba = (typeof ABAS)[number]["id"];

const ETIQUETA = { base: null, fullstack: "full stack", seguranca: "segurança" } as const;

export function Trilha({ modulos, projetos }: { modulos: ModuloItem[]; projetos: ProjetoItem[] }) {
  const { progresso } = useProgresso();
  const [aba, setAba] = useState<Aba>("modulos");

  // abre por padrão o módulo onde está a próxima aula com conteúdo
  const inicial = modulos.find((m) => m.aulas.some((a) => a.temConteudo && !progresso.feitas[a.id]))?.id ?? modulos[0]?.id ?? null;
  const [aberto, setAberto] = useState<string | null>(inicial);

  return (
    <>
      <Abas itens={ABAS} ativa={aba} aoMudar={setAba} />

      {aba === "modulos" && (
        <>
          <h2 className="h2">Sua trilha</h2>
          <p className="sub">Doze módulos, do zero até escrever suas próprias ferramentas. A ordem importa, mas nada está trancado.</p>

          {modulos.map((m) => {
            const feitas = m.aulas.filter((a) => progresso.feitas[a.id]).length;
            const estaAberto = aberto === m.id;
            const etiqueta = ETIQUETA[m.etiqueta];
            return (
              <div className="mod" key={m.id}>
                <button type="button" className="mod-cab" aria-expanded={estaAberto} onClick={() => setAberto(estaAberto ? null : m.id)}>
                  <span className="num">{String(m.ordem).padStart(2, "0")}</span>
                  <span style={{ flex: 1 }}>
                    <span className="mod-nome">{m.nome}</span>
                    <span className="mod-fac">Faculdade: {m.faculdade}{etiqueta && ` · ${etiqueta}`}</span>
                  </span>
                  <span className={`mod-prog ${feitas === m.aulas.length ? "full" : ""}`}>{feitas}/{m.aulas.length}</span>
                  {estaAberto ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
                </button>

                {estaAberto && (
                  <div className="aulas">
                    <p className="nota">{m.descricao}</p>
                    {m.aulas.map((a) => {
                      const feita = Boolean(progresso.feitas[a.id]);
                      return (
                        <Link key={a.id} href={`/trilha/${m.id}/${a.id}`} className={`aula-item ${feita ? "feita" : ""}`}>
                          {feita ? <Check size={16} color="var(--done)" aria-label="concluída" />
                            : a.temConteudo ? <Circle size={14} color="var(--dim)" aria-hidden="true" />
                              : <Lock size={14} color="var(--dim)" aria-label="sem conteúdo ainda" />}
                          <span className="aula-t">{a.titulo}</span>
                          <span className="aula-min">{a.minutos}m</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ height: 1, background: "var(--line)" }} />
        </>
      )}

      {aba === "projetos" && (
        <>
          <h2 className="h2">Projetos de portfólio</h2>
          <p className="sub">
            Cada um vira um repositório no GitHub. Todos vêm com escopo fechado, critérios de pronto,
            README modelo e rascunho de post pro LinkedIn. O que está fora do escopo é tão importante
            quanto o que está dentro.
          </p>
          {projetos.map((p) => {
            const ok = Boolean(progresso.projetos[p.id]);
            return (
              <Link key={p.id} href={`/projetos/${p.id}`} className={`cartao ${ok ? "ok" : ""}`}>
                <span style={{ flex: 1 }}>
                  <span className="cartao-t">{p.titulo}</span>
                  <span className="cartao-m">{p.modulo} · {p.tempo}</span>
                </span>
                <span className={`selo ${ok ? "ok" : ""}`}>{ok ? "no GitHub" : `nível ${p.nivel}`}</span>
              </Link>
            );
          })}
        </>
      )}
    </>
  );
}
