import "server-only";
import { z } from "zod";
import { ErroIA } from "@/lib/ia";
import { usuarioAtual } from "@/lib/auth";

// Toda rota de IA responde no mesmo formato: { ok, texto } ou { ok:false, erro }.
// Exige login (o usuário vem da sessão). Erro esperado (ErroIA) vira mensagem
// limpa; erro inesperado nunca vaza stack trace.
export async function responderIA<T>(
  req: Request,
  esquema: z.ZodType<T>,
  executar: (usuarioId: string, dados: T) => Promise<string>,
): Promise<Response> {
  const u = await usuarioAtual();
  if (!u) return Response.json({ ok: false, erro: "Faça login para usar a IA." }, { status: 401 });

  let corpo: unknown;
  try {
    corpo = await req.json();
  } catch {
    return Response.json({ ok: false, erro: "Requisição inválida." }, { status: 400 });
  }
  const r = esquema.safeParse(corpo);
  if (!r.success) return Response.json({ ok: false, erro: "Dados incompletos para a IA." }, { status: 400 });

  try {
    const texto = await executar(u.id, r.data);
    return Response.json({ ok: true, texto });
  } catch (e) {
    if (e instanceof ErroIA) return Response.json({ ok: false, erro: e.message });
    console.error("rota de IA falhou:", e);
    return Response.json({ ok: false, erro: "Algo deu errado no servidor. Tenta de novo." }, { status: 500 });
  }
}

export const Criterios = z.array(z.string()).min(1).max(20);
export const Ideia = z.array(z.string()).max(10);
