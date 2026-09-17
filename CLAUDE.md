@AGENTS.md

# Meus Estudos

App de estudo de uma pessoa só. A especificação completa está em `docs/especificacao.md` e manda em qualquer decisão. Os princípios da seção 2 não são negociáveis: uma decisão por vez, meta semanal (nunca sequência diária), bloco por energia, curto por padrão, escopo explícito, honestidade no progresso, IA só por botão.

## Convenções

- Código, nomes de arquivo, variáveis e texto de interface em português do Brasil. Sem emoji na interface, sem "Parabéns!", sem mensagem motivacional.
- `content/*.json` só entra pelas funções de `lib/conteudo.ts`. Nunca importe JSON num componente.
- Progresso do usuário: só pelo hook `useProgresso()` de `lib/progresso.tsx`. Telas não guardam progresso em estado local.
- Páginas em `app/` são server components finas: carregam conteúdo e passam para uma tela em `components/telas/` (client). Passe só os campos que a tela usa.
- Estilo: classes de componente em `app/globals.css` (`.bt`, `.secao-t`, `.cartao`...) + utilitários Tailwind para ajuste fino. Cores só pelos tokens (`--amber`, `--done`, `--alert`...). Âmbar = ativo/atenção, verde = concluído, vermelho = só alerta real.
- Datas do usuário sempre via `lib/datas.ts` (fuso local). Nunca `toISOString().slice(0,10)`.
- Navegação inferior tem 5 itens. Não adicione um sexto; coisa nova vira sub-aba.

## Verificar

```bash
npm run lint && npm run build
```

O build valida todo o `/content` com Zod. Conteúdo malformado tem que quebrar o build.

## Fases

Siga a ordem da seção 10 da especificação. Não avance com fase anterior pela metade. O README mostra em que fase estamos.
