import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { carregarProgresso } from "@/lib/progresso-servidor";
import { temChaveIA } from "@/lib/ia";
import { ProgressoProvider } from "@/lib/progresso";
import { IAProvider } from "@/components/IA";
import { Topo } from "@/components/Topo";
import { Nav } from "@/components/Nav";

// Tudo aqui dentro exige login. Sem sessão válida, vai para /entrar.
export default async function LayoutApp({ children }: LayoutProps<"/">) {
  const u = await usuarioAtual();
  if (!u) redirect("/entrar");

  const [progresso, iaLigada] = await Promise.all([carregarProgresso(u.id), temChaveIA(u.id)]);

  return (
    <ProgressoProvider inicial={progresso}>
      <IAProvider ligada={iaLigada}>
        <div className="wrap">
          <Topo />
          <main>{children}</main>
        </div>
        <Nav />
      </IAProvider>
    </ProgressoProvider>
  );
}
