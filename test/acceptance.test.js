import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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

test("accepts supported verification commands in executable fenced blocks", () => {
  for (const command of ["npm test", "npm run check", "npm run smoke", "bash scripts/validate.sh"]) {
    const result = evaluateSkill({
      skillText: `# Verification\n\n\`\`\`bash\n${command}\n\`\`\``,
      contract: { minimumFixtures: 0 }
    });

    assert.equal(result.findings.find((finding) => finding.id === "evidence:verification-commands").status, "pass");
  }
});

test("rejects prose and comments that only mention verification commands", () => {
  for (const block of [
    "Documentation should mention npm test, but there is no command here.",
    "# npm run check",
    "// npm run smoke",
    "echo 'Run validate.sh before release'"
  ]) {
    const result = evaluateSkill({
      skillText: `# Verification\n\n\`\`\`text\n${block}\n\`\`\``,
      contract: { minimumFixtures: 0 }
    });

    assert.equal(result.findings.find((finding) => finding.id === "evidence:verification-commands").status, "fail");
  }
});

test("requires affirmative evidence for boundary phrases", () => {
  for (const skillText of [
    "This workflow is not read-only.",
    "There is no human-approved step.",
    "The read-only boundary is missing.",
    "TODO: document the human-approved boundary.",
    "The human-approved boundary is to be defined."
  ]) {
    const phrase = skillText.includes("human-approved") ? "human-approved" : "read-only";
    const result = evaluateSkill({ skillText, contract: { requiredPhrases: [phrase], minimumFixtures: 0 } });
    const finding = result.findings.find((item) => item.id === `phrase:${phrase}`);

    assert.equal(finding.status, "fail", skillText);
    assert.equal(finding.message, `Missing affirmative boundary evidence: ${phrase}`);
  }
});

test("accepts representative affirmative boundary prose", () => {
  for (const [phrase, skillText] of [
    ["read-only", "Discovery runs in read-only mode and does not modify the repository."],
    ["human-approved", "Publishing is human-approved before any remote side effect occurs."]
  ]) {
    const result = evaluateSkill({ skillText, contract: { requiredPhrases: [phrase], minimumFixtures: 0 } });
    const finding = result.findings.find((item) => item.id === `phrase:${phrase}`);

    assert.equal(finding.status, "pass", skillText);
    assert.equal(finding.message, `Affirmative boundary evidence found: ${phrase}`);
  }
});

test("cli JSON and Markdown reports rejected boundary claims deterministically", () => {
  const previousExitCode = process.exitCode;
  const jsonOutput = run([
    "--skill", "fixtures/negated-boundaries-skill/SKILL.md",
    "--contract", "fixtures/contract.json",
    "--fixtures", "fixtures/sample-skill/fixtures",
    "--format", "json"
  ]);
  process.exitCode = previousExitCode;
  const result = JSON.parse(jsonOutput);
  const phraseFinding = result.findings.find((finding) => finding.id === "phrase:read-only");

  assert.equal(phraseFinding.status, "fail");
  assert.equal(phraseFinding.message, "Missing affirmative boundary evidence: read-only");
  assert.equal(result.findings.find((finding) => finding.id === "phrase:human-approved").status, "fail");
  assert.match(renderMarkdown(result), /\| phrase:read-only \| fail \| Missing affirmative boundary evidence: read-only \|/);
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

  const result = JSON.parse(output);
  assert.equal(result.status, "pass");
  assert.equal(result.findings.find((finding) => finding.id === "phrase:read-only").status, "pass");
  assert.equal(result.findings.find((finding) => finding.id === "phrase:human-approved").status, "pass");
});

test("cli names options whose values are missing", () => {
  for (const option of ["--skill", "--contract", "--fixtures", "--format"]) {
    assert.throws(() => run([option]), new RegExp(`${option} requires a value\\.`));
    assert.throws(() => run([option, "--help"]), new RegExp(`${option} requires a value\\.`));
  }
});

test("cli preserves valid help and markdown behavior", () => {
  assert.match(run(["--help"]), /^Usage: skill-acceptance-test/);
  assert.match(
    run([
      "--skill",
      "fixtures/sample-skill/SKILL.md",
      "--contract",
      "fixtures/contract.json",
      "--fixtures",
      "fixtures/sample-skill/fixtures",
      "--format",
      "markdown"
    ]),
    /^# Skill Acceptance Report/
  );
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
      /Invalid contract: (requiredSections|requiredPhrases) must be an array of non-empty strings\./
    );
  }
});

test("rejects empty and whitespace-only contract list entries", () => {
  for (const invalidContract of [
    { requiredSections: [""] },
    { requiredSections: ["When To Use", " \t"] },
    { requiredPhrases: [""] },
    { requiredPhrases: ["read-only", "\n"] }
  ]) {
    assert.throws(
      () => evaluateSkill({ skillText: "", contract: invalidContract }),
      /Invalid contract: (requiredSections|requiredPhrases) must be an array of non-empty strings\./
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
    /Invalid contract: requiredSections must be an array of non-empty strings\./
  );
});

test("cli exits with an actionable error for blank contract entries", () => {
  const result = spawnSync(
    process.execPath,
    [
      "src/cli.js",
      "--skill", "fixtures/sample-skill/SKILL.md",
      "--contract", "fixtures/blank-contract.json",
      "--fixtures", "fixtures/sample-skill/fixtures",
      "--format", "json"
    ],
    { encoding: "utf8" }
  );

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(
    result.stderr,
    "Invalid contract: requiredPhrases must be an array of non-empty strings.\n"
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
