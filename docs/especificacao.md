# Meus Estudos — especificação de construção

> **Reforma de 21/09/2026 (posicionamento).** O produto deixou de ser "programação com foco fixo em segurança" e passou a ser "programação com **foco selecionável**": uma base comum (lógica, Python) + um foco escolhido pelo usuário entre segurança, web, dados e back-end (base comum + foco; um por vez, trocável). Segurança é o foco com conteúdo pronto; os outros começam como outline. Também foi **removida** toda referência a "trabalha em escala 12x36 / plantão" — o princípio da meta semanal (não sequência diária) permanece, agora justificado por "ninguém estuda todo dia", não por trabalho em turno. O contexto atual do produto está em `PRODUCT.md`. As seções abaixo são o registro original.

Documento de entrada para a construção. Contém tudo que foi decidido no protótipo: princípios, arquitetura, modelo de dados, telas, prompts de IA, design system e ordem de construção.

O protótipo funcional existia como arquivo React único (`centro.jsx`, ~171 KB). Seu conteúdo já foi extraído para `/content` (ver `scripts/extrair-prototipo.mjs`); o formato do progresso que ele salvava está em `docs/formato-prototipo.md`. Este documento descreve para onde ele vai.

Nome do projeto: **Meus Estudos** (o protótipo se chamava "Centro").

---

## 1. Contexto

O usuário é um adulto formado em Análise e Desenvolvimento de Sistemas que está recomeçando programação do zero, com objetivo de carreira em segurança da informação. Trabalha em escala noturna 12x36, fora da área.

Três restrições moldam todo o produto:

1. **Dificuldade de atenção e tédio rápido.** Blocos longos não são concluídos.
2. **Dificuldade de constância.** Ele começa cronogramas e abandona em semanas.
3. **Rejeição a troca de janela.** Tudo que for possível fica dentro do app.

Preferência declarada: explicação direta, exemplo prático antes da teoria, pouco texto por vez, com possibilidade de aprofundar sob demanda.

---

## 2. Princípios de produto

Estas regras não são negociáveis. Elas são o motivo do produto existir e devem ser defendidas em qualquer decisão de implementação.

### 2.1 Uma decisão por vez
A tela inicial mostra **uma** próxima ação e um botão. Nunca uma grade de opções. Paralisia de escolha é o maior inimigo aqui.

### 2.2 Meta semanal, nunca sequência diária
Escala 12x36 torna sequência diária impossível de manter. A métrica é **dias ativos nos últimos 7 dias**, com meta configurável (padrão 3). Falhar um dia não zera nada. Não existe punição visual, mensagem de culpa ou contador regressivo de sequência perdida.

### 2.3 Bloco dimensionado por energia
Antes de estudar, o usuário declara energia: baixa, média ou alta. Isso define o bloco em 10, 25 ou 50 minutos. O cronômetro é informativo, nunca bloqueante.

### 2.4 Curto por padrão, profundo sob demanda
Toda aula abre com uma frase de resumo e duas linhas de ideia. Detalhe adicional fica em um bloco recolhido. O usuário escolhe o nível a cada aula, não o autor.

### 2.5 Escopo fechado e explícito
Todo projeto declara o que **não** faz, com o mesmo destaque do que faz. Projeto sem limite escrito é projeto abandonado na terceira semana.

### 2.6 Honestidade sobre o próprio progresso
Treinos registram "resolvi sozinho" ou "resolvi com ajuda", separadamente. Provas práticas são autoavaliadas por critérios objetivos, nunca por impressão. O app não infla números.

### 2.7 IA é botão, nunca automático
Nenhuma chamada de IA dispara sozinha. Toda chamada custa dinheiro ou cota, e o usuário precisa saber que a pediu.

---

## 3. Stack

### Decisão tomada

