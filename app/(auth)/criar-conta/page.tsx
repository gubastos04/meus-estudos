import type { Metadata } from "next";
import { FormAuth } from "@/components/FormAuth";

export const metadata: Metadata = { title: "Criar conta" };

export default function PaginaCriarConta() {
  return <FormAuth modo="criar" exigeConvite={Boolean(process.env.CODIGO_CONVITE)} />;
}
