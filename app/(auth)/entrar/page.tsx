import type { Metadata } from "next";
import { FormAuth } from "@/components/FormAuth";

export const metadata: Metadata = { title: "Entrar" };

export default function PaginaEntrar() {
  return <FormAuth modo="entrar" exigeConvite={Boolean(process.env.CODIGO_CONVITE)} />;
}
