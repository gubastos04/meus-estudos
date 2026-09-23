@AGENTS.md

# Meus Estudos

App de estudo de uma pessoa só. A especificação completa está em `docs/especificacao.md` e manda em qualquer decisão. Os princípios da seção 2 não são negociáveis: uma decisão por vez, meta semanal (nunca sequência diária), bloco por energia, curto por padrão, escopo explícito, honestidade no progresso, IA só por botão.

## Convenções

- Código, nomes de arquivo, variáveis e texto de interface em português do Brasil. Sem emoji na interface, sem "Parabéns!", sem mensagem motivacional.
- `content/*.json` só entra pelas funções de `lib/conteudo.ts`. Nunca importe JSON num componente.
- Aula nova segue o contrato de `docs/plano-conteudo.md` (resumo de uma frase, ideia em 2 linhas, exemplo com `linguagem` e código que roda, quiz com porquê, desafio com solução). Conteúdo de apoio aceita `foco` em lista (`["web", "backend"]`). Aula escrita nunca muda de id.
- Aula de back-end traz o mesmo conceito nas 3 stacks: `exemplos` e `desafio.solucoes` com uma entrada por stack de `trilha.json` (`fastapi`, `flask`, `express`). Ou `exemplo`, ou `exemplos`; nunca os dois. Faltando uma stack, o build quebra. A stack escolhida é preferência do usuário (`Usuario.stack`), gravada pelo mesmo caminho de tema e fonte.
- Progresso do usuário: só pelo hook `useProgresso()` de `lib/progresso.tsx`. Telas não guardam progresso em estado local. Toda ação nova = um `case` no reducer de `lib/progresso.tsx` + uma server action em `lib/acoes.ts` (valida entrada com Zod) + leitura em `lib/progresso-servidor.ts`.
- O `dia` de qualquer registro vem do cliente (`hoje()` de `lib/datas.ts`), nunca do servidor: o servidor pode estar em UTC.
- Banco: `prisma/schema.prisma` fica em `postgresql` (produção Neon, é o que a Vercel usa). Local roda SQLite: `npm run dev` executa o `predev` (`scripts/dev-local.mjs`), que deriva um schema SQLite do versionado, gera o client e sincroniza `prisma/dev.db` — automático e offline. Não troque o `provider` do schema versionado. Mudou o schema? O `npm run dev` re-sincroniza o dev.db sozinho; em produção, `npx prisma db push` na Neon + redeploy.
- Páginas em `app/` são server components finas: carregam conteúdo e passam para uma tela em `components/telas/` (client). Passe só os campos que a tela usa.
- Estilo: sistema "Estúdio" (premium frio) em `app/globals.css`, classes de componente (`.bt`, `.card`, `.cartao`, `.side-bt`...) + utilitários Tailwind para ajuste fino. Cores só pelos tokens. Acento = `--acento` (indigo; `--amber*` são aliases retroativos), verde = `--done`, vermelho = `--alert` (só alerta real). Superfícies slate frias (`--ink`/`--panel`/`--panel2`/`--line`), escalas `--s-*` (espaço), `--raio*` (raio), `--sombra-*` (elevação, usada com parcimônia — borda primeiro).
- Datas do usuário sempre via `lib/datas.ts` (fuso local). Nunca `toISOString().slice(0,10)`.
- Navegação: shell com sidebar no desktop (`components/Sidebar.tsx`) e barra inferior no mobile (`components/Nav.tsx`), ambas geradas de `components/itensNav.ts` (5 itens — não adicione um sexto; coisa nova vira sub-aba via `components/Abas.tsx`). A home é um dashboard: uma próxima ação em destaque + métricas de progresso (`.dash-cards`/`.card`) abaixo.

## IA (fase 5)

Toda chamada de IA passa por `app/api/ia/*` -> `lib/ia.ts`. A chave `ANTHROPIC_API_KEY` vive só no servidor. IA é botão, nunca automático (princípio 2.7): nenhuma chamada dispara sozinha. Modelo padrão `claude-sonnet-5` (env `IA_MODELO`); limite diário por env `IA_LIMITE_DIARIO`. Sem chave, `temChaveIA()` é falso e os componentes de `components/IA.tsx` mostram aviso em vez de chamar. Erro de IA nunca vaza stack trace: `ErroIA` carrega mensagem pronta; o resto vira mensagem genérica.

## Verificar

```bash
npm run lint && npm run build
```

O build valida todo o `/content` com Zod. Conteúdo malformado tem que quebrar o build.

Mexeu em `/content`? Rode também `npm run conteudo:checar` (estrutura, travessão, citações, placar por foco) e `npm run conteudo:rodar` (executa o código das aulas e a solução de treino, demanda e prova prática; bash e o resto são conferidos à mão). O `npm run build` falha com EPERM se o `npm run dev` estiver rodando: pare o dev antes.

## Fases

Siga a ordem da seção 10 da especificação. Não avance com fase anterior pela metade. O README mostra em que fase estamos.
