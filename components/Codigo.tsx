/** Bloco de código. Rola na horizontal dentro de si, nunca a página. */
export function Codigo({ children }: { children: string }) {
  return <pre className="codigo">{children}</pre>;
}
