# Plano de conteúdo

Documento vivo: as decisões sobre o conteúdo das aulas e o andamento da escrita. Os princípios continuam em `docs/especificacao.md`; aqui fica o que falta escrever, como, e em que pé está.

## Decisões (22/09/2026)

- **Ordem:** segurança (módulos 3 a 12) → back-end → web → dados. Cada foco sai completo (aulas + conteúdo de apoio) antes do próximo. A ordem depois de segurança é confirmada quando chegar lá.
- **Esboço:** segurança mantém os 54 títulos do spec. Web, dados e back-end ficam com 5 módulos de 5 aulas (25 por foco), esboço abaixo.
- **Multi-foco:** conteúdo de apoio pode ter `foco` em lista (`["web", "backend"]`) pra valer em mais de um foco sem duplicar. Módulo continua com um foco só. O build recusa foco inexistente e id repetido.
- **Back-end com 3 stacks** (FastAPI, Flask, Express) numa trilha só: o conceito é ensinado uma vez e o código vem nas três, em abas, pra comparar. A pessoa escolhe a stack ao escolher o foco e troca quando quiser. Exige uma preferência `stack` no banco (`npx prisma db push` na Neon + redeploy quando for implementado).
- **Segurança ofensiva** só em laboratório próprio ou alvo que autoriza (Juice Shop, DVWA, scanme.nmap.org), sempre com o lembrete legal.

## Contrato de uma aula

- `resumo`: uma frase (até uns 160 caracteres).
- `ideia`: 2 linhas curtas, no máximo 3.
- `exemplo`: `nota` curta e código real que roda, com `linguagem`.
- `mais` (opcional): o detalhe, a armadilha, o porquê.
- `quiz`: 1 ou 2 perguntas, cada uma com `porque`. Elas alimentam o Revisar.
- `desafio`: pergunta e solução completa. `desafio.linguagem` só quando difere da do exemplo.
- `minutos`: 10 a 14 na aula normal. Aula de mão na massa (montar laboratório, ferramenta nova, código nas três stacks) vai até 22, e projeto até 30. Acima de 20, a aula precisa ser do tipo em que dá pra parar no meio e voltar, porque bloco longo é o que o usuário não termina. O verificador recusa acima de 30.
- Voz: pt-BR direto, frases curtas, exemplo antes da teoria. Sem emoji, sem "Parabéns", sem travessão.
- Continuidade: a aula cita o que já foi visto ("o validador da aula 2.7"). O primeiro passo de todo projeto reaproveita código que a pessoa já escreveu.
- `desafio.pergunta` é um parágrafo só (a tela não quebra linha). Dado com várias linhas vai no exemplo ou na solução.
- Ids `m3a1`, `m3a2`... na ordem. Aula escrita nunca muda de id: o progresso das pessoas aponta pra ele.

## Conteúdo de apoio de cada foco novo

3 a 4 projetos de portfólio (README com `[lacunas]` e rascunho de post), 5 demandas com reviravolta (nível 1 a 3), 2 provas (alternativas e prática), uns 20 termos de glossário, umas 8 perguntas de entrevista, e certificados e laboratórios checados na web.

Quando o primeiro foco que não é segurança ganhar laboratórios: o aviso legal de testes em Você > Certificados passa a aparecer só no foco segurança.

## Verificação

- `npm run conteudo:checar`: estrutura das aulas, travessão, ids, citações de módulo e aula, e um placar por foco.
- `npm run conteudo:rodar`: roda o código das aulas (python, javascript, sql) e também a solução de cada treino, demanda e prova prática, que são sempre Python. `npm run conteudo:rodar -- m4 m5` filtra por módulo e `-- apoio` roda só o conteúdo de apoio. Bash e o resto são conferidos à mão num shell de verdade. `RODAR_PYTHON` aponta um venv com as bibliotecas do foco; trecho que não roda sozinho vai em `scripts/rodar-exemplos.ignorar.json` com o motivo.
- `npm run build`: validação Zod de tudo.
- Fatos (certificados, labs, ferramentas, comandos de instalação) checados na web. Nada de preço inventado.

## Andamento

### Segurança: 54 aulas

54 de 54 aulas escritas (23/09/2026). Todo o código foi executado ou conferido à mão; o que não roda sozinho está registrado abaixo.

