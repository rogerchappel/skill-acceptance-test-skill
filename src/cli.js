#!/usr/bin/env node
import { realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { evaluateSkill, readJsonFile, readTextFile, renderMarkdown } from "./index.js";

function parseArgs(argv) {
  const args = { format: "markdown" };
  const takeValue = (option, index) => {
    const value = argv[index + 1];
    if (value === undefined || value.startsWith("-")) {
      throw new Error(`${option} requires a value.`);
    }
    return value;
  };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--skill") args.skill = takeValue(token, index++);
    else if (token === "--contract") args.contract = takeValue(token, index++);
    else if (token === "--fixtures") args.fixtures = takeValue(token, index++);
    else if (token === "--format") args.format = takeValue(token, index++);
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

const invokedAsExecutable =
  process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href;

if (invokedAsExecutable) {
  try {
    process.stdout.write(run());
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