| Camada | Escolha | Motivo |
|---|---|---|
| Framework | Next.js (App Router) + TypeScript | Um repositório, front e back juntos, deploy trivial |
| Estilo | Tailwind CSS com tokens customizados | Rápido, e o design system da seção 8 vira config |
| Banco | SQLite via Prisma em dev, Postgres em produção | Mesma camada de código, troca só a connection string |
| Conteúdo | Arquivos JSON versionados em `/content` | Adicionar módulo = adicionar arquivo. Sem migração, sem CMS |
| IA | Route handler no servidor chamando a API da Anthropic | A chave nunca vai para o navegador |
| Deploy | Vercel + Neon ou Supabase (camada gratuita) | Custo zero no começo |

**Sincronização entre dispositivos: confirmada como necessária** (decisão de 13/09/2026). O usuário estuda no celular e no computador; o progresso precisa acompanhar os dois. Banco é obrigatório e autenticação entra na fase 6.

(Alternativa descartada: Vite + IndexedDB, estático. Perderia sincronização e IA.)

---

## 4. Estrutura de pastas

```
meus-estudos/
├── app/
│   ├── page.tsx                    # Agora
│   ├── trilha/page.tsx
│   ├── trilha/[moduloId]/[aulaId]/page.tsx
│   ├── projetos/[id]/page.tsx
│   ├── pratica/page.tsx            # abas: demandas, treino, provas, revisar
│   ├── pratica/demandas/[id]/page.tsx
│   ├── pratica/treino/[id]/page.tsx
│   ├── pratica/provas/[id]/page.tsx
│   ├── caderno/page.tsx            # abas: notas, erros, glossário
│   ├── voce/page.tsx               # abas: progresso, entrevista, certificados
│   └── api/
│       ├── ia/corrigir/route.ts
│       ├── ia/explicar/route.ts
│       ├── ia/perguntar/route.ts
│       └── ia/demanda/route.ts
├── content/
│   ├── trilha.json                 # módulos, metadados e micro-missões
│   ├── aulas/m1.json ... m12.json  # um arquivo por módulo
│   ├── demandas.json
│   ├── treinos.json
│   ├── projetos.json
│   ├── provas.json
│   ├── glossario.json
│   ├── entrevista.json
│   └── certificados.json           # certificados e labs
├── lib/
│   ├── conteudo.ts                 # carrega e valida /content com Zod
│   ├── progresso.tsx               # leitura e escrita do progresso
│   ├── constantes.ts               # bloco por energia, escala de fonte
│   ├── datas.ts                    # dia local
│   └── ia.ts                       # cliente da Anthropic e prompts
├── components/
│   └── telas/                      # uma tela inteira por arquivo (client)
└── prisma/schema.prisma
```

**Regra:** nada em `/content` é importado dentro de componentes. Tudo passa por `lib/conteudo.ts`, que valida com Zod no build. Conteúdo malformado deve quebrar o build, não a tela do usuário.

---

## 5. Modelo de dados

### 5.1 Conteúdo (arquivos, somente leitura)

