import { z } from "zod";
import { explicar } from "@/lib/ia";
import { Ideia, responderIA } from "@/lib/ia-rota";

const Entrada = z.object({
  titulo: z.string().min(1).max(300),
  modulo: z.string().min(1).max(300),
  resumo: z.string().max(2000).optional(),
  ideia: Ideia,
});

export function POST(req: Request) {
  return responderIA(req, Entrada, explicar);
}
