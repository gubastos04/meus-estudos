"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, BookOpen, Play, Plus, Zap } from "lucide-react";

// Cinco itens, sempre visíveis. Não adicione um sexto: vira sub-aba.
const ITENS = [
  { href: "/", rotulo: "Agora", Icone: Play },
  { href: "/trilha", rotulo: "Trilha", Icone: BookOpen },
  { href: "/pratica", rotulo: "Prática", Icone: Zap },
  { href: "/caderno", rotulo: "Caderno", Icone: Plus },
  { href: "/voce", rotulo: "Você", Icone: BarChart2 },
] as const;

export function Nav() {
  const caminho = usePathname();
  const ativo = (href: string) =>
    href === "/" ? caminho === "/" : caminho === href || caminho.startsWith(href + "/") || (href === "/trilha" && caminho.startsWith("/projetos"));

  return (
    <nav className="nav" aria-label="Principal">
      {ITENS.map(({ href, rotulo, Icone }) => (
        <Link key={href} href={href} className={`nav-bt ${ativo(href) ? "on" : ""}`} aria-current={ativo(href) ? "page" : undefined}>
          <Icone size={19} strokeWidth={2} />
          {rotulo}
        </Link>
      ))}
    </nav>
  );
}