```ts
type Modulo = {
  id: string;              // "m3"
  ordem: number;
  nome: string;
  faculdade: string;       // matéria da ADS correspondente
  etiqueta: "base" | "fullstack" | "seguranca";
  descricao: string;
  aulas: Aula[];
};

type Aula = {
  id: string;              // "m3a1"
  titulo: string;
  minutos: number;
  resumo: string;                    // UMA frase
  ideia: string[];                   // 2 a 3 linhas curtas
  exemplo?: { nota?: string; codigo: string; linguagem?: string };
  mais?: { titulo: string; linhas: string[] };   // recolhido por padrão
  quiz?: Questao[];
  desafio?: { pergunta: string; solucao: string };
};

type Questao = {
  pergunta: string;
  opcoes: string[];
  correta: number;         // índice
  porque: string;
};

type Demanda = {
  id: string;
  nivel: 1 | 2 | 3;
  titulo: string;
  de: string;              // "Marcos, seu gestor"
  canal: "Slack" | "E-mail" | "Ticket";
  numero?: string;         // "#4412", só para ticket
  prazo: string;           // informal: "hoje, se der"
  depois?: string;         // pré-requisito em linguagem humana
  mensagem: string;        // multilinha, na voz do remetente
  criterios: string[];
  reviravolta?: { texto: string; criterios: string[] };
  solucao: string;
  aprendizado: string;
};

type Treino = {
  id: string;
  titulo: string;
  nivel: "Fácil" | "Médio" | "Difícil";
  tempo: number;
  enunciado: string;
  exemplos: { entra: string; sai: string }[];
  dica: string;
  solucao: string;
  custo: string;           // notação Big O em linguagem simples
};

type Projeto = {
  id: string;
  titulo: string;
  nivel: number;
  tempo: string;           // "3 a 5 horas"
  modulo: string;          // "Depois do Módulo 2"
  pitch: string;
  porque: string;          // por que vale no portfólio
  escopo: { faz: string[]; naoFaz: string[] };
  passos: { titulo: string; descricao: string }[];
  pronto: string[];
  readme: string;          // markdown com lacunas em [colchetes]
  linkedin: string;        // rascunho de post
};

type Prova =
  | { id: string; tipo: "alternativas"; titulo: string; escopo: string;
      tempo: number; questoes: Questao[] }
  | { id: string; tipo: "pratica"; titulo: string; escopo: string;
      tempo: number; aviso: string;
      tarefas: { titulo: string; enunciado: string; criterios: string[]; solucao: string }[] };

type Termo = { termo: string; area: string; definicao: string };

type PerguntaEntrevista = {
  tema: string;
  pergunta: string;
  querem: string;          // o que o entrevistador quer ouvir
  esqueleto: string;       // estrutura de resposta
  cuidado: string;         // o erro que elimina candidato
};

type Certificado = {
  nome: string; orgao: string; custo: string;
  ordem: number; quando: string; porque: string;
};

type Lab = { nome: string; tema: string; descricao: string; url?: string };
```

Os esquemas Zod correspondentes vivem em `lib/conteudo.ts`.

### 5.2 Progresso (banco, leitura e escrita)

```prisma
model Usuario {
  id            String   @id @default(cuid())
  criadoEm      DateTime @default(now())
  metaSemanal   Int      @default(3)
  energia       String   @default("media")   // baixa | media | alta
  tema          String   @default("escuro")  // escuro | claro
  fonte         Int      @default(1)         // 0 | 1 | 2
  aulas         AulaFeita[]
  sessoes       Sessao[]
  notas         Nota[]
  erros         Erro[]
  demandas      DemandaFeita[]
  treinos       TreinoFeito[]
  projetos      ProjetoFeito[]
  provas        ProvaFeita[]
  geradas       DemandaGerada[]
}

model AulaFeita     { id String @id @default(cuid()) usuarioId String aulaId String em DateTime @default(now()) usuario Usuario @relation(fields:[usuarioId], references:[id]) @@unique([usuarioId, aulaId]) }
model Sessao        { id String @id @default(cuid()) usuarioId String dia String minutos Int origem String refId String usuario Usuario @relation(fields:[usuarioId], references:[id]) }
model Nota          { id String @id @default(cuid()) usuarioId String texto String aulaId String? aulaTitulo String? em DateTime @default(now()) usuario Usuario @relation(fields:[usuarioId], references:[id]) }
model Erro          { id String @id @default(cuid()) usuarioId String mensagem String contexto String? causa String? solucao String? em DateTime @default(now()) usuario Usuario @relation(fields:[usuarioId], references:[id]) }
model DemandaFeita  { id String @id @default(cuid()) usuarioId String demandaId String minutos Int em DateTime @default(now()) usuario Usuario @relation(fields:[usuarioId], references:[id]) @@unique([usuarioId, demandaId]) }
model TreinoFeito   { id String @id @default(cuid()) usuarioId String treinoId String sozinho Boolean em DateTime @default(now()) usuario Usuario @relation(fields:[usuarioId], references:[id]) @@unique([usuarioId, treinoId]) }
model ProjetoFeito  { id String @id @default(cuid()) usuarioId String projetoId String em DateTime @default(now()) usuario Usuario @relation(fields:[usuarioId], references:[id]) @@unique([usuarioId, projetoId]) }
model ProvaFeita    { id String @id @default(cuid()) usuarioId String provaId String melhor Int total Int tentativas Int em DateTime @default(now()) usuario Usuario @relation(fields:[usuarioId], references:[id]) @@unique([usuarioId, provaId]) }
model DemandaGerada { id String @id @default(cuid()) usuarioId String json String em DateTime @default(now()) usuario Usuario @relation(fields:[usuarioId], references:[id]) }
```

