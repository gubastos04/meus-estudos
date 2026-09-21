import { microMissoes, modulos, resumoAula, todasAulas } from "@/lib/conteudo";
import { Agora } from "@/components/telas/Agora";

export default function PaginaAgora() {
  const aulas = todasAulas().map(resumoAula);
  // primeiro módulo com aula ainda sem conteúdo: é o "próximo a escrever"
  const proximoModulo = modulos().find((m) => m.aulas.some((a) => !a.ideia))?.nome ?? null;
  return <Agora aulas={aulas} micro={microMissoes()} proximoModulo={proximoModulo} />;
}
