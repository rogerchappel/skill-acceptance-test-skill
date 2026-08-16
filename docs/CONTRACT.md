# Contract Format

```json
{
  "requiredSections": ["When To Use", "Side-Effect Boundaries"],
  "requiredPhrases": ["read-only", "human-approved"],
  "minimumFixtures": 2
}
```

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `requiredSections` | string array | ATX Markdown headings expected in `SKILL.md` (levels 1-6, with optional closing `#` characters). |
| `requiredPhrases` | string array | Case-insensitive boundary phrases that must appear as affirmative evidence in skill text. |
| `minimumFixtures` | non-negative integer | Minimum number of files expected in the fixture directory. Defaults to `1`. |

The contract should be stored with the repo so release checks are reproducible.

Contracts are validated before any acceptance checks run. The contract must be a JSON object;
`requiredSections` and `requiredPhrases`, when present, must contain only non-empty strings.
Empty or whitespace-only entries are invalid. In addition,
`minimumFixtures`, when present, must be a non-negative integer. Invalid contracts stop the CLI
with exit code `1` and an `Invalid contract: ...` error instead of producing a report.

Required-section matching accepts LF and CRLF line endings. Verification-command evidence must be
an executable command on its own line inside a closed backtick or tilde fence of at least three
matching characters. The closing fence must use the same character and be at least as long as the
opening fence. Empty, unclosed, mismatched, undersized, and prose-only fenced blocks do not count as
verification evidence.

Use `fixtures/strict-contract.json` when reviewers want an intentionally stricter fixture threshold.

## Affirmative boundary evidence

A required phrase passes only when a sentence or line states that boundary affirmatively. For
example, `Discovery runs in read-only mode` and `Publishing is human-approved before any remote
side effect` pass. A substring alone is insufficient: negated claims (`not read-only`, `no
human-approved step`), missing or absent claims, and placeholders such as `TODO`, `TBD`, or `to be
documented` fail. The finding identifies the phrase as missing affirmative evidence so authors can
replace a mention with an explicit operational boundary.
