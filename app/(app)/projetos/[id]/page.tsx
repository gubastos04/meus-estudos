import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projeto as buscarProjeto, projetos } from "@/lib/conteudo";
import { ProjetoView } from "@/components/telas/Projeto";

type Props = PageProps<"/projetos/[id]">;

export function generateStaticParams() {
  return projetos().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: buscarProjeto(id)?.titulo ?? "Projeto" };
}

export default async function PaginaProjeto({ params }: Props) {
  const { id } = await params;
  const p = buscarProjeto(id);
  if (!p) notFound();
  return <ProjetoView projeto={p} />;
}
