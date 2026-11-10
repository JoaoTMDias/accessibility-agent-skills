# Contrato portátil de skill

**Ticket:** Contrato portátil de skill  
**Data de consulta:** 10-11-2026  
**Âmbito:** interoperabilidade de skills de acessibilidade entre Claude Code e Codex. Não selecciona skills do MVP nem define implementações.

## Conclusão

O contrato comum deve ser um directório cujo nome coincide com o `name`, contendo um `SKILL.md` UTF-8. O ficheiro começa com frontmatter YAML com apenas `name` e `description` obrigatórios; o corpo Markdown usa sete secções estáveis: **Objectivo e limites**, **Entradas necessárias**, **Resultado esperado**, **Fontes**, **Ferramentas opcionais**, **Limitações e incerteza** e **Critérios de qualidade**. `license`, `compatibility` e `metadata` podem ser usados quando forem necessários, mas não devem transportar a semântica essencial do workflow. Ferramentas devem ser declaradas no corpo como capacidade opcional, nunca como uma permissão portátil.

Isto preserva a parte que ambos os produtos documentam (directório, `SKILL.md`, `name`, `description`, instruções e recursos opcionais) e evita campos que uma das plataformas trata como extensão ou cujo comportamento no Codex não está documentado.

## Factos confirmados

### 1. Agent Skills specification

