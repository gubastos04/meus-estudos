# Meus Estudos

Destilado de `docs/especificacao.md` (a fonte da verdade). Aqui fica o que não muda com a cara do app: quem usa, tom, o que evitar, princípios.

register: product

## Usuário

Uma pessoa só. Adulto, formado em Análise e Desenvolvimento de Sistemas, recomeçando programação do zero com meta de carreira em segurança da informação. Trabalha em escala noturna 12x36, fora da área. Estuda no celular (dispositivo principal) e às vezes no computador.

Três restrições moldam tudo:
1. Atenção difícil, tédio rápido. Blocos longos não são concluídos.
2. Constância difícil. Começa cronogramas e abandona em semanas.
3. Rejeição a trocar de janela. Tudo que der fica dentro do app.

Cena física: 3h da manhã, saindo de um plantão de 12h, celular na mão, quarto com pouca luz, energia baixa, tentando uma aula de 10 minutos antes de dormir. Em dia de folga, à tarde, no computador, mais focado.

## Propósito

Ferramenta de estudo, não o estudo. O sucesso não se mede pela arquitetura; se mede pelo usuário ter concluído o Módulo 3. Cada hora gasta na ferramenta é uma hora não gasta aprendendo Python.

## Tom de voz

Direto, sem entusiasmo forçado, sem culpa. Português do Brasil, frases curtas. Exemplos que já existem e devem sobreviver a qualquer redesign:
- "Parou no meio? Volte depois. Nada aqui te pune por isso."
- "Seu bloco acabou. Marcar como feita agora já é lucro."
- "Seja honesto aqui. O registro só serve se for verdade."
- "O número que importa não é a sequência perfeita. É o total que não volta pra trás."

## Anti-referências

- Sem gamificação: nada de pontos, níveis, medalhas, ranking, confete, "Parabéns!".
- Sem emoji na interface. Sem exclamação em excesso. Sem mensagem motivacional genérica.
- Sem sequência diária ("streak") nem contador regressivo de dias perdidos. A métrica é dias ativos nos últimos 7, e falhar um dia não zera nada.
- Nada de dashboard de monitoramento (o clichê "app de segurança = dark azul com gráfico"). Nem terminal neon verde-no-preto. É um espaço de estudo calmo, não um SOC.
- Vermelho é só alerta real, nunca a falha do usuário.

## Princípios estratégicos (não negociáveis)

1. Uma decisão por vez. A tela inicial mostra UMA próxima ação e um botão, nunca uma grade.
2. Meta semanal, nunca sequência diária. Sem punição visual.
3. Bloco dimensionado por energia (baixa/média/alta = 10/25/50 min). Cronômetro informativo, nunca bloqueante; estourar o tempo vira verde, não vermelho.
4. Curto por padrão, profundo sob demanda. Resumo + ideia; o resto é opcional.
5. Escopo fechado e explícito. Todo projeto declara o que NÃO faz com o mesmo peso do que faz.
6. Honestidade sobre o progresso. "Sozinho" vs "com ajuda"; o app não infla números.
7. IA é botão, nunca automático.

## Semântica de cor (significado, não estética)

- Âmbar: agora, ativo, atenção. O que fazer em seguida.
- Verde: concluído.
- Vermelho: alerta real (apagar dados, gravação falhou). Nunca falha do aluno.

Estes papéis são fixos. A paleta neutra ao redor deles é livre.
