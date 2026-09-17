// Datas no fuso local, sempre como "AAAA-MM-DD".
// toISOString() usa UTC: às 22h no Brasil já seria "amanhã", e quem estuda
// depois do plantão noturno teria o dia contado errado.

const dois = (n: number) => String(n).padStart(2, "0");

export function diaLocal(d: Date = new Date()): string {
  return `${d.getFullYear()}-${dois(d.getMonth() + 1)}-${dois(d.getDate())}`;
}

export const hoje = () => diaLocal();

/** Os últimos `n` dias, incluindo hoje, como conjunto de "AAAA-MM-DD". */
export function ultimosDias(n: number, ref: Date = new Date()): Set<string> {
  const dias = new Set<string>();
  for (let i = 0; i < n; i++) {
    const d = new Date(ref);
    d.setDate(ref.getDate() - i);
    dias.add(diaLocal(d));
  }
  return dias;
}

export const segundosParaMinutos = (segundos: number) => Math.max(1, Math.round(segundos / 60));

export function formataRelogio(segundos: number): string {
  return `${dois(Math.floor(segundos / 60))}:${dois(segundos % 60)}`;
}
