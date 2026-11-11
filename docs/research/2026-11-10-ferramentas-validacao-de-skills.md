# Ferramentas oficiais para validar skills

**Data de consulta:** 10-11-2026  
**Âmbito:** ferramentas oficiais ou dos autores da Agent Skills specification que possam validar um `SKILL.md`. Inclui validação de formato, pacote e comportamento. Não selecciona nem instala ferramentas.

## Conclusão curta

Não foi identificada uma ferramenta oficial, pronta a usar e baseada em Node.js/TypeScript, que valide o contrato deste projecto por completo. A única implementação de referência da Agent Skills specification, `skills-ref validate`, é Python e é declarada pelos autores como demonstrativa, não destinada a produção. As ferramentas oficiais de Claude Code e OpenAI validam sobretudo pacotes/configuração ou comportamento; não documentam regras para títulos Markdown arbitrários nem para referências locais do projecto.

## Factos confirmados

### Cobertura por ferramenta

| Ferramenta | Runtime e estatuto | O que valida de forma documentada | Não documenta validar |
| --- | --- | --- | --- |
| [`skills-ref validate`](https://github.com/agentskills/agentskills/tree/main/skills-ref) | Python 3.11+; biblioteca de referência. Os próprios autores dizem que é apenas para demonstração e não para produção. | Existência do directório e de `SKILL.md`; frontmatter YAML; `name` e `description`; campos permitidos da specification; formato de `name`; correspondência entre nome do directório e `name`; limites de comprimento. | Corpo Markdown, títulos, URLs, links/caminhos relativos, existência de referências locais, activação ou resultados do skill. |
| [Validação de submissão de plugins OpenAI](https://developers.openai.com/plugins/deploy/submission-errors) | Validação do serviço durante a submissão de um plugin; não é documentada como CLI local reutilizável. | Localização `skills/<nome>/SKILL.md`; ficheiro regular, legível e UTF-8; YAML que é um mapa; `name` não vazio; `description` não vazia e até 1 024 caracteres; corpo não vazio; nomes únicos no plugin. | As sete secções deste projecto, semântica dos títulos, links de fontes, recursos locais e adequação do comportamento. |
| [`claude plugin validate`](https://code.claude.com/docs/en/plugin-evals) | Comando da CLI Claude Code para plugins. | A documentação diz que verifica ficheiros do plugin quanto a erros de sintaxe e de schema. | A documentação consultada não especifica regras para títulos Markdown personalizados, referências locais ou as sete secções. |
| [`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals) | Comando da CLI Claude Code; executa prompts e graders sobre um plugin. | Comportamento observado face a casos de avaliação e graders definidos pelo autor. | Conformidade estrutural detalhada do `SKILL.md`; não substitui um linter de contrato. Requer chamadas ao modelo e tem custo associado. |
| [Evals de skills no Codex](https://developers.openai.com/blog/eval-skills) | Orientação e fluxo de avaliação da OpenAI, baseado em execuções de cenários. | Qualidade e comportamento do skill perante tarefas e critérios de avaliação definidos pelo projecto. | Validação automática das sete secções, dos caminhos locais ou das regras de frontmatter como linter autónomo. |

### A implementação de referência `skills-ref`

O repositório oficial [agentskills/agentskills](https://github.com/agentskills/agentskills) inclui `skills-ref`, uma biblioteca Python de referência. O seu [README](https://github.com/agentskills/agentskills/blob/main/skills-ref/README.md) expõe o comando `skills-ref validate path/to/skill`, mas declara explicitamente que a biblioteca é apenas demonstrativa e não se destina a produção. O [ficheiro do projecto](https://github.com/agentskills/agentskills/blob/main/skills-ref/pyproject.toml) requer Python 3.11 ou superior; não é uma ferramenta Node.js/TypeScript.

O [código do validador](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py) confirma que a cobertura é de estrutura e frontmatter: verifica o directório, `SKILL.md`, o YAML e as regras dos campos. Não contém análise do corpo Markdown ou resolução de recursos referidos.

### O que a specification exige — e o que não exige

A [Agent Skills specification](https://agentskills.io/specification) exige o directório do skill, `SKILL.md` e o frontmatter com `name` e `description`. Define campos opcionais e convenções de recursos, mas não impõe títulos para o corpo Markdown. Portanto, as sete secções e a verificação de referências locais são regras adicionais deste projecto, não regras que um validador genérico da specification tenha de conhecer.

### Ferramentas oficiais por ambiente

OpenAI documenta a estrutura dos skills e a validação de submissão de plugins, mas a documentação consultada não apresenta um validador local autónomo para `SKILL.md`. A página de [skills para a API](https://developers.openai.com/api/docs/guides/tools-skills) descreve a aceitação de bundles de skills; a página de [criação de plugins](https://developers.openai.com/plugins/build/skills) descreve como os skills entram num plugin. Nenhuma define uma CLI Node.js/TypeScript que aceite regras de corpo configuráveis.

Claude Code documenta `claude plugin validate` para sintaxe e schema do plugin e `claude plugin eval` para comportamento. Estes comandos são relevantes para uma distribuição Claude em formato plugin, mas não são documentados como validadores configuráveis do contrato portátil.

## Inferências para o contrato deste projecto

1. **Nenhuma ferramenta oficial identificada cobre sem código adicional as sete secções nem as referências locais.** Isto decorre de a specification deixar o corpo livre e de as ferramentas documentadas se limitarem a formato, schema de plugin ou comportamento.
2. **`skills-ref` pode ser uma referência útil das regras-base, mas não deve ser a dependência de produção assumida.** A limitação é declarada pelos próprios autores e o runtime é Python, não Node.js/TypeScript.
3. **A validação em duas camadas mantém-se uma separação útil:** uma verificação estrutural do projecto para o contrato e avaliações comportamentais posteriores. As ferramentas de eval de Claude e OpenAI são evidência de que a segunda camada é um problema diferente de lint estrutural.
4. **Para executar tudo numa única verificação local do projecto, será necessária uma regra própria ou um adaptador.** Esta é uma conclusão de cobertura, não uma decisão sobre linguagem, dependências ou implementação.

## Lacunas e questões em aberto

- A documentação de `claude plugin validate` não enumera cada regra de schema aplicada; só confirma a categoria “sintaxe e schema”. É necessário executar o comando numa amostra, ou obter documentação mais detalhada, antes de alegar regras específicas de `SKILL.md`.
- Não foi identificada documentação oficial de uma API para estender `skills-ref validate` com títulos e referências próprios.
- Não foi identificada uma ferramenta oficial Node.js/TypeScript que faça validação estática do contrato. Isto significa “não identificada nas fontes oficiais consultadas”, e não prova que não possa surgir ou existir fora desse conjunto.
- Não foi avaliada nenhuma ferramenta de terceiros: estão fora do âmbito pedido, que privilegia fontes oficiais e os autores da specification.

## Fontes primárias consultadas

- [Agent Skills — Specification](https://agentskills.io/specification) — consultada em 10-11-2026.
- [agentskills/agentskills — repositório oficial](https://github.com/agentskills/agentskills) — consultado em 10-11-2026.
- [skills-ref — README](https://github.com/agentskills/agentskills/blob/main/skills-ref/README.md) — consultado em 10-11-2026.
- [skills-ref — `pyproject.toml`](https://github.com/agentskills/agentskills/blob/main/skills-ref/pyproject.toml) — consultado em 10-11-2026.
- [skills-ref — `validator.py`](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py) — consultado em 10-11-2026.
- [OpenAI — erros de submissão de plugins](https://developers.openai.com/plugins/deploy/submission-errors) — consultada em 10-11-2026.
- [OpenAI — skills para a API](https://developers.openai.com/api/docs/guides/tools-skills) — consultada em 10-11-2026.
- [OpenAI — skills em plugins](https://developers.openai.com/plugins/build/skills) — consultada em 10-11-2026.
- [OpenAI — Testing Agent Skills Systematically with Evals](https://developers.openai.com/blog/eval-skills) — consultada em 10-11-2026.
- [Claude Code — plugin validation and evaluation](https://code.claude.com/docs/en/plugin-evals) — consultada em 10-11-2026.
