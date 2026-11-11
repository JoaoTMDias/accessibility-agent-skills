# Contrato portátil de skills de acessibilidade 1.0.0

## Problem Statement

O projecto precisa de uma forma consistente de criar e manter skills de acessibilidade que funcionem em Claude Code e Codex. Sem um contrato executável, cada skill pode adoptar estrutura, fontes e limites diferentes, e essa divergência só aparece tarde na revisão.

Também não existe ainda uma verificação local ou no GitHub que impeça a integração de um skill estruturalmente inválido.

## Solution

Definir o contrato portátil `1.0.0`, criar o comando único `validate-skills` e configurar a validação no GitHub Actions.

Cada skill terá um núcleo portátil em `SKILL.md`. As configurações específicas de ambiente ficarão em overlays opcionais, documentados mas sem instalador na primeira versão. A validação automática garante estrutura; a revisão humana garante qualidade, relevância das fontes e adequação das recomendações de acessibilidade.

## User Stories

1. Como autor de um skill, quero uma estrutura comum, para saber exactamente o que cada skill tem de declarar.
2. Como autor, quero que o núcleo portátil não dependa de Claude Code nem Codex, para o reutilizar entre ambientes.
3. Como autor, quero declarar propósito e limites, para evitar que o skill seja usado fora do que consegue sustentar.
4. Como autor, quero declarar entradas necessárias, para o agente pedir informação em falta em vez de inventar.
5. Como autor, quero definir o resultado esperado, para tornar o comportamento avaliável.
6. Como autor de recomendações de acessibilidade, quero citar fontes primárias adequadas, para fundamentar as recomendações.
7. Como revisor, quero ver a entidade e a versão ou data de consulta de cada fonte, para poder avaliar a sua origem.
8. Como utilizador, quero que o skill declare limitações e incertezas, para distinguir factos de conclusões condicionais.
9. Como autor, quero declarar ferramentas opcionais e alternativas aceitáveis, para o skill manter transparência quando uma ferramenta falhar.
10. Como mantenedor, quero executar um único comando de validação, para encontrar erros antes de abrir um pull request.
11. Como revisor, quero que o GitHub Actions bloqueie alterações estruturalmente inválidas, para manter o contrato consistente.
12. Como autor, quero exemplos internos válidos e inválidos, para compreender e testar as regras do validador.
13. Como utilizador de um overlay de ambiente, quero instruções manuais curtas, para activar a configuração sem depender de conhecimento implícito.
14. Como revisor humano, quero uma checklist curta de comportamento por skill, para confirmar activação, entradas em falta, limites e resultado.
15. Como mantenedor, quero versionar o contrato separadamente, para saber quando uma alteração exige migrar os skills existentes.

## Implementation Decisions

- O contrato terá a versão `1.0.0` e será a fonte de verdade para o núcleo portátil.
- Cada núcleo portátil usa `SKILL.md` com os metadados base `name` e `description`.
- Todos os núcleos incluem, por esta ordem, as secções `Purpose and boundaries`, `Required inputs`, `Expected outcome`, `Sources`, `Optional tools`, `Limitations and uncertainty` e `Quality criteria`.
- Uma secção sem conteúdo aplicável explica explicitamente porquê. Secções adicionais são permitidas depois das sete obrigatórias.
- As fontes externas usam URL directo `https://`, entidade responsável e versão ou data de consulta no formato `YYYY-MM-DD`. Referências internas usam caminhos relativos.
- Skills que façam recomendações de acessibilidade incluem pelo menos uma fonte primária adequada. A revisão humana confirma se a fonte é realmente primária, relevante e suficiente.
- Se uma fonte essencial ou ferramenta necessária não estiver disponível, o skill declara a limitação; não inventa nem substitui silenciosamente a evidência.
- O validador será implementado em TypeScript e usará apenas uma dependência YAML fixa.
- O comando `validate-skills` valida todos os núcleos e overlays existentes, produzindo erros claros.
- A validação cobre metadados, nome coerente, sete secções, estrutura de fontes, formato de URLs e referências locais. Não abre URLs externos nem avalia a qualidade semântica das fontes.
- Os overlays são opcionais. Quando existirem, incluem instruções manuais num `README.md`.
- Cada skill terá um `CHECKLIST.md` curto com activação, entrada em falta, caso negativo e resultado esperado. Só é actualizado se mudarem comportamento, entradas ou limites.
- O GitHub Actions executa o mesmo comando. A verificação falhada deve impedir a integração na branch principal através de uma regra obrigatória.
- O contrato segue Semantic Versioning: major altera regras obrigatórias, minor acrescenta regras opcionais compatíveis e patch apenas clarifica. Uma alteração major migra todos os skills na mesma alteração.

## Testing Decisions

- O teste principal é o comportamento observável do comando `validate-skills`, não os detalhes internos da sua implementação.
- A validação usa exemplos internos válidos e inválidos para cobrir metadados, secções obrigatórias, fontes, URLs, referências locais e overlays.
- Um exemplo válido confirma que o contrato aceite é processado sem erro.
- Cada exemplo inválido confirma um erro específico e compreensível.
- O GitHub Actions executa a mesma validação local, sem uma segunda implementação de regras.
- A checklist manual é complementar: testa o comportamento futuro de cada skill, mas não substitui a validação estrutural.
- Não há ainda evals automáticos de activação ou comportamento por ambiente; serão considerados depois de existirem skills e padrões estáveis.

## Out of Scope

- Criar ou escolher skills do MVP.
- Instalar overlays automaticamente.
- Criar evals automáticos por Claude Code ou Codex.
- Abrir URLs, verificar disponibilidade de fontes externas ou determinar automaticamente se uma fonte é primária.
- Declarar conformidade WCAG ou outra conformidade global.
- Suportar versões de contrato diferentes no mesmo repositório.

## Further Notes

A primeira entrega constrói a base de contrato e validação antes de publicar skills utilizáveis. Um skill só estará pronto para publicação quando passar a validação estrutural e a revisão humana de conteúdo.
