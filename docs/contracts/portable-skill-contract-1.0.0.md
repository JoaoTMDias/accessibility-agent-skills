# Contrato portátil de skill 1.0.0

Este contrato define o núcleo portátil de um skill de acessibilidade. Aplica-se a cada directório `skills/<name>/` e ao seu ficheiro `SKILL.md`.

## Estrutura

- O directório contém `SKILL.md` em UTF-8.
- O valor de `name` coincide exactamente com o nome do directório.
- Recursos adicionais são opcionais e não alteram o contrato.

## Metadados obrigatórios

O `SKILL.md` começa com frontmatter YAML delimitado por `---` e inclui:

- `name`: 1 a 64 caracteres; apenas minúsculas, algarismos e hífen; não começa nem termina por hífen e não contém hífen duplo.
- `description`: texto não vazio que descreve o objectivo do skill.

## Secções obrigatórias

O corpo Markdown inclui, com estes títulos exactos de nível 2:

1. `Purpose and boundaries`
2. `Required inputs`
3. `Expected outcome`
4. `Sources`
5. `Optional tools`
6. `Limitations and uncertainty`
7. `Quality criteria`

Secções adicionais são permitidas quando não alteram o significado destas regras.

## Validação local

`npm run validate-skills` valida todos os núcleos directamente em `skills/`. Para validar outro directório com a mesma estrutura, execute `npm run validate-skills -- <directório>`. O comando termina com código diferente de zero e indica o ficheiro e a regra violada quando encontra erros.
