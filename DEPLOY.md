# Publicar (Neon + Vercel)

Fase 6. O código está pronto para produção; falta você criar as contas (não dá pra fazer isso por você) e colar os segredos. Uma vez só; depois é `git push` e a Vercel reconstrói.

O app hoje roda local com SQLite. Produção usa **Postgres no Neon**. A troca é o provider do Prisma + a `DATABASE_URL`.

## 1. Banco no Neon (grátis)

1. Crie conta em https://neon.tech e um projeto (região mais perto de você).
2. Copie a **connection string** (começa com `postgresql://...`, com `?sslmode=require`).

## 2. Trocar o Prisma para Postgres

Em `prisma/schema.prisma`, mude o provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

As migrações em `prisma/migrations/` foram feitas para SQLite. Para o Postgres, gere o schema direto (não há dado de produção a preservar):

```bash
# use a connection string do Neon nesta máquina só para criar as tabelas
DATABASE_URL="postgresql://..." npx prisma db push
```

Isso cria todas as tabelas no Neon. (Local continua com SQLite; só não misture `migrate` e `db push` no mesmo banco.)

## 3. Deploy na Vercel

1. Suba o repositório para o GitHub (`git push`).
2. Em https://vercel.com, **New Project**, importe o repositório.
3. Em **Environment Variables**, adicione:

   | Nome | Valor |
   |---|---|
   | `DATABASE_URL` | a connection string do Neon |
   | `APP_SECRET` | um segredo forte: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
   | `CODIGO_CONVITE` | opcional; se definir, criar conta exige esse código |
   | `IA_MODELO` | opcional; padrão `claude-sonnet-5` |
   | `IA_LIMITE_DIARIO` | opcional; padrão 40 |

   Não existe chave de IA no servidor: cada usuário cadastra a própria em Você.
4. **Deploy**. A Vercel roda `prisma generate` no build (via `postinstall`, ver abaixo) e publica.

## 4. Um detalhe de build

A Vercel faz cache do `node_modules`, o que pode servir um Prisma Client velho. Garanta que o client é gerado no build adicionando ao `package.json`:

```json
"scripts": {
  "postinstall": "prisma generate"
}
```

## Guardar bem o APP_SECRET

`APP_SECRET` criptografa as chaves de IA dos usuários. Se você trocá-lo depois, as chaves guardadas param de decifrar e cada um terá que recadastrar a sua (o app avisa isso, não quebra). Então gere uma vez e não troque à toa.

## Depois no ar

- Primeiro acesso: `/criar-conta`. Se puser `CODIGO_CONVITE`, só quem tem o código entra.
- Mesmo login no celular e no PC = mesmo progresso.
- PWA/ícone na tela inicial: fora de escopo por enquanto (a spec deixou como "se quiser depois").
