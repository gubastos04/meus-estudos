import type { Metadata } from "next";
import { EmBreve } from "@/components/EmBreve";

export const metadata: Metadata = { title: "Prática" };

export default function PaginaPratica() {
  return <EmBreve titulo="Prática" fase={3} itens={["Demandas com reviravolta", "Treino", "Provas", "Revisar"]} />;
}
