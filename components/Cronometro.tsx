import { Clock } from "lucide-react";
import { formataRelogio } from "@/lib/datas";

/** mm:ss de bloco:00. Passar do bloco fica verde, não vermelho: estourar não é falha. */
export function Cronometro({ segundos, blocoMin }: { segundos: number; blocoMin?: number }) {
  const passou = blocoMin !== undefined && segundos >= blocoMin * 60;
  return (
    <span className={`cron ${passou ? "passou" : ""}`} aria-live="off">
      <Clock size={15} /> {formataRelogio(segundos)}{blocoMin !== undefined && ` de ${blocoMin}:00`}
    </span>
  );
}
