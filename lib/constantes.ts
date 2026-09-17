export type Energia = "baixa" | "media" | "alta";
export type Tema = "escuro" | "claro";
/** Índice na ESCALA de fonte. */
export type Fonte = 0 | 1 | 2;

/** Minutos do bloco de estudo, por nível de energia declarado. */
export const BLOCO: Record<Energia, number> = { baixa: 10, media: 25, alta: 50 };

export const ROTULO_ENERGIA: Record<Energia, string> = {
  baixa: "Sem energia",
  media: "Normal",
  alta: "Focado",
};

/** Multiplicador --esc do design system. */
export const ESCALA: Record<Fonte, number> = { 0: 0.94, 1: 1, 2: 1.14 };

export const META_PADRAO = 3;
export const METAS = [2, 3, 4, 5] as const;
