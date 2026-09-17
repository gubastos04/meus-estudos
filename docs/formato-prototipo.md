# Formato do progresso salvo pelo protótipo

Referência para o importador da Fase 2 (seção 5.3 da especificação). O protótipo (`centro.jsx`, artifact do claude.ai) guardava tudo numa única chave do `window.storage`:

- chave: `centro:estado:v1`
- valor: JSON com o objeto abaixo

```ts
{
  feitas:   { [aulaId: string]: string },          // "m1a1": "2026-09-11" (data UTC, via toISOString)
  minutos:  number,                                // total acumulado; redundante com sessoes
  sessoes:  { d: string; min: number;              // d = dia UTC "AAAA-MM-DD"
              aula?: string; demanda?: string;     // exatamente uma destas chaves indica a origem
              treino?: string; prova?: string }[],
  notas:    { id: number; t: string; d: string;    // id = Date.now(); t = texto
              aula: string | null; aulaT: string | null }[],
  erros:    { id: number; d: string; msg: string; onde: string; causa: string; sol: string }[],
  demandas: { [demandaId: string]: { d: string; min: number } },
  treinos:  { [treinoId: string]:  { d: string; sozinho: boolean } },
  projetos: { [projetoId: string]: { d: string } },
  provas:   { [provaId: string]:   { melhor: number; total: number; tentativas: number; d: string } },
  geradas:  DemandaAntiga[],                       // demandas geradas por IA, com id "g" + timestamp
  meta:     number,                                // 2 a 5
  energia:  "baixa" | "media" | "alta",
  tema:     "escuro" | "claro",
  fonte:    0 | 1 | 2
}
```

`DemandaAntiga` tem as chaves do protótipo: `id, nivel, titulo, de, canal, prazo, depois, mensagem, criterios, reviravolta{texto, criterios}, solucao, aprendizado, gerada: true`. O `canal` vem como texto livre ("Slack", "E-mail", "Ticket #4412").

## Mapeamento para o modelo novo

| Protótipo | Novo (`lib/progresso.tsx` / Prisma) |
|---|---|
| `feitas[id] = d` | `AulaFeita { aulaId, em }` |
| `sessoes[].{d, min, aula\|demanda\|treino\|prova}` | `Sessao { dia, minutos, origem, refId }` |
| `notas[].{t, d, aula, aulaT}` | `Nota { texto, em, aulaId, aulaTitulo }` |
| `erros[].{msg, onde, causa, sol}` | `Erro { mensagem, contexto, causa, solucao }` |
| `minutos` | descartar; é a soma de `sessoes` |
| `geradas[].canal "Ticket #4412"` | `canal: "Ticket", numero: "#4412"` |

Ids de aula, demanda, treino, projeto e prova são os mesmos nos dois lados (`m1a1`, `d1`, `t1`, `p1`, `pa1`, `pp1`).

As datas do protótipo são UTC. O app novo usa dia local (`lib/datas.ts`). Na importação, mantenha a string como está: a diferença de um dia em registros antigos não muda nenhuma decisão do app.
