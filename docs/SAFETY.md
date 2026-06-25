# Safety Model

The package is read-only by design.

## Guarantees

- Reads a local skill file, contract JSON, and fixture directory.
- Does not execute commands embedded in `SKILL.md`.
- Does not approve, apply, install, or publish skills.
- Returns a report that can support human review.

## Reviewer Guidance

A passing report means the skill satisfied the local contract. It does not mean the skill should be applied without a separate approval step.
