import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { treino as buscarTreino, treinos } from "@/lib/conteudo";
import { TreinoView } from "@/components/telas/Treino";

type Props = PageProps<"/pratica/treino/[id]">;

export function generateStaticParams() {
  return treinos().map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: buscarTreino(id)?.titulo ?? "Treino" };
}

export default async function PaginaTreino({ params }: Props) {
  const { id } = await params;
  const t = buscarTreino(id);
  if (!t) notFound();
  return <TreinoView treino={t} />;
}
