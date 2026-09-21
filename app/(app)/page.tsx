import { microMissoes, resumoAula, todasAulas } from "@/lib/conteudo";
import { requisitarUsuario } from "@/lib/auth";
import { Agora } from "@/components/telas/Agora";

export default async function PaginaAgora() {
  const u = await requisitarUsuario();
  const aulas = todasAulas(u.foco ?? undefined).map(resumoAula);
  return <Agora aulas={aulas} micro={microMissoes()} />;
}