| Módulo | Aulas | Status | Como o código foi conferido |
|---|---|---|---|
| 3 · Linux e linha de comando | 6 | escrito | bash à mão, em sandbox com HOME próprio |
| 4 · Redes: como as máquinas conversam | 6 | escrito | curl, openssl e DNS rodados de verdade; saída real nos comentários |
| 5 · Web na prática | 6 | escrito | PHP rodado no `php -S` (XAMPP), `php -l` em todos os trechos |
| 6 · Fundamentos de segurança | 6 | escrito | Python pelo runner; openssl e sessão PHP rodados à mão |
| 7 · Quebrando aplicações web | 6 | escrito | login corrigido testado com curl (401, 403, 429, mensagem única) |
| 8 · Banco de dados e SQL Injection | 5 | escrito | 10/10 trechos rodando (SQL em SQLite e Python) |
| 9 · Como a máquina funciona por dentro | 4 | escrito | Python pelo runner; o trecho em C é leitura |
| 10 · Estrutura de dados e algoritmos | 5 | escrito | 10/10 trechos rodando, saída conferida |
| 11 · Python para segurança | 5 | escrito | 8/10 pelo runner; os 2 de `requests` conferidos com venv e laboratório no ar |
| 12 · Nuvem, deploy e DevSecOps | 5 | escrito | git rodado em repositório de teste; YAML validado; Dockerfile só revisado |

#### Conteúdo de apoio de segurança (23/09/2026)

A trilha cresceu de 2 para 12 módulos e a aba Prática tinha ficado parada no módulo 2: treino nenhum de segurança, e todas as demandas e projetos rotulados "depois do Módulo 2". Isso foi fechado.

| O que | Antes | Agora |
|---|---|---|
| Treinos | 0 (só os 8 da base, de lógica) | 10, do módulo 4 ao 12 |
| Demandas | 6, todas presas ao módulo 2 | 12, as novas ligadas às aulas 4.4 a 10.1 |
| Projetos | 5, todos "Depois do Módulo 2" | 8, com um de cada etapa: módulos 7, 11 e 12 |
| Provas | 2 | 3 (`pa3` alternativas 3 a 7, `pp3` prática 8 a 12, `pp4` prática 3 a 7) |
| Glossário | 62 termos | 84, com o vocabulário que as aulas novas usam |
| Entrevista | 12 perguntas | 20 |

Buracos conhecidos, que ficaram para um módulo 13 se e quando fizer sentido: SSH na prática, hardening, detecção e resposta a incidente, como escrever e comunicar um achado, LGPD aplicada, segurança de API e JWT, e o mundo Windows e Active Directory (a trilha inteira é Linux). A aba Entrevista pergunta sobre as primeiras 24 horas depois de um vazamento, e nenhuma aula ensina isso ainda.

Pontos que ficaram registrados em código:
- `scripts/rodar-exemplos.mjs` agora roda também a solução de treino, demanda e prova prática. São 188 trechos executados a cada rodada.
- `scripts/rodar-exemplos.ignorar.json`: trecho de navegador (m5a3), os dois de `requests` (m11a1) e as três tarefas da `pp4` (bash e PHP), cada um com o motivo.
- Aula 11.1 pede `pip install requests`: pra rodar o verificador, aponte `RODAR_PYTHON` pra um venv com essa biblioteca.
- Docker não estava instalado na máquina: o Dockerfile da aula 12.2 foi revisado, não executado.
- `npm run build` falha com EPERM se o `npm run dev` estiver rodando: o Prisma não consegue trocar a DLL em uso. Pare o dev antes de buildar.

### Back-end: 25 aulas (FastAPI, Flask e Express · SQLite · pytest e node:test)

**Mecanismo das 3 stacks (pronto em 23/09/2026).** A aula traz `exemplos` e `desafio.solucoes` com uma entrada por stack (`fastapi`, `flask`, `express`), definidas em `stacks` no `trilha.json`. O build recusa aula que cubra só parte das stacks. Na tela, o Exemplo ganha abas; a aba que abre é a preferência da pessoa (`Usuario.stack`) e trocar de aba troca a preferência, pelo mesmo caminho de tema e fonte. A escolha da stack aparece em `/foco` logo depois de escolher back-end.

**Pendente em produção:** `npx prisma db push` na Neon e redeploy, por causa da coluna `stack`. Local já resolve sozinho no `npm run dev`.

**Verificação das stacks:** os exemplos importam FastAPI, Flask e Express de verdade, então o runner precisa de dois apontadores:

```bash
RODAR_PYTHON=/caminho/venv/Scripts/python.exe RODAR_NODE_MODULES=/caminho/node_modules npm run conteudo:rodar -- backend1 backend2
```

