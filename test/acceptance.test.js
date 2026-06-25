import assert from "node:assert/strict";
import test from "node:test";
import { evaluateSkill, readJsonFile, readTextFile, renderMarkdown } from "../src/index.js";
import { run } from "../src/cli.js";

const contract = readJsonFile("fixtures/contract.json");

test("passes a skill with required sections and fixtures", () => {
  const result = evaluateSkill({
    skillText: readTextFile("fixtures/sample-skill/SKILL.md"),
    contract,
    fixtureDir: "fixtures/sample-skill/fixtures"
  });

  assert.equal(result.status, "pass");
  assert.equal(result.summary.fail, 0);
  assert.equal(result.fixtureFiles.length, 2);
});

test("fails a skill that omits required release evidence", () => {
  const result = evaluateSkill({
    skillText: readTextFile("fixtures/broken-skill/SKILL.md"),
    contract,
    fixtureDir: "fixtures/broken-skill/fixtures"
  });

  assert.equal(result.status, "fail");
  assert.ok(result.summary.fail > 0);
});

test("renders markdown acceptance evidence", () => {
  const result = evaluateSkill({
    skillText: readTextFile("fixtures/sample-skill/SKILL.md"),
    contract,
    fixtureDir: "fixtures/sample-skill/fixtures"
  });

  assert.match(renderMarkdown(result), /Skill Acceptance Report/);
  assert.match(renderMarkdown(result), /section:when-to-use/);
});

test("cli returns json output", () => {
  const output = run([
    "--skill",
    "fixtures/sample-skill/SKILL.md",
    "--contract",
    "fixtures/contract.json",
    "--fixtures",
    "fixtures/sample-skill/fixtures",
    "--format",
    "json"
  ]);

  assert.equal(JSON.parse(output).status, "pass");
});
