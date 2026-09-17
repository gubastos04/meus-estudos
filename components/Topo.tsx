"use client";

import Link from "next/link";
import { Moon, Sun, Type } from "lucide-react";
import { useProgresso } from "@/lib/progresso";

export function Topo() {
  const { progresso, acoes } = useProgresso();
  const claro = progresso.tema === "claro";

  return (
    <header className="topo">
      <Link href="/" className="marca">Meus Estudos<span>.</span></Link>
      <div className="ctrl">
        <button type="button" onClick={acoes.proximaFonte} aria-label="Mudar tamanho do texto" title="Tamanho do texto">
          <Type size={17} />
        </button>
        <button type="button" onClick={acoes.alternarTema} aria-label="Mudar tema" title={claro ? "Tema escuro" : "Tema claro"}>
          {claro ? <Moon size={17} /> : <Sun size={17} />}
        </button>
      </div>
    </header>
  );
}
