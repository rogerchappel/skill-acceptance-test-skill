# skill-acceptance-test-skill

Local-first agent skill and CLI for checking whether a reusable `SKILL.md` has enough structure, fixtures, and verification evidence to publish.

## Quickstart

```bash
npm test
npm run smoke
node src/cli.js --skill fixtures/sample-skill/SKILL.md --contract fixtures/contract.json --fixtures fixtures/sample-skill/fixtures --format json
```

## What It Checks

- Required sections are present in the skill file.
- Side-effect and approval boundaries are described.
- The fixture directory contains enough examples for the contract.
- Verification commands are documented as evidence.

## Safety Notes

This tool reads files and directories only. It does not execute commands found in skill docs, because command execution should remain an explicit caller decision.
