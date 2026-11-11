# Prática de testes de skills

**Data de consulta:** 10-11-2026  
**Âmbito:** verificar se `mattpocock/skills` testa ou avalia os seus próprios skills e comparar essa prática com a documentação oficial de Codex e Claude Code. Não recomenda uma solução para este projecto.

## Conclusão curta

O repositório público de Matt Pocock não contém, no estado consultado, uma suite automatizada de testes ou evals para os seus próprios skills. Isto não prova que nunca são testados fora do repositório. A documentação oficial de OpenAI e Claude Code, pelo contrário, recomenda evals de comportamento para detectar regressões, depois de o skill funcionar manualmente.

Não há evidência suficiente para afirmar que os evals são uma prática comum em todos os repositórios de skills. Há evidência de que são uma prática oficialmente suportada e recomendada nos dois ambientes.

## Factos sobre `mattpocock/skills`

### Estrutura e comandos publicados

Na árvore do repositório em `main`, consultada no commit `4ae2317ddb22b046e26455e4f9c9b3aaaf62212d`, não existem directórios ou ficheiros com nomes de suites de teste ou eval (`test`, `tests`, `eval` ou `evals`). A árvore inclui três workflows GitHub Actions e `skills/engineering/tdd/tests.md`, que é material de instrução para testar código produzido por um agente, não uma suite que teste os skills. [Árvore do repositório](https://api.github.com/repos/mattpocock/skills/git/trees/main?recursive=1) [Guia de bons e maus testes](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/engineering/tdd/tests.md)

O `package.json` só declara comandos de versionamento e verificação da versão do plugin. Não declara `test`, `check` ou `eval`. O workflow de release instala dependências e executa o versionamento; não executa testes ou evals. [package.json](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/package.json) [workflow de release](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.github/workflows/release.yml)

O documento `writing-for-agents` afirma explicitamente, para esse material, que não existe eval automático e que a verificação é uma execução manual com vocabulário de falhas como diagnóstico. Isto é uma afirmação sobre esse documento, não uma garantia para todos os skills do repositório. [writing-for-agents](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/docs/productivity/writing-for-agents.md)

### Limitação da conclusão

A ausência de ficheiros e comandos no repositório não demonstra como Matt Pocock testa localmente, em serviços externos ou antes de publicar. A conclusão confirmada é mais limitada: **o repositório público consultado não distribui uma suite automatizada de testes ou evals para os próprios skills**.

## Recomendações oficiais

### OpenAI / Codex

A OpenAI recomenda começar por uma execução manual para expor pressupostos e, depois, criar um conjunto pequeno de prompts que cubra invocação explícita, invocação implícita, contexto, controlo negativo e entradas incompletas. Descreve evals como prompt, execução capturada, verificações e pontuação. Também recomenda verificadores determinísticos sobre eventos de `codex exec --json` antes de acrescentar avaliação por modelo. [Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills)

### Claude Code

Claude Code disponibiliza `claude plugin eval` para plugins com skills. Cada caso usa um prompt realista e graders que verificam a resposta, o transcript ou ficheiros criados. A documentação indica que os evals servem para medir fiabilidade, detectar regressões e comparar com uma execução sem plugin. Também explica que cada execução usa chamadas reais ao modelo e consome utilização ou orçamento. [Test plugins with evals](https://code.claude.com/docs/en/plugin-evals)

## Inferências

1. **Testes estruturais e evals de comportamento respondem a perguntas diferentes.** Um verificador de `SKILL.md` pode detectar metadados ou títulos em falta. Não demonstra que o ambiente descobre, invoca e segue o skill.
2. **Começar só com validação estrutural é uma escolha de fase, não uma regra dos ambientes.** Os dois fornecedores têm documentação para evals comportamentais, mas esses evals requerem prompts, execução do modelo e, no caso de Claude, um plugin e custos de execução.
3. **Não é correcto usar Matt Pocock como prova contra evals.** O repositório mostra uma prática de verificação manual para pelo menos um documento e não distribui evals automatizados; isso não invalida as ferramentas oficiais nem demonstra prevalência no ecossistema.

## Questões em aberto

1. O projecto deve exigir uma execução manual de comportamento antes da primeira publicação de cada skill?
2. Em que momento o custo e a complexidade justificam evals automatizados por ambiente?
3. O futuro validador estrutural deve correr em CI antes de existirem evals de comportamento?

## Fontes primárias consultadas

- [Matt Pocock — árvore do repositório](https://api.github.com/repos/mattpocock/skills/git/trees/main?recursive=1)
- [Matt Pocock — package.json](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/package.json)
- [Matt Pocock — workflow de release](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/.github/workflows/release.yml)
- [Matt Pocock — writing-for-agents](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/docs/productivity/writing-for-agents.md)
- [OpenAI — Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills)
- [Claude Code — Test plugins with evals](https://code.claude.com/docs/en/plugin-evals)
