# Exemplos oficiais de validação e distribuição de skills

**Data de consulta:** 10-11-2026  
**Âmbito:** exemplos para definir os limites de teste do contrato portátil. Não escolhe skills do MVP nem propõe uma implementação.

## Conclusão curta

Há três camadas separadas:

1. A Agent Skills specification define o formato base de `SKILL.md`.
2. `skills-ref` mostra uma validação de referência desse formato, mas o próprio projecto diz que não é uma biblioteca de produção.
3. Claude Code e OpenAI/Codex acrescentam mecanismos próprios de distribuição, configuração e teste. Estes mecanismos não pertencem ao núcleo portátil.

Isto apoia o limite de teste proposto: validar o núcleo portátil por uma interface única e testar separadamente a activação e o resultado em cada ambiente.

## Factos confirmados

### 1. O que o validador de referência verifica

O código de `skills-ref` verifica que existe um directório, que contém `SKILL.md`, que o frontmatter é legível e que inclui `name` e `description`. Também verifica o formato, o comprimento e a correspondência entre `name` e o nome do directório. Rejeita campos de frontmatter fora do conjunto definido pela specification. [Código do validador](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py)

O comando documentado é `skills-ref validate path/to/skill`. Contudo, o README afirma explicitamente que a biblioteca é uma demonstração e não se destina a produção. [README do skills-ref](https://github.com/agentskills/agentskills/blob/main/skills-ref/README.md)

**Limite confirmado:** este validador não prova a qualidade do corpo do skill. No código consultado, `validate()` lê o frontmatter e chama `validate_metadata()`; não valida títulos Markdown, semântica das instruções, referências no corpo ou fontes externas. [Código do validador](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py)

### 2. O que os exemplos oficiais testam

OpenAI recomenda testar um skill com pedidos que devem activar o skill, pedidos indirectos equivalentes, entradas incompletas, pedidos que não devem activar o skill e casos limite em que não pode inventar informação nem tomar uma acção não suportada. A documentação pede a revisão da activação e da qualidade do resultado. [OpenAI — Test the skill](https://developers.openai.com/plugins/build/skills)

Claude Code mostra duas verificações para um skill: um pedido que coincide com a descrição, para activação automática, e a invocação directa pelo comando do skill. [Claude Code — criar e testar um skill](https://code.claude.com/docs/en/skills)

OpenAI valida, na submissão de plugins, condições estruturais adicionais: `SKILL.md` como ficheiro UTF-8, frontmatter YAML válido, `name` e `description` não vazios e corpo não vazio. [OpenAI — erros de submissão](https://developers.openai.com/plugins/deploy/submission-errors)

### 3. Exemplos de separação entre núcleo e ambiente

OpenAI descreve `SKILL.md` como instruções e recursos; o MCP fornece dados, autorização e acções controladas. Quando um skill requer MCP, a dependência é declarada em `agents/openai.yaml`, não no texto do workflow. [OpenAI — Build skills](https://developers.openai.com/plugins/build/skills)

Na submissão OpenAI, `agents/openai.yaml`, quando incluído, é metadado próprio do skill e contém `interface` separado do manifesto do plugin. [OpenAI — metadados de agente do skill](https://developers.openai.com/plugins/deploy/submission-errors)

Claude Code permite skills de projecto em `.claude/skills/<nome>/SKILL.md` e skills de plugin em `<plugin>/skills/<nome>/SKILL.md`. O plugin é uma unidade maior, com manifesto e componentes como agents, hooks e MCP. [Claude Code — localizações de skills](https://code.claude.com/docs/en/skills) [Claude Code — plugins](https://code.claude.com/docs/en/plugins/create)

Claude Code também acrescenta campos de frontmatter, como `disable-model-invocation` e `allowed-tools`; este último dá uma pré-aprovação temporária e específica desse ambiente. [Claude Code — frontmatter](https://code.claude.com/docs/en/skills)

## Inferências para este projecto

1. **A validação do projecto deve complementar, não copiar, o formato base.** O exemplo `skills-ref` mostra o que pertence ao formato, mas não é uma dependência de produção recomendada pelos próprios autores.
2. **A validação estrutural e os testes de comportamento são coisas diferentes.** A primeira pode confirmar frontmatter, títulos obrigatórios e limites de pastas. A segunda deve usar pedidos de activação, entradas incompletas, negativas e casos limite.
3. **Os overlays de ambiente devem ser testados fora do núcleo portátil.** `agents/openai.yaml`, campos Claude Code e manifestos de plugin têm semântica diferente. Uma validação do `SKILL.md` não prova que a instalação em Claude Code ou Codex funciona.
4. **A verificação de referências merece uma decisão explícita.** O código de referência não resolve links do corpo. O contrato actual exige fontes identificadas, mas ainda não decidiu se a futura validação confirma que URLs e caminhos relativos existem.

## Questões em aberto

1. A validação do projecto deve limitar-se às sete secções ou também verificar referências relativas e o formato das fontes?
2. O teste de comportamento será executado manualmente nos dois ambientes ou terá uma automação por ambiente?
3. A distribuição de overlays será feita por cópia, geração, symlink ou pacotes de plugin? As fontes mostram possibilidades, mas não impõem uma escolha.

## Fontes primárias consultadas

- [Agent Skills — Specification](https://agentskills.io/specification)
- [Agent Skills — `skills-ref` README](https://github.com/agentskills/agentskills/blob/main/skills-ref/README.md)
- [Agent Skills — `skills-ref` validator](https://github.com/agentskills/agentskills/blob/main/skills-ref/src/skills_ref/validator.py)
- [OpenAI Developers — Build skills](https://developers.openai.com/plugins/build/skills)
- [OpenAI Developers — Plugin submission errors](https://developers.openai.com/plugins/deploy/submission-errors)
- [Claude Code — Skills](https://code.claude.com/docs/en/skills)
- [Claude Code — Create a plugin](https://code.claude.com/docs/en/plugins/create)
