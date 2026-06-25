# Product Requirements

## Goal

Give agents and maintainers a repeatable acceptance harness for reusable skill packages before release-candidate review.

## Non-Goals

- Executing commands embedded in skill files
- Applying or approving skills
- Replacing human review

## Requirements

- Read a `SKILL.md`, contract JSON, and fixture directory.
- Check required sections and boundary phrases.
- Check fixture count against the contract.
- Check that verification evidence is documented.
- Emit JSON for automation and Markdown for reviewers.

## Success Criteria

A maintainer can run one smoke command and attach the report to a release-candidate PR.
