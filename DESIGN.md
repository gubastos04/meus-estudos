# Sistema de design — "Caderno"

A cara do app (17/09/2026). Substitui a execução visual da seção 8 de `docs/especificacao.md`; os princípios e a semântica de cor de lá continuam valendo. Tudo vive em `app/globals.css` e nas fontes de `app/layout.tsx`.

## Ideia

Um caderno de estudo bem-feito, não um dashboard nem um terminal. Papel morno de dia, tinta morna de madrugada. Hierarquia por escala, tom e espaço; regras finas como pauta de caderno. Personalidade tipográfica forte no display, dados em mono como num livro-caixa.

## Cor (OKLCH, neutros puxados para o quente)

Escuro é o padrão (uso às 3h, quarto escuro, pouca energia). Claro é o modo dia. Tokens em `:root` (claro) e `:root[data-tema="escuro"]`.

| Papel | Token | Claro | Escuro |
|---|---|---|---|
| fundo | `--ink` | `oklch(0.958 0.012 85)` | `oklch(0.178 0.008 74)` |
| bloco | `--panel` | `oklch(0.988 0.008 90)` | `oklch(0.228 0.010 74)` |
| inset/campo | `--panel2` | `oklch(0.928 0.016 82)` | `oklch(0.278 0.012 74)` |
| regra | `--line` | `oklch(0.865 0.020 82)` | `oklch(0.345 0.014 74)` |
| texto | `--text` | `oklch(0.255 0.020 60)` | `oklch(0.920 0.014 86)` |
| secundário | `--dim` | `oklch(0.505 0.022 62)` | `oklch(0.700 0.020 80)` |

Semântica (papéis fixos, ver PRODUCT.md): `--amber` ativo/atenção, `--done` concluído, `--alert` alerta real. Cada um tem versão legível no claro (mais escura) e no escuro (mais clara). `--amber-fundo` é o tom do herói "Agora". Tons de estado nos blocos via `color-mix(in oklch, var(--cor) 8-12%, var(--panel))`.

Estratégia de cor: **Restrained com um momento Committed** — a maior parte é neutro morno + um acento âmbar; o bloco "Agora" e a pílula de energia ativa assumem âmbar cheio de propósito (a única concentração forte de cor).

## Tipografia

- **Display — Fraunces** (serif com caráter): wordmark, `.h2`, `.h3`, títulos de cartão, o resumo/pitch (em itálico), o placar de prova. É a voz de caderno.
- **Texto e UI — Karla** (humanista): prosa, botões, rótulos, campos. Uma família só para tudo que não é display nem dado.
- **Dados — JetBrains Mono**: números, código, rótulos de seção em maiúsculo, selos, cronômetro, prazos. A voz de livro-caixa.
- Escala controlada por `--esc` (0.94 / 1 / 1.14), acessível pelo botão de fonte. Prosa no máx. 66ch.

## Regras de layout

- **Sem tarja lateral.** Hierarquia por escala + tom de fundo + espaço + regra fina inteira. Blocos importantes = borda inteira 1px (+ raio 10-14px) e, quando precisam de estado, fundo levemente tingido. É a diferença central em relação ao visual antigo.
- Rótulos de seção em mono maiúsculo com um tick âmbar curto (`.secao-t`).
- Regras duplas (`3px double`) no topo e no rodapé como num caderno.
- Mobile primeiro, largura máx. 640px. Alvos de toque ≥ 44-48px.
- `prefers-reduced-motion` respeitado; transições 120-200ms, ease-out, sem bounce.

## Componentes (classes em globals.css)

Cartão de lista `.cartao` (borda inteira, selo à direita, estado "ok" com borda/fundo verde), herói `.agora` (fundo âmbar), pílula `.pill` (ativa âmbar cheia), aviso `.aviso` / explicação `.porque` / erro `.rev-q` (fundo tingido + borda inteira), mensagem de demanda `.msg` (balão), bloco de IA `.ia` (rótulo em mono). Todo interativo tem hover e foco visível.

## O que mudou do visual antigo

- Azul-tinta frio de SaaS → papel/tinta morna.
- Space Grotesk → Fraunces (display) + Karla (texto/UI).
- Tarjas laterais coloridas em tudo → bordas inteiras, tons e regras.
- Herói com faixa âmbar → bloco âmbar inteiro com título grande em serif.
