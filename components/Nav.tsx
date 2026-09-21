"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ITENS_NAV, navAtivo } from "@/components/itensNav";

// Barra inferior — só no mobile (a sidebar assume no desktop).
export function Nav() {
  const caminho = usePathname();
  return (
    <nav className="nav" aria-label="Principal">
      {ITENS_NAV.map(({ href, rotulo, Icone }) => {
        const on = navAtivo(href, caminho);
        return (
          <Link key={href} href={href} className={`nav-bt ${on ? "on" : ""}`} aria-current={on ? "page" : undefined}>
            <Icone size={19} strokeWidth={2} />
            {rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
