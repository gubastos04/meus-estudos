# Meus Estudos

App de estudo: trilha de programação com foco selecionável (segurança, web, dados ou back-end). Uma base comum de lógica e Python, e um foco que define os módulos avançados, os projetos e a voz da IA. Feito para quem tem pouca atenção e pouca constância.

A regra de tudo está em [docs/especificacao.md](docs/especificacao.md). Leia a seção 2 (princípios) antes de mexer em qualquer tela. O contexto de produto está em [PRODUCT.md](PRODUCT.md) e o sistema visual em [DESIGN.md](DESIGN.md).

## Rodar

```bash
npm install
cp .env.example .env   # e edite: gere um APP_SECRET forte
npx prisma migrate dev
npm run dev
```

Precisa de `DATABASE_URL` (SQLite local já vem no exemplo) e `APP_SECRET` no `.env`. O banco local é SQLite em `prisma/dev.db`; não vai para o git. Para publicar (Postgres + Vercel), veja [DEPLOY.md](DEPLOY.md).

Abre em http://localhost:3000. O celular é o dispositivo principal: teste em tela estreita.

## Estado da construção

| Fase | O quê | Estado |
|---|---|---|
| 1 | Esqueleto, design system, conteúdo validado, telas Agora, Trilha, Aula, Projeto | **pronta** |
| 2 | Persistência com Prisma, importador do JSON do protótipo (`/importar`) | **pronta** — usuário único até a fase 6 |
| 3 | Prática: demandas com reviravolta, treino, provas, revisar | **pronta** — corretor de IA e gerador de demandas ficam para a fase 5 |
| 4 | Caderno (notas, erros, glossário) e Você (progresso, entrevista, certificados) | **pronta** |
| 5 | IA: corretor, explicar de outro jeito, pergunta livre, gerar demanda | **pronta** — desligada até configurar a chave |
| 6 | Multiusuário (login e-mail+senha), chave de IA por usuário, pronto pra deploy | **pronta** — veja DEPLOY.md |

## Estrutura

```
app/            rotas (App Router)
components/     componentes; components/telas/ são as telas inteiras (client)
content/        conteúdo em JSON: trilha, aulas por módulo, demandas, treinos...
lib/conteudo.ts única porta de entrada para /content, valida com Zod no build
lib/modelo.ts   formato do progresso (puro) e derivados: dias ativos, próxima aula
lib/progresso.tsx  provider cliente: estado do usuário e as ações que as telas usam
lib/acoes.ts    server actions que gravam no banco
lib/progresso-servidor.ts  monta o progresso a partir do Prisma (uma vez por requisição)
lib/prototipo.ts  lê o JSON do protótipo antigo
lib/sorteio.ts  semente e embaralhamento determinístico (render precisa ser puro)
lib/ia.ts       cliente da Anthropic e os quatro prompts (server-only)
lib/ia-rota.ts  helper compartilhado das rotas de IA
app/api/ia/     route handlers: corrigir, explicar, perguntar, demanda
app/(app)/      telas que exigem login; app/(auth)/ entrar e criar-conta
lib/auth.ts     contas, sessão por cookie (bcrypt), usuarioAtual/requisitarUsuario
lib/cripto.ts   AES-GCM para a chave de IA de cada usuário
proxy.ts        redireciona quem não tem sessão para /entrar
components/IA.tsx  botões de IA no cliente (desligados quando o usuário não tem chave)
prisma/         schema e migrações
docs/           especificação e formato do protótipo
scripts/        extração do conteúdo do protótipo (uso único, mantido por histórico)
```

## Ligar a IA (opcional)

Os quatro recursos de IA (corretor de código, explicar de outro jeito, pergunta livre, gerar demanda) ficam **desligados** até existir uma chave da API. Sem chave, os botões mostram um aviso e nada é cobrado; o resto do app funciona igual.

Para ligar, ponha no `.env`:

```bash
ANTHROPIC_API_KEY="sk-ant-..."   # conta da API (console.anthropic.com), cobrada por token, separada do plano Pro
IA_MODELO="claude-sonnet-5"       # opcional; padrão claude-sonnet-5
IA_LIMITE_DIARIO="40"             # opcional; teto de chamadas por dia, controle de custo
```

A chave fica só no servidor (route handlers em `app/api/ia/`), nunca chega ao navegador. Reinicie o `npm run dev` depois de mudar o `.env`.

## Adicionar conteúdo

Um módulo novo = editar `content/aulas/mN.json` seguindo o formato dos módulos 1 e 2. Aula sem `ideia` aparece com cadeado na trilha e é pulada pela tela Agora. Se o JSON estiver errado, `npm run build` quebra e aponta o campo.
