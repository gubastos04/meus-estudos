"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ITENS_NAV, navAtivo } from "@/components/itensNav";
import { ControlesTema } from "@/components/ControlesTema";

// Sidebar — só no desktop (o CSS esconde no mobile, onde a barra inferior assume).
export function Sidebar({ email }: { email: string }) {
  const caminho = usePathname();
  return (
    <aside className="side" aria-label="Principal">
      <Link href="/" className="side-marca">Meus Estudos<span>.</span></Link>
      <div className="side-secao">Estudo</div>
      <nav className="side-nav">
        {ITENS_NAV.map(({ href, rotulo, Icone }) => {
          const on = navAtivo(href, caminho);
          return (
            <Link key={href} href={href} className={`side-bt ${on ? "on" : ""}`} aria-current={on ? "page" : undefined}>
              <Icone size={18} strokeWidth={2} />
              {rotulo}
            </Link>
          );
        })}
      </nav>
      <div className="side-rodape">
        <div className="side-conta" title={email}>{email}</div>
        <ControlesTema />
      </div>
    </aside>
  );
}
