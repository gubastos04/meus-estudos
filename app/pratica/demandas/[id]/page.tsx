import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demanda as buscarDemanda } from "@/lib/conteudo";
import { demandaGerada } from "@/lib/progresso-servidor";
import { DemandaView } from "@/components/telas/Demanda";

type Props = PageProps<"/pratica/demandas/[id]">;

// Demandas vêm do conteúdo ou, se geradas por IA, do banco.
async function buscar(id: string) {
  return buscarDemanda(id) ?? (await demandaGerada(id));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: (await buscar(id))?.titulo ?? "Demanda" };
}

export default async function PaginaDemanda({ params }: Props) {
  const { id } = await params;
  const d = await buscar(id);
  if (!d) notFound();
  return <DemandaView demanda={d} />;
}
