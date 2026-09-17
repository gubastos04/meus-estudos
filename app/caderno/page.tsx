import type { Metadata } from "next";
import { EmBreve } from "@/components/EmBreve";

export const metadata: Metadata = { title: "Caderno" };

export default function PaginaCaderno() {
  return <EmBreve titulo="Caderno" fase={4} itens={["Notas", "Diário de erro", "Glossário"]} />;
}
