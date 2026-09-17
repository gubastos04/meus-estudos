import type { Metadata } from "next";
import { certificados, entrevista, labs, modulos, treinos } from "@/lib/conteudo";
import { Voce, type Aba } from "@/components/telas/Voce";

export const metadata: Metadata = { title: "Você" };

const ABAS: Aba[] = ["progresso", "entrevista", "certificados"];

export default async function PaginaVoce({ searchParams }: PageProps<"/voce">) {
  const { aba } = await searchParams;
  const inicial = ABAS.includes(aba as Aba) ? (aba as Aba) : "progresso";
  // só o que o cálculo de "módulos completos" precisa: os ids das aulas de cada módulo
  const mods = modulos().map((m) => ({ id: m.id, aulas: m.aulas.map((a) => a.id) }));
  return (
    <Voce abaInicial={inicial} modulos={mods} totalTreinos={treinos().length}
      perguntas={entrevista()} certificados={certificados()} labs={labs()} />
  );
}
