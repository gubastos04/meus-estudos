import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { aula as buscarAula, stacks, todasAulas } from "@/lib/conteudo";
import { AulaView } from "@/components/telas/Aula";

type Props = PageProps<"/trilha/[moduloId]/[aulaId]">;

export function generateStaticParams() {
  return todasAulas().map((a) => ({ moduloId: a.moduloId, aulaId: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { aulaId } = await params;
  const a = buscarAula(aulaId);
  return { title: a ? a.titulo : "Aula" };
}

export default async function PaginaAula({ params }: Props) {
  const { moduloId, aulaId } = await params;
  const a = buscarAula(aulaId);
  if (!a || a.moduloId !== moduloId) notFound();
  return <AulaView aula={a} stacks={stacks().map((s) => ({ id: s.id, nome: s.nome }))} />;
}
