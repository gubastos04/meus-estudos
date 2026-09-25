import type { Metadata } from "next";
import { certificados, entrevista, foco as buscarFoco, labs, modulos, treinos } from "@/lib/conteudo";
import { requisitarUsuario } from "@/lib/auth";
import { temChaveIA } from "@/lib/ia";
import { Voce, type Aba } from "@/components/telas/Voce";

export const metadata: Metadata = { title: "Você" };

const ABAS: Aba[] = ["progresso", "entrevista", "certificados"];

export default async function PaginaVoce({ searchParams }: PageProps<"/voce">) {
  const { aba } = await searchParams;
  const inicial = ABAS.includes(aba as Aba) ? (aba as Aba) : "progresso";
  const u = await requisitarUsuario();
  const foco = u.foco ?? undefined;
  // só o que o cálculo de "módulos completos" precisa: os ids das aulas de cada módulo
  const mods = modulos(foco).map((m) => ({ id: m.id, aulas: m.aulas.map((a) => a.id) }));
  return (
    <Voce abaInicial={inicial} modulos={mods} totalTreinos={treinos(foco).length}
      perguntas={entrevista(foco)} certificados={certificados(foco)} labs={labs(foco)}
      email={u.email} temChave={await temChaveIA(u.id)}
      focoNome={buscarFoco(u.foco ?? "")?.nome ?? "programação"} focoId={foco} />
  );
}