O venv tem `fastapi[standard]` e `flask`; a pasta do Node tem `express`. Código que sobe servidor (Express, sempre) é verificado de outro jeito: o runner deixa rodando por 5 segundos e só aceita se ele ficar de pé sem reclamar. As três APIs da aula 4.3 também foram testadas de ponta a ponta com curl (201, 400, 422, cabeçalho Location).

25 de 25 aulas escritas (23/09/2026).

| Módulo | Aulas | Status |
|---|---|---|
| 3 · Como uma API funciona | 5 | escrito (código compartilhado: curl, JSON, HTTP) |
| 4 · Construindo uma API REST | 5 | escrito (3 stacks; as três APIs testadas com curl) |
| 5 · Banco de dados e SQL | 5 | escrito (SQL compartilhado, integração nas 3 stacks) |
| 6 · Autenticação e sessão | 5 | escrito (3 stacks; fluxo de login e 403 testado ponta a ponta) |
| 7 · Testes e deploy | 5 | escrito (pytest e node:test rodando de verdade) |

#### Conteúdo de apoio do back-end (23/09/2026)

Fechado junto com a revisão geral. Antes, quem escolhesse back-end via 25 aulas e três telas vazias.

| O que | Antes | Agora |
|---|---|---|
| Treinos | 0 | 8, de paginação a idempotência e cursor |
| Demandas | 0 | 6, do /saude ao CSV que o Excel abre |
| Projetos | 0 | 3: API no ar, integração com API pública, fila de trabalho |
| Provas | 0 | 2 (`pa4` alternativas 3 a 5, `pp5` prática 6 e 7) |
| Glossário | 21 (só da base) | 81, com os termos de rede, web e banco religados por multi-foco |
| Entrevista | 3 | 15 |
| Certificados e labs | 0 e 0 | 4 e 5 (freeCodeCamp, AWS, pgexercises, SQLBolt, public-apis, Odin, Exercism) |

O religamento foi por multi-foco, não por cópia: 60 termos e 11 perguntas que só valiam pra segurança passaram a valer também pra back-end e, quando fazia sentido, pra web. O foco web já herda 42 termos e 7 perguntas sem ter nenhuma aula escrita.

#### O que a revisão de 23/09/2026 encontrou e corrigiu

- **Telas vazias:** Prática > Demandas e Trilha > Projetos não tinham estado vazio. Agora têm.
- **`/foco` sem saída:** quem escolhia back-end caía na pergunta da stack sem como sair. Agora tem "Decidir depois", e a aula abre na primeira stack quando ninguém escolheu.
- **12 trechos pulados em silêncio:** as aulas do módulo 1 não tinham `linguagem`, e o runner os ignorava sem contar como manual. Foram marcados como `texto` e o checador passou a exigir o campo.
- **Quiz viciado:** a resposta certa estava na posição do meio em 53% das perguntas. Um rebalanceamento cuidadoso (só onde a ordem das opções não carrega sentido) deixou a distribuição em 37/33/30.
- **`faculdade` faltando** nos 15 módulos de web, dados e back-end. Preenchida com nomes comuns de grade de ADS; ajuste se a sua grade usar outro nome.
- **Fato desatualizado:** o `node:sqlite` entrou no Node 22.5 (não no 22) e deixa de ser experimental no 25.7. As aulas 5.4 e 5.5 foram corrigidas.
- **Código morto:** `stackDaAula` em `lib/conteudo.ts`, que a tela acabou não usando.

Decisões técnicas do foco, pra não reabrir depois:
- Banco: SQLite pelos dois lados, com `sqlite3` no Python e `node:sqlite` no Node (built-in desde o Node 22, ainda experimental: o aviso aparece e a aula explica). Postgres entra como "quando trocar", não como conteúdo.
- Senha e token sem biblioteca: `hashlib.scrypt` e `hmac` no Python, `node:crypto` no Node. O token é um JWT escrito à mão, pra pessoa ver o que tem dentro; as bibliotecas (PyJWT, jsonwebtoken) aparecem no "mais".
- Testes: `pytest` com TestClient e test_client; `node:test` com fetch num servidor de porta sorteada. Nenhuma dependência além do pytest.
- Os arquivos de teste terminam com `if __name__ == "__main__": pytest.main(...)`, então o runner executa os testes de verdade e não só o import.