`Sessao.origem` aceita `aula`, `demanda`, `treino` ou `prova`. É a tabela que alimenta tempo total e dias ativos. Toda conclusão grava uma sessão. `Sessao.dia` é o dia **local** do usuário (`lib/datas.ts`), não UTC.

### 5.3 Migração do protótipo

O protótipo guardava tudo em uma chave única no `window.storage` do artifact (formato em `docs/formato-prototipo.md`). Construa um importador que aceite esse JSON colado e popule o banco. O usuário já tem progresso e não deve perdê-lo.

---

## 6. Telas

Navegação inferior fixa, cinco itens, sempre visível: **Agora · Trilha · Prática · Caderno · Você**. Não adicione um sexto. Se algo novo surgir, vira sub-aba.

### 6.1 Agora

1. Seletor de energia em três pílulas, mostrando o bloco em minutos.
2. Bloco grande com a **próxima aula não concluída que tenha conteúdo escrito**. Aulas sem conteúdo são puladas. Se não houver nenhuma, o bloco vira um aviso de fim de conteúdo.
3. Meta semanal: dias ativos sobre meta, com barras.
4. Dois botões secundários: **Tô entediado** e **Pegar uma demanda**.

O botão "Tô entediado" sorteia entre abrir uma aula não feita que caiba no bloco atual, ou mostrar uma micro-missão de 5 minutos. Aproximadamente 60% aula, 40% micro-missão. Micro-missões vivem em `content/trilha.json`.

### 6.2 Trilha

Sub-abas: **Módulos · Projetos**.

**Módulos** — lista vertical expansível. Cada módulo mostra número, nome, matéria da faculdade correspondente e progresso `feitas/total`. Aula concluída aparece riscada com check. Aula sem conteúdo aparece com cadeado, e ao abrir mostra instrução de pedir o conteúdo, não uma tela vazia.

**Projetos** — lista de projetos de portfólio. Ver 6.6.

### 6.3 Aula

Ordem fixa na tela:

1. Barra com voltar e cronômetro `mm:ss de bloco:00`. Passar do bloco muda a cor para verde, não vermelho. Estourar o tempo não é falha.
2. Título e módulo.
3. Resumo em uma frase, com barra lateral âmbar.
4. **Ideia** — 2 a 3 parágrafos curtos.
5. **Exemplo** — nota curta e bloco de código.
6. **Bloco recolhido** com o detalhe extra, se existir.
7. **Teste rápido** — alternativas com retorno imediato e explicação.
8. **Desafio** — enunciado, solução sob botão, e o corretor de IA.
9. **Não entendeu?** — botão "Explica de outro jeito" e campo de pergunta livre.
10. **Suas anotações desta aula** — notas filtradas por aula, com campo para adicionar.
11. Rodapé: "Marcar como feita", ou, se já feita, indicador de concluída e botão "Desmarcar".

Marcar como feita grava uma `Sessao` com os minutos do cronômetro.

### 6.4 Prática

Sub-abas: **Demandas · Treino · Provas · Revisar**.

