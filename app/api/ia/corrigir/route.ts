import { z } from "zod";
import { corrigir } from "@/lib/ia";
import { Criterios, responderIA } from "@/lib/ia-rota";

const Entrada = z.object({
  titulo: z.string().min(1).max(300),
  enunciado: z.string().min(1).max(4000),
  criterios: Criterios,
  solucao: z.string().max(8000).optional(),
  codigo: z.string().min(1).max(20000),
});

export function POST(req: Request) {
  return responderIA(req, Entrada, (uid, dados) => corrigir(uid, dados));
}
