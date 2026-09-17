# Meus Estudos

App pessoal de estudo: trilha de programação com foco em segurança da informação, feita para quem tem pouca atenção, pouca constância e trabalha em escala 12x36.

A regra de tudo está em [docs/especificacao.md](docs/especificacao.md). Leia a seção 2 (princípios) antes de mexer em qualquer tela.

## Rodar

```bash
npm install
npm run dev
```

Abre em http://localhost:3000. O celular é o dispositivo principal: teste em tela estreita.

## Estado da construção

| Fase | O quê | Estado |
|---|---|---|
| 1 | Esqueleto, design system, conteúdo validado, telas Agora, Trilha, Aula, Projeto | **pronta** — progresso só em memória (some ao recarregar) |
| 2 | Persistência com Prisma, importador do JSON do protótipo | — |
| 3 | Prática: demandas com reviravolta, treino, provas, revisar | — |
| 4 | Caderno, diário de erro, glossário, entrevista, certificados | — |
| 5 | IA: corretor, explicar de outro jeito, pergunta livre, gerar demanda | — |
| 6 | Login e deploy | — |

## Estrutura

```
app/            rotas (App Router)
components/     componentes; components/telas/ são as telas inteiras (client)
content/        conteúdo em JSON: trilha, aulas por módulo, demandas, treinos...
lib/conteudo.ts única porta de entrada para /content, valida com Zod no build
lib/progresso.tsx  estado do usuário e as ações que as telas usam
docs/           especificação e formato do protótipo
scripts/        extração do conteúdo do protótipo (uso único, mantido por histórico)
```

## Adicionar conteúdo

Um módulo novo = editar `content/aulas/mN.json` seguindo o formato dos módulos 1 e 2. Aula sem `ideia` aparece com cadeado na trilha e é pulada pela tela Agora. Se o JSON estiver errado, `npm run build` quebra e aponta o campo.
