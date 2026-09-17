import type { Metadata } from "next";
import { modulos, projetos, temConteudo } from "@/lib/conteudo";
import { Trilha } from "@/components/telas/Trilha";

export const metadata: Metadata = { title: "Trilha" };

export default function PaginaTrilha() {
  const mods = modulos().map((m) => ({
    id: m.id, ordem: m.ordem, nome: m.nome, faculdade: m.faculdade, etiqueta: m.etiqueta, descricao: m.descricao,
    aulas: m.aulas.map((a) => ({ id: a.id, titulo: a.titulo, minutos: a.minutos, temConteudo: temConteudo(a) })),
  }));
  const projs = projetos().map((p) => ({ id: p.id, titulo: p.titulo, nivel: p.nivel, tempo: p.tempo, modulo: p.modulo }));
  return <Trilha modulos={mods} projetos={projs} />;
}
