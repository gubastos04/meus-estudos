"use client";

// Sub-abas dentro de uma tela. Controladas pelo pai.
export function Abas<T extends string>({ itens, ativa, aoMudar }: {
  itens: readonly { id: T; rotulo: string }[];
  ativa: T;
  aoMudar: (id: T) => void;
}) {
  return (
    <div className="abas" role="tablist">
      {itens.map((i) => (
        <button key={i.id} type="button" role="tab" aria-selected={ativa === i.id}
          className={`aba ${ativa === i.id ? "on" : ""}`} onClick={() => aoMudar(i.id)}>
          {i.rotulo}
        </button>
      ))}
    </div>
  );
}
