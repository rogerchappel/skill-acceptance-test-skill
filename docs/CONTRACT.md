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
| `requiredSections` | string array | Markdown headings expected in `SKILL.md`. |
| `requiredPhrases` | string array | Case-insensitive boundary phrases expected in skill text. |
| `minimumFixtures` | number | Minimum number of files expected in the fixture directory. |

The contract should be stored with the repo so release checks are reproducible.

Use `fixtures/strict-contract.json` when reviewers want an intentionally stricter fixture threshold.
