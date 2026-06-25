#!/usr/bin/env bash
set -euo pipefail

npm run check
npm test
npm run smoke >/tmp/skill-acceptance-smoke.md
grep -q "Status: pass" /tmp/skill-acceptance-smoke.md
grep -q "fixtures:minimum" /tmp/skill-acceptance-smoke.md
