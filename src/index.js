import fs from "node:fs";
import path from "node:path";

export function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function readTextFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

export function evaluateSkill({ skillText, contract, fixtureDir }) {
  validateContract(contract);
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
    const present = hasAffirmativeBoundaryEvidence(skillText, check);
    findings.push({
      id: `phrase:${slug(check)}`,
      status: present ? "pass" : "fail",
      message: present
        ? `Affirmative boundary evidence found: ${check}`
        : `Missing affirmative boundary evidence: ${check}`
    });
  }

  const fixtureFiles = listFixtureFiles(fixtureDir);
  const minimumFixtures = contract.minimumFixtures ?? 1;
  findings.push({
    id: "fixtures:minimum",
    status: fixtureFiles.length >= minimumFixtures ? "pass" : "fail",
    message: `${fixtureFiles.length} fixture file(s) found; minimum is ${minimumFixtures}.`
  });

  const commandEvidence = extractCodeBlocks(skillText).filter(hasVerificationCommand);
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
    lines.push(
      `| ${escapeMarkdownCell(finding.id)} | ${escapeMarkdownCell(finding.status)} | ${escapeMarkdownCell(finding.message)} |`
    );
  }

  lines.push("", `Summary: ${result.summary.pass} passed, ${result.summary.fail} failed.`);
  return `${lines.join("\n")}\n`;
}

function validateContract(contract) {
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    throw new TypeError("Invalid contract: expected a JSON object.");
  }

  for (const field of ["requiredSections", "requiredPhrases"]) {
    const value = contract[field];
    if (value !== undefined && (!Array.isArray(value) || value.some((item) => typeof item !== "string"))) {
      throw new TypeError(`Invalid contract: ${field} must be an array of strings.`);
    }
  }

  if (
    contract.minimumFixtures !== undefined &&
    (!Number.isInteger(contract.minimumFixtures) || contract.minimumFixtures < 0)
  ) {
    throw new TypeError("Invalid contract: minimumFixtures must be a non-negative integer.");
  }
}

function escapeMarkdownCell(value) {
  return String(value).replace(/\|/g, "\\|").replace(/\r?\n|\r/g, "<br>");
}

function hasHeading(text, heading) {
  const pattern = new RegExp(`^#{1,3}\\s+${escapeRegExp(heading)}\\s*$`, "im");
  return pattern.test(text);
}

function extractCodeBlocks(text) {
  return [...text.matchAll(/```[\w-]*\n([\s\S]*?)```/g)].map((match) => match[1]);
}

function hasVerificationCommand(block) {
  return block.split("\n").some((line) =>
    /^\s*(?:\$\s*)?(?:npm test|npm run (?:check|smoke)|bash scripts\/validate\.sh)\s*$/.test(line)
  );
}

function hasAffirmativeBoundaryEvidence(text, phrase) {
  const phrasePattern = escapeRegExp(phrase);
  const candidates = text
    .split(/\r?\n|(?<=[.!?])\s+/)
    .filter((candidate) => new RegExp(phrasePattern, "i").test(candidate));

  return candidates.some((candidate) => {
    const normalized = candidate
      .replace(/^\s{0,3}(?:#{1,6}|[-*+]|\d+[.)])\s+/, "")
      .trim();
    const placeholder = /^(?:todo|tbd|fixme|placeholder)\b|\b(?:todo|tbd|fixme|placeholder|goes here|to be (?:added|documented|defined))\b/i;
    const negatedBefore = new RegExp(
      `\\b(?:no|not|never|without|lacks?|missing|omit(?:s|ted)?|does not|do not|isn't|is not|cannot|can't|won't|will not)\\b[^.!?\\n]{0,80}\\b${phrasePattern}\\b`,
      "i"
    );
    const negatedAfter = new RegExp(
      `\\b${phrasePattern}\\b[^.!?\\n]{0,60}\\b(?:is (?:missing|absent|unsupported|unavailable)|isn't (?:present|supported|available)|is not (?:present|supported|available))\\b`,
      "i"
    );

    return !placeholder.test(normalized) && !negatedBefore.test(normalized) && !negatedAfter.test(normalized);
  });
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
