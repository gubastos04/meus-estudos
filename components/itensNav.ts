import { BarChart2, BookOpen, Play, Plus, Zap, type LucideIcon } from "lucide-react";

export type ItemNav = { href: string; rotulo: string; Icone: LucideIcon };

// Cinco itens, sempre visíveis (sidebar no desktop, barra inferior no mobile).
// Não adicione um sexto: vira sub-aba.
export const ITENS_NAV: ItemNav[] = [
  { href: "/", rotulo: "Agora", Icone: Play },
  { href: "/trilha", rotulo: "Trilha", Icone: BookOpen },
  { href: "/pratica", rotulo: "Prática", Icone: Zap },
  { href: "/caderno", rotulo: "Caderno", Icone: Plus },
  { href: "/voce", rotulo: "Você", Icone: BarChart2 },
];

// Uma seção está ativa quando a rota bate ou é subrota dela.
// Projetos moram dentro da Trilha.
export function navAtivo(href: string, caminho: string): boolean {
  if (href === "/") return caminho === "/";
  return caminho === href || caminho.startsWith(href + "/") || (href === "/trilha" && caminho.startsWith("/projetos"));
}
