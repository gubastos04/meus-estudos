"use client";

import { Moon, Sun, Type } from "lucide-react";
import { useProgresso } from "@/lib/progresso";

// Os dois controles de aparência, reusados na barra mobile e no rodapé da sidebar.
export function ControlesTema() {
  const { progresso, acoes } = useProgresso();
  const claro = progresso.tema === "claro";
  return (
    <div className="ctrl">
      <button type="button" onClick={acoes.proximaFonte} aria-label="Mudar tamanho do texto" title="Tamanho do texto">
        <Type size={17} />
      </button>
      <button type="button" onClick={acoes.alternarTema} aria-label="Mudar tema" title={claro ? "Tema escuro" : "Tema claro"}>
        {claro ? <Moon size={17} /> : <Sun size={17} />}
      </button>
    </div>
  );
}
