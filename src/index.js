import fs from "node:fs";
import path from "node:path";

export function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function readTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

export function evaluateSkill({ skillText, contract, fixtureDir }) {
  const findings = [];
  const requiredSections = contract.requiredSections ?? [];

  for (const section of requiredSections) {
    const present = hasHeading(skillText, section);
    findings.push({
      id: `section:${slug(section)}`,
      status: present ? "pass" : "fail",
      message: present ? `Section present: ${section}` : `Missing required section: ${section}`
    });
  }

  for (const check of contract.requiredPhrases ?? []) {
    const present = skillText.toLowerCase().includes(check.toLowerCase());
    findings.push({
      id: `phrase:${slug(check)}`,
      status: present ? "pass" : "fail",
      message: present ? `Boundary phrase found: ${check}` : `Missing boundary phrase: ${check}`
    });
  }

  const fixtureFiles = listFixtureFiles(fixtureDir);
  const minimumFixtures = contract.minimumFixtures ?? 1;
  findings.push({
    id: "fixtures:minimum",
    status: fixtureFiles.length >= minimumFixtures ? "pass" : "fail",
    message: `${fixtureFiles.length} fixture file(s) found; minimum is ${minimumFixtures}.`
  });

  const commandEvidence = extractCodeBlocks(skillText).filter((block) =>
    /npm test|npm run check|npm run smoke|validate\.sh/.test(block)
  );
  findings.push({
    id: "evidence:verification-commands",
    status: commandEvidence.length > 0 ? "pass" : "fail",
    message: commandEvidence.length > 0 ? "Verification command evidence found." : "No verification command evidence found."
  });

  const summary = {
    pass: findings.filter((finding) => finding.status === "pass").length,
    fail: findings.filter((finding) => finding.status === "fail").length
  };

  return {
    status: summary.fail > 0 ? "fail" : "pass",
    summary,
    fixtureFiles,
    findings
  };
}

export function renderMarkdown(result) {
  const lines = [
    "# Skill Acceptance Report",
    "",
    `Status: ${result.status}`,
    "",
    "| Check | Status | Message |",
    "| --- | --- | --- |"
  ];

  for (const finding of result.findings) {
    lines.push(`| ${finding.id} | ${finding.status} | ${finding.message} |`);
  }

  lines.push("", `Summary: ${result.summary.pass} passed, ${result.summary.fail} failed.`);
  return `${lines.join("\n")}\n`;
}

function hasHeading(text, heading) {
  const pattern = new RegExp(`^#{1,3}\\s+${escapeRegExp(heading)}\\s*$`, "im");
  return pattern.test(text);
}

function extractCodeBlocks(text) {
  return [...text.matchAll(/```[\w-]*\n([\s\S]*?)```/g)].map((match) => match[1]);
}

function listFixtureFiles(fixtureDir) {
  if (!fixtureDir || !fs.existsSync(fixtureDir)) {
    return [];
  }
  return fs
    .readdirSync(fixtureDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(fixtureDir, entry.name));
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
