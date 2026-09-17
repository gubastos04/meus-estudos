import type { Metadata } from "next";
import { glossario } from "@/lib/conteudo";
import { Caderno, type Aba } from "@/components/telas/Caderno";

export const metadata: Metadata = { title: "Caderno" };

const ABAS: Aba[] = ["notas", "erros", "glossario"];

export default async function PaginaCaderno({ searchParams }: PageProps<"/caderno">) {
  const { aba } = await searchParams;
  const inicial = ABAS.includes(aba as Aba) ? (aba as Aba) : "notas";
  return <Caderno abaInicial={inicial} termos={glossario()} />;
}
