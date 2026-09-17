/** Tela de uma fase ainda não construída. Diz o que vem, sem fingir que existe. */
export function EmBreve({ titulo, fase, itens }: { titulo: string; fase: number; itens: string[] }) {
  return (
    <>
      <h2 className="h2">{titulo}</h2>
      <p className="sub">Esta tela chega na fase {fase} da construção.</p>
      <div className="vazio">
        O que vai ter aqui: {itens.join(" · ")}.
      </div>
    </>
  );
}
