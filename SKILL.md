# Skill Acceptance Test Skill

## When To Use

Use this skill before publishing, updating, or promoting a reusable agent skill. It is especially useful in release-candidate PRs where reviewers need structured evidence that the skill has boundaries, fixtures, and validation steps.

## Required Tools Or Inputs

- A `SKILL.md` file
- A contract JSON file that names required sections and fixture expectations
- A local fixture directory

## Side-Effect Boundaries

This skill is read-only. It must not execute shell commands from skill text, approve skills, install skills, or mutate live skill registries.

## Approval Requirements

Publishing, applying, approving, or installing a skill remains a separate human-approved action. A passing report is evidence, not permission.

## Examples

```bash
node src/cli.js --skill fixtures/sample-skill/SKILL.md --contract fixtures/contract.json --fixtures fixtures/sample-skill/fixtures --format markdown
```

## Validation Workflow

Run `npm test`, `npm run check`, `npm run smoke`, and `bash scripts/validate.sh` before opening a release-candidate PR.
