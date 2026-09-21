import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { demanda as buscarDemanda } from "@/lib/conteudo";
import { demandaGerada } from "@/lib/progresso-servidor";
import { requisitarUsuario } from "@/lib/auth";
import { DemandaView } from "@/components/telas/Demanda";

type Props = PageProps<"/pratica/demandas/[id]">;

// Demandas vêm do conteúdo ou, se geradas por IA, do banco do próprio usuário.
async function buscar(id: string) {
  const doConteudo = buscarDemanda(id);
  if (doConteudo) return doConteudo;
  const u = await requisitarUsuario();
  return demandaGerada(u.id, id);
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
