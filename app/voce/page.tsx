import type { Metadata } from "next";
import { EmBreve } from "@/components/EmBreve";

export const metadata: Metadata = { title: "Você" };

export default function PaginaVoce() {
  return <EmBreve titulo="Você" fase={4} itens={["Progresso", "Banco de entrevista", "Certificados e labs"]} />;
}
