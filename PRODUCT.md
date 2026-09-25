# Meus Estudos

Destilado de `docs/especificacao.md` (a fonte da verdade). Aqui fica o que não muda com a cara do app: quem usa, tom, o que evitar, princípios.

register: product

## Usuário

Qualquer pessoa recomeçando (ou começando) programação do zero, sozinha, no tempo que tem. Não é um curso de faculdade nem um bootcamp com horário. Estuda no celular (dispositivo principal) e às vezes no computador. Multiusuário: cada pessoa tem a própria conta e o próprio progresso.

Três restrições moldam tudo:
1. Atenção difícil, tédio rápido. Blocos longos não são concluídos.
2. Constância difícil. Começa cronogramas e abandona em semanas. Não dá pra estudar todo dia.
3. Rejeição a trocar de janela. Tudo que der fica dentro do app.

Cena física: fim do dia, cansado, celular na mão, pouca energia, tentando uma aula de 10 minutos antes de dormir. Em dia livre, no computador, mais focado. O app precisa ser gentil com quem chega sem energia e sem tempo.

## Foco selecionável

A trilha tem uma **base comum** (lógica e Python) que todo mundo faz, e um **foco** que a pessoa escolhe: segurança da informação, desenvolvimento web, dados e IA, ou back-end e APIs. O foco define os módulos avançados, os projetos, o glossário e a voz da IA. Um foco por vez, trocável a qualquer momento sem perder o progresso da base. Hoje a base (14 aulas), segurança (54) e back-end (25) estão escritos, com prática, projetos, provas, glossário, entrevista e certificados próprios. Web e dados ainda não têm aulas: quem escolher esses focos vê a base e um aviso em cada módulo. No back-end, o conceito é ensinado uma vez e o código vem em três stacks (FastAPI, Flask e Express) pra não prender ninguém a uma linguagem. O andamento fica em `docs/plano-conteudo.md`.

## Propósito

Ferramenta de estudo, não o estudo. O sucesso não se mede pela arquitetura; se mede pela pessoa ter avançado de verdade na trilha. Cada hora gasta na ferramenta é uma hora não gasta programando.

## Tom de voz

Direto, sem entusiasmo forçado, sem culpa. Português do Brasil, frases curtas. Exemplos que já existem e devem sobreviver a qualquer redesign:
- "Parou no meio? Volte depois. Nada aqui te pune por isso."
- "Seu bloco acabou. Marcar como feita agora já é lucro."
- "Seja honesto aqui. O registro só serve se for verdade."
- "O número que importa não é a sequência perfeita. É o total que não volta pra trás."

## Anti-referências

- Sem gamificação barulhenta: nada de pontos, níveis, medalhas, ranking, confete, "Parabéns!". Métricas de progresso são bem-vindas, mas apresentadas com calma e honestidade — número que informa, não que premia.
- Sem emoji na interface. Sem exclamação em excesso. Sem mensagem motivacional genérica.
- A métrica de constância é **dias ativos nos últimos 7**, e falhar um dia não zera nada nem pune. Sem contador regressivo de dias perdidos.
- Vermelho é só alerta real, nunca a falha do usuário.

O visual segue "Estúdio": um SaaS de estudo moderno, calmo e legível — dashboard com sidebar no desktop, foco em hierarquia e navegação previsível. Nada de terminal neon verde-no-preto; serve a qualquer foco, não só segurança.

## Princípios estratégicos (não negociáveis)

1. Uma decisão por vez. A tela inicial (dashboard) destaca UMA próxima ação com um botão; métricas de progresso ficam em segundo plano, abaixo dela.
2. Meta semanal (dias ativos nos últimos 7), nunca sequência diária punitiva. Ninguém consegue estudar todo dia; falhar um dia não pode zerar nada. Sem punição visual.
3. Bloco dimensionado por energia (baixa/média/alta = 10/25/50 min). Cronômetro informativo, nunca bloqueante; estourar o tempo vira verde, não vermelho.
4. Curto por padrão, profundo sob demanda. Resumo + ideia; o resto é opcional.
5. Escopo fechado e explícito. Todo projeto declara o que NÃO faz com o mesmo peso do que faz.
6. Honestidade sobre o progresso. "Sozinho" vs "com ajuda"; o app não infla números.
7. IA é botão, nunca automático.

## Semântica de cor (significado, não estética)

- Acento (indigo/violeta, token `--acento`): agora, ativo, atenção. O que fazer em seguida. É a única cor de destaque para ações importantes.
- Verde: concluído.
- Vermelho: alerta real (apagar dados, gravação falhou). Nunca falha do aluno.

Estes papéis são fixos. A base é slate frio neutro (tema claro e escuro). O acento pode ser tingido por foco (`data-foco`), mas mantém o mesmo papel.
