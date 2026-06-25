#!/usr/bin/env node
import { evaluateSkill, readJsonFile, readTextFile, renderMarkdown } from "./index.js";

function parseArgs(argv) {
  const args = { format: "markdown" };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--skill") args.skill = argv[++index];
    else if (token === "--contract") args.contract = argv[++index];
    else if (token === "--fixtures") args.fixtures = argv[++index];
    else if (token === "--format") args.format = argv[++index];
    else if (token === "--help" || token === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${token}`);
  }
  return args;
}

function usage() {
  return `Usage: skill-acceptance-test --skill SKILL.md --contract contract.json --fixtures fixtures/ [--format markdown|json]

Runs read-only acceptance checks for a reusable agent skill.
`;
}

export function run(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  if (args.help) return usage();
  if (!args.skill || !args.contract || !args.fixtures) {
    throw new Error("--skill, --contract, and --fixtures are required.");
  }
  if (!["markdown", "json"].includes(args.format)) {
    throw new Error("--format must be markdown or json.");
  }

  const result = evaluateSkill({
    skillText: readTextFile(args.skill),
    contract: readJsonFile(args.contract),
    fixtureDir: args.fixtures
  });
  if (result.status === "fail") process.exitCode = 2;
  return args.format === "json" ? `${JSON.stringify(result, null, 2)}\n` : renderMarkdown(result);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.stdout.write(run());
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
