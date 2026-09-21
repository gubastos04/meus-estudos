import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prova as buscarProva, provas } from "@/lib/conteudo";
import { ProvaAlternativas } from "@/components/telas/ProvaAlternativas";
import { ProvaPratica } from "@/components/telas/ProvaPratica";

type Props = PageProps<"/pratica/provas/[id]">;

export function generateStaticParams() {
  return provas().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: buscarProva(id)?.titulo ?? "Prova" };
}

export default async function PaginaProva({ params }: Props) {
  const { id } = await params;
  const p = buscarProva(id);
  if (!p) notFound();
  return p.tipo === "alternativas" ? <ProvaAlternativas prova={p} /> : <ProvaPratica prova={p} />;
}