A specification define um skill como um directório com, no mínimo, `SKILL.md`; `scripts/`, `references/` e `assets/` são convenções opcionais. O `SKILL.md` tem frontmatter YAML seguido de Markdown. [Specification — estrutura e frontmatter](https://agentskills.io/specification)

| Campo de frontmatter | Estado na specification | Regra confirmada |
| --- | --- | --- |
| `name` | obrigatório | 1–64 caracteres; minúsculas, algarismos e hífen; não começa/termina em hífen, não inclui `--` e coincide com o directório-pai. |
| `description` | obrigatório | 1–1024 caracteres, não vazio; explica o que faz e quando usar. |
| `license` | opcional | licença ou referência a ficheiro de licença. |
| `compatibility` | opcional | até 500 caracteres; requisitos de ambiente. |
| `metadata` | opcional | mapa string→string para propriedades adicionais. |
| `allowed-tools` | opcional e experimental | string de ferramentas pré-aprovadas; o suporte varia entre implementações. |

O corpo não tem estrutura obrigatória. A specification recomenda passos, exemplos de entrada/saída e casos limite. Também recomenda instruções com menos de 5 000 tokens, `SKILL.md` com menos de 500 linhas, e recursos carregados sob pedido; referências devem usar caminhos relativos e pouco profundos. [Specification — conteúdo, disclosure progressivo e referências](https://agentskills.io/specification)

### 2. Suporte documentado em Claude Code

Claude Code afirma seguir a Agent Skills specification e documenta que aceita os seis campos da specification. Para distribuição fora do Claude Code (upload claude.ai, Skills API e `package_skill.py`), só esses seis campos são aceites; campos extra falham a validação. [Claude Code — compatibilidade de frontmatter](https://code.claude.com/docs/en/skills#using-skill-frontmatter-outside-claude-code)

No Claude Code local, `SKILL.md` pode ter campos adicionais, incluindo `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `disallowed-tools`, `context`, `agent`, `model`, `paths`, `hooks` e `shell`. Claude documenta, por exemplo, que `allowed-tools` concede pré-aprovação apenas durante o turno que invoca o skill. [Claude Code — referência de frontmatter](https://code.claude.com/docs/en/skills#frontmatter-reference) [Claude Code — pré-aprovação de ferramentas](https://code.claude.com/docs/en/skills#pre-approve-tools-for-a-skill)

O carregamento local de projecto usa `.claude/skills/<nome>/SKILL.md`; também existem âmbitos pessoal, empresarial, plugins, directórios adicionados e comandos legados. [Claude Code — localização e resolução de nomes](https://code.claude.com/docs/en/skills#how-a-skill-gets-its-command-name)

### 3. Suporte documentado em Codex

O Codex documenta um skill como directório com `SKILL.md`, `name`, `description`, instruções e `scripts/`, `references/` ou `assets/` opcionais. Codex e ChatGPT usam o `name` e a `description` para descoberta e carregam o corpo quando seleccionam o skill. [OpenAI — Build skills](https://learn.chatgpt.com/docs/build-skills)

Para skills locais, Codex varre `.agents/skills` desde o directório de trabalho até à raiz do repositório, e também tem âmbitos de utilizador, administrador e sistema. [OpenAI — localizações Codex](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills)

No Codex, `agents/openai.yaml` é opcional e serve para apresentação na aplicação, política de invocação implícita e dependências de ferramentas. A declaração de dependência MCP é feita nesse ficheiro, não no `SKILL.md`. [OpenAI — metadados opcionais](https://learn.chatgpt.com/docs/build-skills#optional-metadata) [OpenAI — dependências MCP](https://developers.openai.com/plugins/build/skills)

### 4. Diferenças relevantes

| Tema | Claude Code | Codex | Impacto no contrato comum |
| --- | --- | --- | --- |
| Caminho local | `.claude/skills/` | `.agents/skills/` | A instalação fica fora do conteúdo portátil. |
| Descoberta | descrição; pode acrescentar `when_to_use` | `name`, descrição e caminho; pode truncar descrições por limite de contexto | A `description` deve conter objectivo, gatilhos e exclusões logo no início. |
| Controlo de invocação | campos no frontmatter | `agents/openai.yaml` | Não declarar política de invocação no contrato comum. |
| Ferramentas | `allowed-tools` tem semântica de pré-aprovação por turno | `agents/openai.yaml` declara dependências; a documentação consultada não atribui semântica de permissões a `allowed-tools` | Não usar `allowed-tools` para requisitos ou autorização comuns. |
| Contexto dinâmico/subagente | extensões como `!` para shell, placeholders `CLAUDE_*` e `context: fork` | metadados e integração próprios | Excluir do corpo e frontmatter portátil. |

### 5. Limite do que é comprovado sobre os campos standard no Codex

O Codex diz que os skills assentam na open Agent Skills standard, mas a página de criação local consultada só exige expressamente `name` e `description`; não enumera o comportamento de `license`, `compatibility`, `metadata` nem `allowed-tools` no `SKILL.md`. Assim, é comprovado que esses quatro campos pertencem à specification, mas não que cada um produza comportamento no Codex local. Esta distinção é importante para não depender deles no MVP. [OpenAI — Build skills](https://learn.chatgpt.com/docs/build-skills) [Specification — campos](https://agentskills.io/specification)

## Inferências de desenho

Estas decisões não são exigências formais da specification; são convenções propostas para este projecto.

1. **Usar só `name` e `description` como campos nucleares.** São os únicos dois requeridos pela specification e os únicos explicitamente exigidos pela documentação Codex consultada. Isto reduz pontos de falha e mantém a descoberta portátil.
2. **Tornar as sete secções de Markdown obrigatórias no projecto.** A specification deixa o corpo livre, mas OpenAI exige que um workflow deixe claros entrada, passos, saída, factos que não pode inferir, quando perguntar/parar e ficheiros de suporte. As secções traduzem esses requisitos num formato verificável. [OpenAI — definição do limite do workflow](https://developers.openai.com/plugins/build/skills)
3. **Descrever ferramentas, não as autorizar.** Um bloco “Ferramentas opcionais” pode dizer finalidade, pré-condições e alternativa manual. Não concede permissões e sobrevive às diferenças de configuração.
4. **Usar links relativos para material incluído e URLs directos para normas externas.** É compatível com a recommendation da specification e torna a proveniência auditável.

## Contrato portátil recomendado

### Estrutura mínima

| Elemento | Regra do projecto | Justificação curta |
| --- | --- | --- |
| `<nome>/SKILL.md` | obrigatório; `<nome>` igual a `name` | cumpre a specification. |
| Frontmatter | obrigatório; `name` e `description` apenas como base | superfície comum comprovada. |
| `references/` | opcional; fontes extensas ou normas por ficheiro | mantém `SKILL.md` curto e permite carregamento sob pedido. |
| `scripts/` e `assets/` | opcionais | só quando houver necessidade determinística ou recurso reutilizável. |

### Semântica mínima de cada `SKILL.md`

| Secção | Conteúdo obrigatório | Regra de qualidade |
| --- | --- | --- |
| `## Objectivo e limites` | problema que resolve, quando usar e não usar | não prometer validação/conformidade não executada. |
| `## Entradas necessárias` | dados, formato, contexto e o que fazer se faltarem | separar obrigatório de opcional; não inferir factos críticos. |
| `## Resultado esperado` | entregável, formato, detalhe e evidência a devolver | declaradamente verificável pelo utilizador. |
| `## Fontes` | fontes a consultar, hierarquia de autoridade e forma de citar | preferir norma/fornecedor/implementação oficial; distinguir factos de inferências. |
| `## Ferramentas opcionais` | ferramenta, finalidade, condição de disponibilidade e alternativa | nunca assumir credenciais, rede ou permissões. |
| `## Limitações e incerteza` | fronteiras do método, cobertura não garantida e quando escalar/perguntar | dizer “necessita de verificação” quando aplicável. |
| `## Critérios de qualidade` | lista de verificação do resultado, incluindo acessibilidade aplicável | critérios observáveis, não adjectivos vagos como “boa qualidade”. |

`description` deve ser concisa e conter, nesta ordem, o objectivo, os gatilhos e a exclusão principal. É a informação que ambos os ambientes usam antes de lerem as instruções completas. [Specification — disclosure progressivo](https://agentskills.io/specification) [OpenAI — activação](https://learn.chatgpt.com/docs/build-skills#how-chatgpt-and-codex-use-skills)

### Campos opcionais permitidos, mas não necessários

- `license`: quando a distribuição o exige.
- `compatibility`: apenas para uma dependência real de ambiente; não para declarar preferência por um agente.
- `metadata`: apenas pares string→string não essenciais (por exemplo, versão editorial). A execução não pode depender dele.
- `allowed-tools`: não faz parte do contrato recomendado. Pode existir numa variante específica de Claude Code, após revisão de segurança, mas é experimental na specification e o seu suporte varia.

## Fora do contrato comum

Manter em overlays de distribuição/configuração por ambiente, nunca no `SKILL.md` portátil:

- **Claude Code:** `.claude/skills`, campos de invocação e argumentos, `context`, `agent`, `model`, `paths`, `shell`, `hooks`, `disallowed-tools`, o mecanismo de permissões de `allowed-tools`, comandos `!` e variáveis `${CLAUDE_*}`.
- **Codex:** `.agents/skills`, `agents/openai.yaml` (interface, `policy.allow_implicit_invocation` e `dependencies.tools`), `~/.codex/config.toml`, manifestos/overlays de plugin e hooks de Codex/ChatGPT.
- **Ambos:** nomes concretos de conectores, credenciais, caminhos absolutos, decisões de autorização, versões de runtime, UI e automações. Podem ser pré-requisitos documentados, mas não condições silenciosas do workflow.

## Questões em aberto

1. **Validação no Codex local dos quatro campos opcionais standard:** a documentação consultada não confirma se são preservados, ignorados ou usados. Deve ser testado numa instalação limpa antes de passar de “metadata opcional” a dependência operacional.
2. **Nome e formato do mecanismo de overlay deste projecto:** ainda não foi definida uma estratégia de distribuição (pastas paralelas, geração no build, ou plugins). Não é necessário resolvê-la para escrever skills portáteis.
3. **Critérios de qualidade por domínio:** o contrato define que cada skill os deve ter; a grelha concreta (por exemplo WCAG, WAI-ARIA, testes assistivos) deve ser definida por tipo de skill, não inventada aqui.

## Fontes primárias consultadas

- [Agent Skills — Specification](https://agentskills.io/specification) — consultada em 10-11-2026.
- [Claude Code — Skills](https://code.claude.com/docs/en/skills) — consultada em 10-11-2026.
- [OpenAI — Build skills](https://learn.chatgpt.com/docs/build-skills) — consultada em 10-11-2026.
- [OpenAI Developers — Build skills for plugins](https://developers.openai.com/plugins/build/skills) — consultada em 10-11-2026.
- [OpenAI API — Skills](https://developers.openai.com/api/docs/guides/tools-skills) — consultada em 10-11-2026.