**Demandas.** A demanda simula trabalho. Abre com a mensagem do remetente formatada como mensagem, não como enunciado. Voz coerente com o canal: Slack em minúsculas e informal, e-mail formal, ticket seco e numerado. Abaixo, checklist de critérios marcáveis.

O comportamento central: o primeiro botão é **"Entregar pro Marcos"**. Ao clicar, **o escopo muda**. Uma segunda mensagem aparece com o que a pessoa esqueceu de falar, novos critérios entram na lista, e só o segundo clique fecha a demanda. Esse é o recurso mais valioso da tela e não deve ser simplificado.

No fim da lista, o gerador de demandas (seção 7.4).

**Treino.** Algoritmo puro, estilo entrevista. Enunciado, exemplos de entrada e saída, dica atrás de botão, solução atrás de outro botão, custo em Big O. Conclui com dois botões distintos: **Resolvi sozinho** e **Resolvi com ajuda**. A diferença aparece em Você.

**Provas.** Duas categorias, comportamentos diferentes.

*Alternativas:* uma questão por vez, com barra de progresso, **sem nenhum retorno até o fim**. Navegação para frente e para trás. Ao finalizar, nota grande, e abaixo apenas as questões erradas, com o que foi marcado, a resposta certa e a explicação. Abaixo de 70% a mensagem manda revisar, sem dramatizar. Guarda a melhor nota e o número de tentativas.

*Prática:* todas as tarefas visíveis, cada uma com enunciado, critérios marcáveis e corretor de IA. Aviso no topo dizendo que marcar critério não cumprido só engana a si mesmo. "Finalizar" calcula a nota por critérios atendidos e abre todas as soluções.

**Revisar.** Embaralha as questões das aulas já concluídas, uma por vez, com retorno imediato. Sem nota, sem fim. É revisão, não avaliação.

### 6.5 Caderno

Sub-abas: **Notas · Erros · Glossário**.

**Notas.** Campo de texto, lista cronológica, filtro entre todas, das aulas e soltas. Nota criada dentro de uma aula carrega o título da aula como etiqueta.

**Erros.** Quatro campos: a mensagem de erro exata, o que estava fazendo, **a causa real** e como resolveu. Com busca. O rótulo do terceiro campo deve reforçar "não o sintoma, o motivo de verdade" — é ali que está o valor.

**Glossário.** Busca por termo e por definição, mais filtro por área. Definição de uma linha por termo.

### 6.6 Projeto

Cada projeto abre com:

1. Pitch em uma frase.
2. Por que vale no portfólio.
3. **Escopo em duas colunas: o que faz e o que não faz.** Em telas estreitas, empilha com "não faz" sempre visível, nunca escondido atrás de acordeão.
4. Passo a passo numerado, 5 ou 6 etapas. A primeira etapa deve reaproveitar código que o usuário já escreveu, nunca começar do zero.
5. Critérios de pronto.
6. README modelo, com botão copiar. As lacunas ficam em `[colchetes]` de propósito.
7. Rascunho de post do LinkedIn, com botão copiar, e um aviso de que o valor está no detalhe específico que só ele viveu.
8. Botão "Publiquei no GitHub", reversível.

### 6.7 Você

Sub-abas: **Progresso · Entrevista · Certificados**.

**Progresso.** Aulas concluídas, tempo total, módulos completos, projetos no GitHub, demandas entregues, treinos resolvidos sozinho sobre total, dias ativos, notas. Abaixo, meta semanal configurável e botão de apagar dados com confirmação em dois passos, preservando tema e tamanho de fonte.

**Entrevista.** Perguntas agrupadas por tema. Cada uma mostra só a pergunta. O botão diz **"respondi, ver o gabarito"** — a ordem importa: responder em voz alta antes de abrir. Ao abrir, três blocos: o que eles querem ouvir, esqueleto de resposta, e cuidado (em cor de alerta).

