import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";

// Quem já está logado não precisa de login: manda pra Agora.
export default async function LayoutAuth({ children }: LayoutProps<"/">) {
  if (await usuarioAtual()) redirect("/");
  return <main className="auth">{children}</main>;
}
