"use client";

import Link from "next/link";
import { ControlesTema } from "@/components/ControlesTema";

// Barra superior — só no mobile (a sidebar traz marca e controles no desktop).
export function Topo() {
  return (
    <header className="topo">
      <Link href="/" className="marca">Meus Estudos<span>.</span></Link>
      <ControlesTema />
    </header>
  );
}