**Certificados.** Ordenados por custo, não por prestígio, com o motivo de cada posição. Gratuitos destacados em verde. Aviso permanente de que preços mudam e devem ser conferidos no site oficial. Abaixo, laboratórios gratuitos, e um bloco final sobre legalidade de testes.

---

## 7. Recursos de IA

Todas as chamadas passam por route handlers no servidor. A chave `ANTHROPIC_API_KEY` fica em variável de ambiente e **nunca** chega ao navegador.

**Custo:** fora do claude.ai, cada chamada é cobrada por token na conta da API. Coloque um limite de chamadas por dia por usuário desde a primeira versão, configurável, com mensagem clara quando estourar.

### Voz compartilhada (system prompt)

```
Você é professor particular de um aluno brasileiro que está começando
programação do zero, com foco em segurança da informação.

Regras de estilo, sem exceção:
- Português do Brasil, direto, sem enrolação.
- Frases curtas. Nada de introdução ou despedida.
- Exemplo concreto sempre que possível.
- Texto puro. Nada de markdown, asterisco, cerquilha ou emoji.
- Código, quando houver, em linhas soltas, sem cercas de crase.
- Máximo 250 palavras.
- Nunca elogie por elogiar. Se estiver errado, diga que está errado.
```

### 7.1 Corretor de código — `POST /api/ia/corrigir`

Entrada: título da tarefa, enunciado, lista de critérios, solução de referência, código do usuário.

O prompt pede, nesta ordem: (1) critério por critério, no formato `ATENDIDO` ou `FALTA` seguido do critério e uma frase; (2) no máximo dois problemas além dos critérios, priorizando bug real sobre estilo; (3) uma frase final dizendo se está pronto para entregar. Instrução explícita de **não reescrever o código inteiro** — apenas mostrar a linha ou trecho a corrigir.

Aparece em: desafio da aula, demanda, cada tarefa de prova prática.

### 7.2 Explica de outro jeito — `POST /api/ia/explicar`

Entrada: título da aula, módulo, resumo e ideia que o usuário leu.

O prompt exige analogia **diferente** da que está no texto, começar pelo exemplo concreto e não pela definição, e terminar com uma pergunta curta de autoverificação.

### 7.3 Pergunta livre — `POST /api/ia/perguntar`

Entrada: contexto da aula (resumo, ideia, exemplo) e a pergunta.

Instrução extra: se a pergunta for sobre assunto de um módulo posterior, responder o essencial em duas frases e dizer onde é aprofundado. Nunca responder apenas "depende".

### 7.4 Demanda gerada — `POST /api/ia/demanda`

Entrada: lista de títulos das aulas já concluídas.

Saída: JSON puro, no formato `Demanda` da seção 5.1, validado com Zod antes de salvar. Se a validação falhar, tentar mais uma vez e depois desistir com mensagem clara.

O prompt precisa: proibir repetir validador de senha e análise de log de login; exigir voz coerente com o canal; exigir que a mensagem seja **levemente vaga**, como pedido real; exigir reviravolta com 1 ou 2 critérios novos.

Demandas geradas ficam salvas e aparecem no topo da lista com selo "nova".

### Tratamento de falha

Qualquer erro mostra bloco com borda de alerta e texto útil, nunca stack trace. Botão continua clicável para nova tentativa. Estado de carregamento usa texto próprio do contexto ("O gestor está digitando..."), não spinner genérico.

---

## 8. Design system

> Nota (17/09/2026): a **execução visual** desta seção foi reformada para o sistema "Caderno" (papel/tinta morna, Fraunces + Karla + JetBrains Mono, hierarquia sem tarja lateral). O sistema atual está em `DESIGN.md`. Os princípios da seção 2 e a **semântica de cor** abaixo (âmbar = ativo, verde = feito, vermelho = alerta real) continuam valendo; o que mudou foi a paleta neutra, a tipografia e o modo de separar blocos. O texto original fica abaixo como registro da intenção.


### Cores

