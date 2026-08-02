import assert from "node:assert/strict";
import test from "node:test";
import { evaluateSkill, readJsonFile, readTextFile, renderMarkdown } from "../src/index.js";
import { run } from "../src/cli.js";

const contract = readJsonFile("fixtures/contract.json");

test("README installs from a checkout instead of the unpublished registry package", () => {
  const readme = readTextFile("README.md");

  assert.doesNotMatch(readme, /npm install skill-acceptance-test-skill/);
  assert.match(readme, /git clone https:\/\/github\.com\/rogerchappel\/skill-acceptance-test-skill\.git/);
  assert.match(readme, /npx --no-install skill-acceptance-test --help/);
});

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

test("strict contracts can raise fixture thresholds", () => {
  const result = evaluateSkill({
    skillText: readTextFile("fixtures/sample-skill/SKILL.md"),
    contract: readJsonFile("fixtures/strict-contract.json"),
    fixtureDir: "fixtures/sample-skill/fixtures"
  });

  assert.equal(result.status, "fail");
  assert.match(result.findings.find((finding) => finding.id === "fixtures:minimum").message, /minimum is 3/);
});

test("rejects contract list fields that are not arrays of strings", () => {
  for (const invalidContract of [
    { requiredSections: "When To Use" },
    { requiredSections: ["When To Use", 42] },
    { requiredPhrases: { phrase: "read-only" } },
    { requiredPhrases: ["read-only", null] }
  ]) {
    assert.throws(
      () => evaluateSkill({ skillText: "", contract: invalidContract }),
      /Invalid contract: (requiredSections|requiredPhrases) must be an array of strings\./
    );
  }
});

test("rejects invalid minimumFixtures values without numeric coercion", () => {
  for (const minimumFixtures of ["2", -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.throws(
      () => evaluateSkill({ skillText: "", contract: { minimumFixtures } }),
      /Invalid contract: minimumFixtures must be a non-negative integer\./
    );
  }
});

test("cli reports malformed contracts with an actionable error", () => {
  assert.throws(
    () =>
      run([
        "--skill",
        "fixtures/sample-skill/SKILL.md",
        "--contract",
        "fixtures/invalid-contract.json",
        "--fixtures",
        "fixtures/sample-skill/fixtures"
      ]),
    /Invalid contract: requiredSections must be an array of strings\./
  );
});

test("escapes markdown table delimiters and newlines without changing JSON findings", () => {
  const result = {
    status: "fail",
    summary: { pass: 0, fail: 1 },
    fixtureFiles: [],
    findings: [
      {
        id: "phrase:a|b",
        status: "fail",
        message: "Missing a | b\ncheck the contract"
      }
    ]
  };

  assert.match(
    renderMarkdown(result),
    /\| phrase:a\\\|b \| fail \| Missing a \\\| b<br>check the contract \|/
  );
  assert.equal(result.findings[0].id, "phrase:a|b");
  assert.equal(result.findings[0].message, "Missing a | b\ncheck the contract");
  assert.equal(JSON.parse(JSON.stringify(result)).findings[0].message, "Missing a | b\ncheck the contract");
});
