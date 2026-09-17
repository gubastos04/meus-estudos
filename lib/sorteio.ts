// Sorteio fora dos componentes: render precisa ser puro, e o servidor
// é o lugar natural de gerar uma semente nova por requisição.

export const novaSemente = () => Math.floor(Math.random() * 2 ** 31);

/** Gerador determinístico (mulberry32). Mesma semente, mesma sequência. */
export function sorteador(semente: number) {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates com semente. Devolve uma cópia; não mexe na lista original. */
export function embaralhar<T>(lista: T[], semente: number): T[] {
  const sortear = sorteador(semente);
  const l = lista.slice();
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(sortear() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
}
