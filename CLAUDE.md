@AGENTS.md

# Meus Estudos

App de estudo de uma pessoa só. A especificação completa está em `docs/especificacao.md` e manda em qualquer decisão. Os princípios da seção 2 não são negociáveis: uma decisão por vez, meta semanal (nunca sequência diária), bloco por energia, curto por padrão, escopo explícito, honestidade no progresso, IA só por botão.

## Convenções

- Código, nomes de arquivo, variáveis e texto de interface em português do Brasil. Sem emoji na interface, sem "Parabéns!", sem mensagem motivacional.
- `content/*.json` só entra pelas funções de `lib/conteudo.ts`. Nunca importe JSON num componente.
- Progresso do usuário: só pelo hook `useProgresso()` de `lib/progresso.tsx`. Telas não guardam progresso em estado local. Toda ação nova = um `case` no reducer de `lib/progresso.tsx` + uma server action em `lib/acoes.ts` (valida entrada com Zod) + leitura em `lib/progresso-servidor.ts`.
- O `dia` de qualquer registro vem do cliente (`hoje()` de `lib/datas.ts`), nunca do servidor: o servidor pode estar em UTC.
- Mudou `prisma/schema.prisma`? Rode `npx prisma migrate dev --name <o-que-mudou>`. Usuário é único e fixo (`USUARIO_ID = "eu"`) até a fase 6.
- Páginas em `app/` são server components finas: carregam conteúdo e passam para uma tela em `components/telas/` (client). Passe só os campos que a tela usa.
- Estilo: classes de componente em `app/globals.css` (`.bt`, `.secao-t`, `.cartao`...) + utilitários Tailwind para ajuste fino. Cores só pelos tokens (`--amber`, `--done`, `--alert`...). Âmbar = ativo/atenção, verde = concluído, vermelho = só alerta real.
- Datas do usuário sempre via `lib/datas.ts` (fuso local). Nunca `toISOString().slice(0,10)`.
- Navegação inferior tem 5 itens. Não adicione um sexto; coisa nova vira sub-aba.

## IA (fase 5)

Toda chamada de IA passa por `app/api/ia/*` -> `lib/ia.ts`. A chave `ANTHROPIC_API_KEY` vive só no servidor. IA é botão, nunca automático (princípio 2.7): nenhuma chamada dispara sozinha. Modelo padrão `claude-sonnet-5` (env `IA_MODELO`); limite diário por env `IA_LIMITE_DIARIO`. Sem chave, `temChaveIA()` é falso e os componentes de `components/IA.tsx` mostram aviso em vez de chamar. Erro de IA nunca vaza stack trace: `ErroIA` carrega mensagem pronta; o resto vira mensagem genérica.

## Verificar

```bash
npm run lint && npm run build
```

O build valida todo o `/content` com Zod. Conteúdo malformado tem que quebrar o build.

## Fases

Siga a ordem da seção 10 da especificação. Não avance com fase anterior pela metade. O README mostra em que fase estamos.
