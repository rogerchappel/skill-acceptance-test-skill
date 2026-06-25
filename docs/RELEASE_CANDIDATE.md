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
- Fixture checks count files only in the named fixture directory.
- The tool does not execute verification commands from skill text.
