import type { Metadata } from "next";
import { foco as buscarFoco, modulos, projetos, temConteudo } from "@/lib/conteudo";
import { requisitarUsuario } from "@/lib/auth";
import { Trilha } from "@/components/telas/Trilha";

export const metadata: Metadata = { title: "Trilha" };

export default async function PaginaTrilha() {
  const u = await requisitarUsuario();
  const foco = u.foco ?? undefined;
  const mods = modulos(foco).map((m) => ({
    id: m.id, ordem: m.ordem, nome: m.nome, faculdade: m.faculdade, foco: m.foco, descricao: m.descricao,
    aulas: m.aulas.map((a) => ({ id: a.id, titulo: a.titulo, minutos: a.minutos, temConteudo: temConteudo(a) })),
  }));
  const projs = projetos(foco).map((p) => ({ id: p.id, titulo: p.titulo, nivel: p.nivel, tempo: p.tempo, modulo: p.modulo }));
  const focoNome = buscarFoco(u.foco ?? "")?.nome ?? "programação";
  return <Trilha modulos={mods} projetos={projs} focoNome={focoNome} />;
}
