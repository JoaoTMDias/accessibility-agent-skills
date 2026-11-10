# Contrato portátil de skill 1.0.0

Este contrato define o núcleo portátil de um skill de acessibilidade. Aplica-se a cada directório `skills/<name>/` e ao seu ficheiro `SKILL.md`.

## Estrutura

- O directório contém `SKILL.md` em UTF-8.
- O valor de `name` coincide exactamente com o nome do directório.
- Recursos adicionais são opcionais e não alteram o contrato.

## Metadados obrigatórios

O `SKILL.md` começa com frontmatter YAML delimitado por `---` e inclui:

- `name`: texto que coincide exactamente com o nome do directório.
- `description`: texto não vazio que descreve o objectivo do skill.

## Secções obrigatórias

O corpo Markdown começa, com estes títulos exactos de nível 2 e por esta ordem, pelas sete secções seguintes:

1. `Purpose and boundaries`
2. `Required inputs`
3. `Expected outcome`
4. `Sources`
5. `Optional tools`
6. `Limitations and uncertainty`
7. `Quality criteria`

Secções adicionais são permitidas apenas depois destas sete, desde que não alterem o significado destas regras.

## Fontes e referências

Em `Sources`, cada fonte externa declarada usa uma entrada Markdown no formato `- [Título](https://exemplo.pt/fonte) — Entidade responsável — versão-ou-data`. O URL é directo e usa `https://`; a versão usa números separados por pontos (por exemplo, `2.2`) ou a data de consulta usa `YYYY-MM-DD`. Cada referência interna declarada usa um link Markdown relativo ao directório do `SKILL.md`, aponta para um ficheiro existente e não sai do repositório. Quando não houver fontes aplicáveis, a secção indica `Não se aplica: <motivo>`.

O validador confirma apenas esta estrutura e a existência de referências locais. Não abre URLs nem determina se uma fonte é primária, relevante ou suficiente; essa avaliação pertence à revisão humana.

## Validação local

`npm run validate-skills` valida todos os núcleos directamente em `skills/`. Para validar outro directório com a mesma estrutura, execute `npm run validate-skills -- <directório>`. O comando termina com código diferente de zero e indica o ficheiro ou directório e a regra violada quando encontra erros.
