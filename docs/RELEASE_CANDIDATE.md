# Release Candidate Notes

## Classification

ship

## Verification

```bash
npm test
npm run check
npm run smoke
bash scripts/validate.sh
```

## Known Limits

- Markdown heading detection is intentionally simple.
- Fixture checks recursively count regular files beneath the named fixture directory.
- The tool does not execute verification commands from skill text.

## PR Checklist

- [x] Public repo created.
- [x] Release-candidate branch pushed.
- [x] Fixture smoke output reviewed.
- [x] Branch protection attempted after PR creation.