- **3 · Como uma API funciona:** Cliente e servidor · HTTP por dentro · Verbos e status · JSON · Testar uma API na mão
- **4 · Construindo uma API REST:** Primeira API · Rotas e parâmetros · Receber e validar dados · Respostas e erros · Organizar o projeto
- **5 · Banco de dados e SQL:** Tabelas e chaves · SELECT e WHERE · JOIN · Consulta parametrizada · A API conversando com o banco
- **6 · Autenticação e sessão:** Senha com hash · Sessão, cookie e token · Autorização: quem pode o quê · Segredos fora do código · As falhas mais comuns de API
- **7 · Testes e deploy:** Escrever um teste · Testar a API de ponta a ponta · Tratar erro e registrar log · Publicar · Projeto: API completa no ar

### Web: 25 aulas (HTML, CSS, JavaScript, React com Vite, Node com Express, SQLite)

25 de 25 aulas escritas (25/09/2026). Falta o conteúdo de apoio (demandas, treinos, projetos, provas); o glossário e a entrevista já vieram por multi-foco (42 termos, 7 perguntas).

| Módulo | Aulas | Status | Como foi conferido |
|---|---|---|---|
| 3 · HTML | 5 | escrito | páginas servidas e abertas no navegador; validação nativa e imagens checadas por script |
| 4 · CSS | 5 | escrito | estilos aplicados e medidos: box model deu 350 e 300px, grid deu 3, 2 e 1 colunas |
| 5 · JavaScript no navegador | 5 | escrito | DOM, fetch e localStorage testados no navegador, com interação de verdade |
| 6 · React com Vite | 5 | escrito | 8 trechos JSX compilados com esbuild e renderizados com React 19 |
| 7 · Back-end e banco | 5 | escrito | Express e node:sqlite de pé; página criando e marcando no banco pelo navegador |

Verificação do foco web, além do runner:
- HTML e CSS são servidos numa pasta e medidos no navegador (`getComputedStyle`, `getBoundingClientRect`). Número que a aula afirma é número que apareceu na tela.
- JSX agora roda no próprio `conteudo:rodar`: esbuild transforma e `react-dom/server` desenha. Precisa de `react`, `react-dom` e `esbuild` na pasta apontada por `RODAR_NODE_MODULES`; sem ela, o trecho volta a contar como manual.
- Dois erros reais apareceram assim e foram corrigidos: `Date.now()` como id gerava tarefas com o mesmo id (marcar uma marcava as duas; agora é `crypto.randomUUID()`), e o SQLite não criava a pasta `dados/` sozinho.

- **3 · HTML:** Como o navegador monta a página · Tags e semântica · Links, imagens e listas · Formulários · Acessibilidade básica
- **4 · CSS:** Seletores e cascata · Box model · Flexbox · Grid · Responsivo
- **5 · JavaScript no navegador:** De Python pra JavaScript · Manipular o DOM · Eventos · Fetch e APIs · Projeto: lista de tarefas que não some
- **6 · Front-end com React:** Por que um framework (e o Vite) · Componentes · Props e listas · Estado · Projeto: um app pequeno
- **7 · Back-end e banco:** Um servidor Node com Express · Rotas e API REST · Banco de dados com SQLite · Ligar o front no back · Publicar na web

### Dados: 25 aulas (Python, notebooks, pandas, matplotlib, scikit-learn)

- **3 · Python para dados:** Notebook, o caderno de quem analisa dado · Series e DataFrame · Ler CSV · Selecionar e filtrar · Agrupar e resumir
- **4 · Limpar e preparar dados:** Olhar antes de mexer · Valores faltando · Tipos e datas · Duplicatas · Juntar tabelas
- **5 · Visualização:** Que gráfico responde qual pergunta · Linha e barra · Distribuições · Relação entre variáveis · Contar história com dado
- **6 · Estatística que importa:** Média, mediana e quando a média mente · Desvio, o quanto os dados se espalham · Amostra vs população · Correlação não é causa · Probabilidade básica
- **7 · Introdução a machine learning:** O que é um modelo · Treino e teste · Classificação simples · Avaliar o resultado · Projeto: prever e explicar

## Pendências pequenas

- Rever o conteúdo de apoio de segurança que serve pra outros focos (termos de Rede e Web, perguntas do tema "Base") e marcar com multi-foco quando o foco correspondente for escrito.
- A base (módulos 1 e 2) tem alguns exemplos com sabor de segurança. Neutralizar quando os outros focos ganharem aulas (opcional).
