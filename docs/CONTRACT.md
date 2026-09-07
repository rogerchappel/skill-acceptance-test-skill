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
| `minimumFixtures` | non-negative integer | Minimum number of regular files expected recursively beneath the fixture directory. Defaults to `1`. |

The contract should be stored with the repo so release checks are reproducible.

Contracts are validated before any acceptance checks run. The contract must be a JSON object;
`requiredSections` and `requiredPhrases`, when present, must contain only non-empty strings.
Empty or whitespace-only entries are invalid. In addition,
`minimumFixtures`, when present, must be a non-negative integer. Invalid contracts stop the CLI
with exit code `1` and an `Invalid contract: ...` error instead of producing a report.
These three fields are the complete contract schema. Unknown fields are rejected, so a typo such
as `minimumFixture` cannot silently fall back to the default fixture threshold.

Required-section matching accepts LF and CRLF line endings. Verification-command evidence must be
an executable command on its own line inside a closed backtick or tilde fence of at least three
matching characters. The closing fence must use the same character and be at least as long as the
opening fence. Empty, unclosed, mismatched, undersized, and prose-only fenced blocks do not count as
verification evidence.

Use `fixtures/strict-contract.json` when reviewers want an intentionally stricter fixture threshold.
Subdirectories may organize fixtures by scenario. Directory entries themselves do not count, and
reported fixture paths are sorted relative to the declared fixture directory itself. For example,
`<fixtureDir>/happy/input.json` is reported as `happy/input.json`, regardless of the process working
directory, so repeated runs are deterministic.
The fixture path may be absent, which represents an empty fixture set, but an existing path must be
a directory. Passing a regular file stops the CLI with exit code `1` and an `Invalid fixture
directory: ...` diagnostic.

## Affirmative boundary evidence

A required phrase passes only when a sentence or line states that boundary affirmatively. For
example, `Discovery runs in read-only mode` and `Publishing is human-approved before any remote
side effect` pass. Matching is case-insensitive and accepts punctuation around the complete phrase,
including a hyphenated phrase such as `(READ-ONLY)`. Letters or numbers immediately before or after
the phrase make it part of a larger token, so `preread-only` and `read-onlyish` do not pass. Negated
claims (`not read-only`, `no human-approved step`), missing or absent claims, and placeholders such
as `TODO`, `TBD`, or `to be documented` also fail. The finding identifies the phrase as missing
affirmative evidence so authors can replace a mention with an explicit operational boundary.
