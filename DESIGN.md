# Sistema de design — "Técnico calmo"

A cara do app (reforma de 22/09/2026, substitui o "Estúdio" indigo). Um SaaS de estudo de voz técnica e calma: papel claro esverdeado de dia, carvão verde de noite, voz de display em monoespaçada. Assume sem rodeios que o produto é aprender a programar. Tudo vive em `app/globals.css` e nas fontes de `app/layout.tsx`. Register: **product** (o design serve a tarefa). Princípios e semântica de cor continuam vindo de `PRODUCT.md`.

## Cor (OKLCH)

Estratégia: **Restrained com um momento Committed**. A maior parte é papel/tinta esverdeada neutra; o **acento musgo** (`--acento`) carrega só ações primárias, item de navegação ativo, e o herói "próxima aula". Tema claro e escuro projetados juntos; contraste verificado em AA (4.5:1) nos dois (cálculo OKLCH→WCAG).

Tokens em `:root` (claro) e `:root[data-tema="escuro"]`:

| Papel | Token | Claro | Escuro |
|---|---|---|---|
| fundo | `--ink` | `oklch(0.968 0.006 140)` | `oklch(0.210 0.012 160)` |
| cartão | `--panel` | `oklch(0.992 0.004 140)` | `oklch(0.255 0.014 160)` |
| campo/inset | `--panel2` | `oklch(0.945 0.008 145)` | `oklch(0.300 0.016 160)` |
| borda | `--line` | `oklch(0.880 0.012 150)` | `oklch(0.370 0.018 160)` |
| texto | `--text` | `oklch(0.280 0.020 155)` | `oklch(0.920 0.012 150)` |
| secundário | `--dim` | `oklch(0.475 0.020 150)` | `oklch(0.685 0.020 155)` |
| acento | `--acento` | `oklch(0.475 0.090 165)` | `oklch(0.720 0.110 165)` |

Semântica (papéis fixos): `--acento` (musgo) ativo/atenção, `--done` (verde-grama, hue ~148, **distinto do acento** pra não confundir feito com ativo) concluído, `--alert` alerta real (só isso, nunca falha do usuário). `--acento-fundo` é a tinta do herói e do item ativo; tons de estado nos blocos via `color-mix(in oklch, var(--cor) 8-12%, var(--panel))`. `--amber*` são aliases retroativos de `--acento*` (classes antigas seguem funcionando).

## Escalas

- **Espaço** `--s-1..8` (4/8/12/16/24/32/48/64px), ritmo 4pt. Varie por hierarquia.
- **Raio** — **cantos retos, engenhados**: `--raio-sm` 3 / `--raio` 5 / `--raio-lg` 8 / `--raio-xl` 12 / `--raio-full`.
- **Elevação** `--sombra-1..3`, sutil. **Borda primeiro**: profundidade vem de borda 1px + fundo; sombra só em sobreposições (cartão de login), nunca decorativa.

## Tipografia

- **Display — IBM Plex Mono**: wordmark, `.pagina-t`, `.h2`, `.h3`, títulos de cartão, herói, números-herói, placar, rótulos de seção, cronômetro, prazos, selos, tecla (`.kbd`). A voz técnica que dá personalidade (e diferencia da paleta, que sozinha seria de categoria).
- **Texto e UI — IBM Plex Sans**: prosa, botões, rótulos, campos.
- **Assinatura mono**: rótulos de seção prefixados com `//` (`// SUA SEMANA`, `// ESTUDO`) via `::before` em `.side-secao`/`.dash-secao`. O pitch das aulas (`.resumo`) fica em mono-itálico, como um comentário de código.
- Escala por `--esc` (0.94 / 1 / 1.14), acessível pelo botão de fonte. Prosa no máx. 66ch. `--f-hero` é 30px (mono é mais largo que serifa).

## Layout e navegação

- **Shell**: sidebar no desktop (`≥900px`, `components/Sidebar.tsx`), barra superior + nav inferior no mobile (`Topo.tsx`, `Nav.tsx`). Ambas geradas de `itensNav.ts` (5 itens). Seção ativa sempre destacada (preenchimento de acento na sidebar). Ícone **sempre com rótulo**.
- Conteúdo em `.wrap` centrado (máx. ~1000px no desktop). Mobile primeiro. A home (dashboard) cabe sem scroll em telas comuns (padding e ritmo enxutos); telas de lista (Trilha, Prática, Você) rolam por terem conteúdo longo, e tudo bem.
- Login (`/entrar`, `/criar-conta`): dois painéis no desktop (marca com gradiente musgo à esquerda + cartão à direita), coluna única no mobile. Painéis ocupam `100dvh` (gradiente cheio; cartão centralizado).
- **Sem tarja lateral.** Hierarquia por escala + tom de fundo + espaço + borda inteira.
- **Métricas por hierarquia, não por grade de cards.** Um número que importa em destaque (`.stat-hero`, `.meta`) e o resto em lista compacta (`.stats-lista`, `.stat`).
- Sub-abas (`Abas.tsx`) largura natural à esquerda no desktop, full-width no mobile.

## Componentes (classes em globals.css)

Botões `.bt` (primário, musgo cheio) e `.bt-2` (secundário, borda); pílula `.pill` (ativa musgo); cartão de lista `.cartao` (borda inteira, `.selo` à direita, estado "ok" verde); herói `.agora` (fundo musgo tingido, título mono); painel de semana `.meta` (barras `.tick`); número-herói `.stat-hero` + lista `.stat`; aviso `.aviso` / explicação `.porque` / erro `.rev-q` (fundo tingido + borda inteira); bloco de IA `.ia`; campos `.busca` (linha, ≥16px) e `.campo` (área); tecla `.kbd`. Todo interativo tem hover e `:focus-visible` (contorno de acento).

## Movimento

Transições 140–200ms, ease-out, sem bounce. Movimento comunica estado, nunca decoração. `prefers-reduced-motion` respeitado.

## Acessibilidade

Contraste AA verificado (claro e escuro). Alvos de toque ≥44px. Inputs ≥16px (evita zoom automático do iOS). Erros com `role="alert"`. Senha com mostrar/ocultar. Atalho Ctrl/⌘+Enter conclui a aula (com dica visível). Cor nunca é o único indicador. `themeColor` claro/escuro condizente.

## O que mudou do "Estúdio" (indigo)

- Base slate fria + acento indigo → papel/carvão esverdeado + acento musgo.
- Fraunces (serif) + Karla + JetBrains → IBM Plex Mono (display) + IBM Plex Sans.
- Cantos macios (raio 12) → cantos retos (raio 5).
- Rótulos de seção ganham prefixo `//`; herói e números em mono.
