import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { focos } from "@/lib/conteudo";
import { EscolherFoco } from "@/components/EscolherFoco";

export const metadata: Metadata = { title: "Escolher foco" };

export default async function PaginaFoco() {
  const u = await usuarioAtual();
  if (!u) redirect("/entrar");
  return <EscolherFoco focos={focos()} atual={u.foco} />;
}
