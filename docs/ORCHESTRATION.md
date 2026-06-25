# Orchestration

1. Agent identifies the skill package under review.
2. Agent selects or writes a local contract JSON.
3. Agent runs this CLI against `SKILL.md` and local fixtures.
4. Agent attaches the Markdown report to the release-candidate PR.
5. Human reviewer decides whether to publish, install, or request changes.

The tool is read-only and safe for CI because it does not execute commands from `SKILL.md`.
