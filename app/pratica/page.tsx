import type { Metadata } from "next";
import { demandas, provas, todasAulas, treinos } from "@/lib/conteudo";
import { Pratica, type Aba } from "@/components/telas/Pratica";
import { novaSemente } from "@/lib/sorteio";

export const metadata: Metadata = { title: "Prática" };

const ABAS: Aba[] = ["demandas", "treino", "provas", "revisar"];

export default async function PaginaPratica({ searchParams }: PageProps<"/pratica">) {
  const { aba } = await searchParams;
  const inicial = ABAS.includes(aba as Aba) ? (aba as Aba) : "demandas";

  const dems = demandas().map((d) => ({ id: d.id, titulo: d.titulo, de: d.de, canal: d.canal, numero: d.numero, prazo: d.prazo, nivel: d.nivel }));
  const treins = treinos().map((t) => ({ id: t.id, titulo: t.titulo, nivel: t.nivel, tempo: t.tempo }));
  const provs = provas().map((p) => ({
    id: p.id, titulo: p.titulo, tipo: p.tipo, escopo: p.escopo, tempo: p.tempo,
    total: p.tipo === "alternativas" ? p.questoes.length : p.tarefas.reduce((s, t) => s + t.criterios.length, 0),
  }));
  // banco de revisão: toda questão de aula, com a aula de origem; o cliente filtra pelas feitas
  const questoes = todasAulas().flatMap((a) => (a.quiz ?? []).map((q) => ({ ...q, aulaId: a.id, aulaTitulo: a.titulo })));
  const titulosAulas = Object.fromEntries(todasAulas().map((a) => [a.id, a.titulo]));


  // semente do embaralhamento de Revisar: nova a cada visita, estável durante a visita
  const semente = novaSemente();

  return <Pratica abaInicial={inicial} demandas={dems} treinos={treins} provas={provs} questoes={questoes} semente={semente} titulosAulas={titulosAulas} />;
}
