import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NaoEncontrado() {
  return (
    <div className="wrap" style={{ paddingTop: 48 }}>
      <h2 className="h2">Isso não existe</h2>
      <p className="sub">O endereço não bate com nenhuma aula, projeto ou tela.</p>
      <Link href="/" className="bt-2"><ArrowLeft size={16} /> Voltar pro início</Link>
    </div>
  );
}
