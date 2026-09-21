import { z } from "zod";
import { gerarDemanda, ErroIA } from "@/lib/ia";
import { usuarioAtual } from "@/lib/auth";
import { salvarDemandaGerada } from "@/lib/progresso-servidor";

const Entrada = z.object({ aulasFeitas: z.array(z.string()).max(200) });

// Gera, salva no banco e devolve a demanda inteira (não só texto).
export async function POST(req: Request) {
  const u = await usuarioAtual();
  if (!u) return Response.json({ ok: false, erro: "Faça login para usar a IA." }, { status: 401 });

  let corpo: unknown;
  try { corpo = await req.json(); } catch { return Response.json({ ok: false, erro: "Requisição inválida." }, { status: 400 }); }
  const r = Entrada.safeParse(corpo);
  if (!r.success) return Response.json({ ok: false, erro: "Dados incompletos." }, { status: 400 });

  try {
    const demanda = await gerarDemanda(u.id, r.data.aulasFeitas);
    await salvarDemandaGerada(u.id, demanda);
    return Response.json({ ok: true, demanda });
  } catch (e) {
    if (e instanceof ErroIA) return Response.json({ ok: false, erro: e.message });
    console.error("rota demanda falhou:", e);
    return Response.json({ ok: false, erro: "Algo deu errado no servidor. Tenta de novo." }, { status: 500 });
  }
}