```css
/* escuro, padrão */
--ink:#0d1320;  --panel:#151f31; --panel2:#1d2840; --line:#2a3a57;
--text:#eef2f9; --dim:#9dacc6;   --code:#d9e3f4;
--amber:#f5ad45; --done:#5fc0a5; --alert:#ea7157;

/* claro */
--ink:#f1f4f9;  --panel:#ffffff; --panel2:#e6ebf3; --line:#ccd6e4;
--text:#111a28; --dim:#566379;   --code:#1c2738;
--amber:#a8631a; --done:#1c7a62; --alert:#b6462c;
```

Âmbar é sempre "agora, ativo, atenção". Verde é "concluído". Vermelho é só alerta real, nunca falha do usuário.

Azul-tinta em vez de preto: menos cansativo em turno noturno e foge do clichê visual de segurança.

### Tipografia

- Títulos e interface: **Space Grotesk**
- Texto corrido: **Karla**
- Código e números: **JetBrains Mono**

Escala controlada por variável `--esc`, com três valores: `0.94`, `1`, `1.14`. Todos os tamanhos são `calc(Npx * var(--esc))`. O controle fica no topo direito, sempre acessível, ao lado do alternador de tema.

### Regras de layout

- Largura máxima do texto: 62 caracteres. Linha atravessando a tela inteira cansa.
- Alvos de toque: mínimo 46px de altura.
- Blocos importantes usam **barra lateral colorida de 4 ou 5px**, não cartões arredondados uniformes. Isso diferencia hierarquia sem repetir o mesmo cartão em tudo.
- `prefers-reduced-motion` respeitado.
- Mobile primeiro. O celular é o dispositivo principal.

### Voz do texto da interface

Direta, sem entusiasmo forçado, sem culpa. Exemplos que já funcionam e devem ser preservados:

- "Parou no meio? Volte depois. Nada aqui te pune por isso."
- "Seu bloco acabou. Marcar como feita agora já é lucro."
- "Seja honesto aqui. O registro só serve se for verdade."
- "O número que importa não é a sequência perfeita. É o total que não volta pra trás."

Proibido: emoji na interface, exclamação em excesso, "Parabéns!", confete, mensagens motivacionais genéricas.

---

## 9. Conteúdo existente e pendente

### Extraído do protótipo para `/content` (contagem real)

| Item | Quantidade |
|---|---|
| Módulos com aulas escritas | 2 (Lógica, Python) — 14 aulas completas |
| Módulos com títulos definidos | 10 restantes, 54 aulas nomeadas |
| Demandas | 6, com reviravolta e solução |
| Treinos | 8 |
| Projetos | 5, com README e post |
| Provas | 2 de alternativas (18 questões), 2 práticas (6 tarefas) |
| Glossário | 83 termos |
| Entrevista | 16 perguntas |
| Certificados | 8, mais 9 laboratórios |
| Micro-missões | 7 |

### Trilha completa

1. Lógica de verdade — Pensamento Computacional — *escrito*
2. Python: primeiros comandos — Paradigmas de Linguagens em Python — *escrito*
3. Linux e linha de comando — Sistemas Operacionais — **próximo**
4. Redes: como as máquinas conversam — Comunicação Entre Aplicações
5. Web na prática — Desenv. Web em HTML5, CSS, JS e PHP — *etiqueta fullstack*
6. Fundamentos de segurança — Introdução à Segurança da Informação — *etiqueta seguranca*
7. Quebrando aplicações web — Desenvolvimento de Software Seguro — *etiqueta seguranca*
8. Banco de dados e SQL Injection — Banco de Dados — *etiqueta fullstack*
9. Como a máquina funciona por dentro — Arquitetura de Computadores
10. Estrutura de dados e algoritmos — Estrutura de Dados / Algoritmos e Complexidade
11. Python para segurança — Desenvolvimento Rápido de Aplicações em Python — *etiqueta seguranca*
12. Nuvem, deploy e DevSecOps — Computação em Nuvem / Engenharia de Software — *etiqueta fullstack*

