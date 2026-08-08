# Failure Modes

## Missing affirmative boundary evidence

`requiredPhrases` are evidence checks, not keyword checks. A phrase mentioned only in a negation,
an absent/missing statement, or a placeholder produces `Missing affirmative boundary evidence:
<phrase>`. State the actual enforced behavior, such as `Inspection is read-only`, and rerun the
acceptance report.

## Missing Sections

Add the missing heading to `SKILL.md` and include enough detail for another agent to apply the workflow.

## Missing Boundary Phrases

Clarify whether the skill is read-only, what it must not execute, and which actions need human approval.

## Fixture Shortage

Add representative fixtures that cover happy path, edge case, and blocked or failing behavior.

## Missing Verification Evidence

Document a supported command (`npm test`, `npm run check`, `npm run smoke`, or
`bash scripts/validate.sh`) as its own command line in a fenced code block. Prose and commented-out
commands do not count as executable evidence. This tool records the presence of command evidence
but does not run those commands itself.

## Missing CLI Option Values

Every value-taking option (`--skill`, `--contract`, `--fixtures`, and `--format`) must be followed by
its value. End-of-command or another option in that position produces an error naming the option
whose value is missing. `--help` remains available as a standalone option.
