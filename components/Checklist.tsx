import { Check } from "lucide-react";

/** Um critério marcável. A honestidade é do usuário; o app só registra. */
export function Criterio({ texto, marcado, aoAlternar }: { texto: string; marcado: boolean; aoAlternar?: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={marcado} className={`crit ${marcado ? "on" : ""}`}
      onClick={aoAlternar} style={aoAlternar ? undefined : { cursor: "default" }}>
      <span className="caixa" aria-hidden="true">{marcado && <Check size={13} color="var(--ink)" />}</span>
      <span>{texto}</span>
    </button>
  );
}