**Trilha única.** Não crie uma trilha paralela de full stack. Os módulos 5, 8 e 12 carregam o conteúdo full stack e recebem a etiqueta correspondente. Dividir em duas trilhas divide a atenção, que é o ponto fraco do usuário.

---

## 10. Ordem de construção

Cada fase termina em algo utilizável. Não avance com fase anterior pela metade.

### Fase 1 — Esqueleto e conteúdo — *pronta*
Projeto, design system, navegação, carregamento e validação de `/content`, telas Agora, Trilha e Aula (e Projeto, que é só conteúdo). Progresso em memória ainda.

*Pronto quando:* dá para abrir uma aula do Módulo 1, ler tudo e responder o teste.

### Fase 2 — Persistência — *pronta*
Prisma, schema, gravação de progresso, sessões, meta semanal, energia, tema e fonte. Importador do JSON do protótipo em `/importar` (substitui, não soma). Usuário único fixo até a fase 6.

*Pronto quando:* fechar o navegador e reabrir mantém tudo, e o progresso antigo foi importado sem perda.

### Fase 3 — Prática e portfólio — *pronta*
Demandas com reviravolta, treino com registro honesto, as duas categorias de prova, revisar. Os blocos de corretor de IA (aula, demanda, prova prática) e o gerador de demandas entram na fase 5.

*Pronto quando:* dá para entregar uma demanda, ver o escopo mudar e fechar depois.

### Fase 4 — Referência — *pronta*
Caderno, diário de erro, glossário, entrevista, certificados, tela Você.

*Pronto quando:* dá para registrar um erro e encontrá-lo pela busca três dias depois.

### Fase 5 — IA — *pronta*
Os quatro recursos da seção 7, com limite diário e tratamento de falha. Desligada por padrão: liga com ANTHROPIC_API_KEY no servidor. Modelo padrão claude-sonnet-5 (decisão de 17/09/2026, foco em confiabilidade do corretor de código a custo baixo).

*Pronto quando:* colar um código errado no corretor devolve critério por critério, e um código certo é aprovado.

### Fase 6 — Autenticação e deploy
Login simples por e-mail, Postgres, deploy.

---

## 11. Fora de escopo

Escrito aqui com o mesmo peso da seção anterior, pelo mesmo motivo que todo projeto do app declara o que não faz.

- ~~**Múltiplos usuários...** É um app de uma pessoa.~~ **Revisto em 17/09/2026:** o usuário pediu que outras pessoas possam usar. Agora é multiusuário (contas self-service, cada uma com progresso e chave de IA próprios). Continua SEM papéis, planos ou painel administrativo — só contas iguais.
- **Editor de conteúdo dentro do app.** Conteúdo é arquivo versionado no repositório.
- **Gamificação com pontos, níveis, medalhas, confete ou ranking.** Contraria o princípio 2.2 e vira ruído.
- **Notificações push e lembretes por e-mail.** O usuário trabalha em turno variável; lembrete em horário errado vira motivo de abandono.
- **Execução de Python no navegador.** Foi avaliado e descartado: dependência externa pesada, e falha silenciosa quebraria a confiança no app inteiro. O usuário roda código no editor dele.
- **Aulas geradas por IA.** Qualidade oscila e o autor perde controle da trilha. IA corrige, explica e gera demanda. Não escreve aula.
- **App nativo.** Web responsivo resolve. Se quiser ícone na tela inicial, PWA basta.

---

## 12. Nota final para quem executar

Este app é ferramenta de estudo, não o estudo. Cada hora gasta construindo é uma hora não gasta aprendendo Python.

Se em algum momento uma decisão puder ser resolvida com "mais simples" sem ferir a seção 2, escolha mais simples. O sucesso deste projeto não se mede pela arquitetura. Se mede pelo usuário ter concluído o Módulo 3.
