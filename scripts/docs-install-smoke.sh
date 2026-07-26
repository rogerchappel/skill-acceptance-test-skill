#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
probe_dir="$(mktemp -d)"
trap 'rm -rf "$probe_dir"' EXIT

package_json="$(npm pack --json --pack-destination "$probe_dir" --prefix "$repo_root")"
package_file="$(node -e 'const fs = require("node:fs"); const data = JSON.parse(fs.readFileSync(0, "utf8")); process.stdout.write(data[0].filename)' <<<"$package_json")"

cd "$probe_dir"
npm init --yes >/dev/null
npm install --no-audit --no-fund "$probe_dir/$package_file" >/dev/null
npx --no-install skill-acceptance-test --help >/dev/null
npx --no-install skill-acceptance-test \
  --skill "$repo_root/fixtures/sample-skill/SKILL.md" \
  --contract "$repo_root/fixtures/contract.json" \
  --fixtures "$repo_root/fixtures/sample-skill/fixtures" \
  --format json |
  node -e 'const fs = require("node:fs"); const report = JSON.parse(fs.readFileSync(0, "utf8")); if (report.status !== "pass") process.exit(1)'
