# Sample Research Skill

## When To Use

Use this sample skill when testing the acceptance harness.

## Required Tools Or Inputs

- Local fixtures
- A user-provided research brief

## Side-Effect Boundaries

The skill is read-only and must not execute external account writes.

## Approval Requirements

Publishing the output is a separate human-approved action.

## Examples

```bash
sample-research --fixture fixtures/company.json
```

## Validation Workflow

```bash
npm test
npm run check
npm run smoke
bash scripts/validate.sh
```
