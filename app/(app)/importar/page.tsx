import type { Metadata } from "next";
import { Importar } from "@/components/telas/Importar";

export const metadata: Metadata = { title: "Importar progresso" };

export default function PaginaImportar() {
  return <Importar />;
}
