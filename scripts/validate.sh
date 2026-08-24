#!/usr/bin/env bash
set -euo pipefail

ci_workflow=".github/workflows/ci.yml"
test -f package-lock.json
grep -Eq '^permissions:$' "$ci_workflow"
grep -Eq '^  contents: read$' "$ci_workflow"
grep -Eq 'uses: actions/checkout@v5' "$ci_workflow"
grep -Eq 'uses: actions/setup-node@v5' "$ci_workflow"
grep -Eq '^          cache: npm$' "$ci_workflow"
grep -Eq '^      - run: npm ci$' "$ci_workflow"
if grep -Eq '^      - run: npm install$' "$ci_workflow"; then
  echo "CI must use npm ci, not npm install" >&2
  exit 1
fi

npm run check
npm test
npm run smoke >/tmp/skill-acceptance-smoke.md
grep -q "Status: pass" /tmp/skill-acceptance-smoke.md
grep -q "fixtures:minimum" /tmp/skill-acceptance-smoke.md
