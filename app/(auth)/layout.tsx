import { redirect } from "next/navigation";
import { Layers, Timer, CalendarCheck } from "lucide-react";
import { usuarioAtual } from "@/lib/auth";

// Quem já está logado não precisa de login: manda pra Agora.
export default async function LayoutAuth({ children }: LayoutProps<"/">) {
  if (await usuarioAtual()) redirect("/");
  return (
    <main className="auth">
      <aside className="auth-brand">
        <div className="auth-brand-marca">Meus Estudos.</div>
        <div>
          <h1 className="auth-brand-tit">Programação, do zero, no seu ritmo.</h1>
          <p className="auth-brand-sub">
            Uma base comum e um foco que você escolhe. Blocos curtos, progresso honesto,
            sem punição por faltar um dia.
          </p>
        </div>
        <ul className="auth-pontos">
          <li className="auth-ponto"><Layers size={18} /> Base comum + foco: segurança, web, dados ou back-end.</li>
          <li className="auth-ponto"><Timer size={18} /> Blocos de 10, 25 ou 50 min, conforme sua energia.</li>
          <li className="auth-ponto"><CalendarCheck size={18} /> Meta por dias ativos na semana. Faltar um dia não zera nada.</li>
        </ul>
      </aside>
      <section className="auth-form-wrap">{children}</section>
    </main>
  );
}
