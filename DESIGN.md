# Sistema de design — "Estúdio"

A cara do app (reforma de 21/09/2026, substitui o antigo "Caderno"). Um SaaS de estudo premium, calmo e legível: base slate fria, acento indigo, hierarquia e navegação previsíveis. Tudo vive em `app/globals.css` e nas fontes de `app/layout.tsx`. Register: **product** (o design serve a tarefa). Princípios e semântica de cor continuam vindo de `PRODUCT.md`.

## Cor (OKLCH)

Estratégia: **Restrained com um momento Committed**. A maior parte é neutro slate frio; o **acento** (`--acento`, indigo/violeta) carrega só ações primárias, item de navegação ativo, e o herói "próxima aula". Tema claro e escuro projetados juntos; contraste verificado em AA (4.5:1) nos dois.

Tokens em `:root` (claro) e `:root[data-tema="escuro"]`:

| Papel | Token | Claro | Escuro |
|---|---|---|---|
| fundo | `--ink` | `oklch(0.977 0.004 255)` | `oklch(0.205 0.021 262)` |
| cartão | `--panel` | `oklch(1 0 0)` | `oklch(0.253 0.024 262)` |
| campo/inset | `--panel2` | `oklch(0.958 0.006 255)` | `oklch(0.303 0.028 262)` |
| borda | `--line` | `oklch(0.912 0.008 255)` | `oklch(0.372 0.030 262)` |
| texto | `--text` | `oklch(0.278 0.028 262)` | `oklch(0.928 0.012 266)` |
| secundário | `--dim` | `oklch(0.515 0.034 258)` | `oklch(0.688 0.024 262)` |
| acento | `--acento` | `oklch(0.540 0.196 274)` | `oklch(0.706 0.162 278)` |

Semântica (papéis fixos): `--acento` ativo/atenção, `--done` concluído, `--alert` alerta real (só isso, nunca falha do usuário). `--acento-fundo` é a tinta do herói e do item ativo; tons de estado nos blocos via `color-mix(in oklch, var(--cor) 8-12%, var(--panel))`. `--amber*` são aliases retroativos de `--acento*` (classes antigas seguem funcionando). O acento pode ser tingido por foco via `data-foco` (seguranca/web/dados/backend), mantendo o mesmo papel.

## Escalas

- **Espaço** `--s-1..8` (4/8/12/16/24/32/48/64px), ritmo 4pt. Varie por hierarquia; não use o mesmo padding em tudo.
- **Raio** `--raio-sm` 8 / `--raio` 12 / `--raio-lg` 16 / `--raio-xl` 22 / `--raio-full`.
- **Elevação** `--sombra-1..3`, sombra fria e sutil. **Borda primeiro**: profundidade vem de borda 1px + fundo; sombra só em sobreposições (cartão de login, futuros dropdowns/sheets), nunca decorativa.

## Tipografia

- **Display — Fraunces** (serif com caráter): wordmark, `.pagina-t`, `.h2`, `.h3`, títulos de cartão, herói, placar, números-herói. É a personalidade que salva a paleta de ser genérica.
- **Texto e UI — Karla** (humanista): prosa, botões, rótulos, campos.
- **Dados — JetBrains Mono**: rótulos de seção em maiúsculo, selos, cronômetro, prazos, tecla (`.kbd`). Números tabulares onde há colunas.
- Escala por `--esc` (0.94 / 1 / 1.14), acessível pelo botão de fonte. Prosa no máx. 66ch.

## Layout e navegação

- **Shell**: sidebar no desktop (`≥900px`, `components/Sidebar.tsx`), barra superior + nav inferior no mobile (`Topo.tsx`, `Nav.tsx`). Ambas geradas de `itensNav.ts` (5 itens). Seção ativa sempre destacada (preenchimento de acento na sidebar). Ícone **sempre com rótulo**.
- Conteúdo em `.wrap` centrado (máx. ~1000px no desktop). Mobile primeiro.
- **Sem tarja lateral.** Hierarquia por escala + tom de fundo + espaço + borda inteira. Blocos importantes = borda 1px (+ raio) e, com estado, fundo levemente tingido.
- **Métricas por hierarquia, não por grade de cards.** Um número que importa em destaque (`.stat-hero`, `.meta`) e o resto em lista compacta (`.stats-lista`, `.stat`). Evite fileiras de cards idênticos.
- Sub-abas (`Abas.tsx`) largura natural à esquerda no desktop, full-width no mobile.

## Componentes (classes em globals.css)

Botões `.bt` (primário, acento cheio) e `.bt-2` (secundário, borda); pílula `.pill` (ativa acento); cartão de lista `.cartao` (borda inteira, `.selo` à direita, estado "ok" verde); herói `.agora` (fundo acento tingido, título serif grande); painel de semana `.meta` (barras `.tick`); número-herói `.stat-hero` + lista `.stat`; aviso `.aviso` / explicação `.porque` / erro `.rev-q` (fundo tingido + borda inteira); bloco de IA `.ia`; campos `.busca` (linha, ≥16px) e `.campo` (área); tecla `.kbd`. Todo interativo tem hover e `:focus-visible` (contorno de acento).

## Movimento

Transições 140–200ms, ease-out, sem bounce. Movimento comunica estado (hover, foco, ativo, expandir), nunca decoração. `prefers-reduced-motion` respeitado (desliga transições).

## Acessibilidade

Contraste AA verificado (claro e escuro, cálculo OKLCH→WCAG). Alvos de toque ≥44px. Inputs ≥16px (evita zoom automático do iOS). Erros com `role="alert"`. Senha com mostrar/ocultar. Cor nunca é o único indicador (ícone/texto acompanham). `themeColor` claro/escuro condizente com a paleta.

## O que mudou do "Caderno"

- Papel/tinta morna (âmbar, hue quente) → slate frio + acento indigo (`--acento`).
- Herói/cabeçalhos com regra dupla de caderno → shell de SaaS com sidebar.
- Coluna única 640px → shell responsivo, sidebar no desktop.
- Lista de estatísticas plana → hierarquia (número-herói + lista), sem grade de cards.
- Novos: escalas de espaço/raio/sombra, tokens `--acento*`, acento por foco.
