#!/usr/bin/env node
// Shared MyAnget instruction builder for Claude hooks and Pi extension.

const fs = require('fs');
const path = require('path');
const { DEFAULT_MODE, normalizeMode, normalizePersistedMode } = require('./myanget-config');

const INDEPENDENT_MODES = new Set(['review']);
const SKILL_PATH = path.join(__dirname, '..', 'skills', 'project-status', 'SKILL.md');

function filterSkillBodyForMode(body, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const withoutFrontmatter = String(body || '').replace(/^---[\s\S]*?---\s*/, '');

  // Only the intensity table rows and worked examples are mode-specific, and
  // both are keyed by a mode name (lite/full/ultra). A bullet whose label is
  // not a mode — e.g. "No unrequested abstractions: ..." — is a normal rule
  // and must be kept verbatim.
  return withoutFrontmatter
    .split(/\r?\n/)
    .filter((line) => {
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      // Require a quoted value: every worked example is `- lite: "..."`. Without
      // this, an ordinary rule bullet that happens to start with a mode word
      // (e.g. "- Full: ...") is silently dropped in every other mode — it looks
      // like a worked example but is really prose meant to survive verbatim.
      const exampleLabel = line.match(/^-\s*([^:]+):\s*"/);
      if (exampleLabel) {
        const labelMode = normalizeMode(exampleLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      return true;
    })
    .join('\n');
}

function getFallbackInstructions(mode) {
  return 'MYANGET MODE ACTIVE — level: ' + mode + '\n\n' +
    'You are a project management assistant for critical software projects.\n\n' +
    '## Core Principles\n\n' +
    '- Quality First: Never compromise on code quality for speed.\n' +
    '- Documentation: Code is not documentation. Key decisions must be documented.\n' +
    '- Design Consistency: Follow existing design patterns and architecture.\n' +
    '- Active Management: Foresee and solve problems before they happen.\n' +
    '- Clear Communication: Be concise, direct, and clear.\n\n' +
    '## Management Areas\n\n' +
    '1. **Code Quality**: Ensure code quality, security, performance, and maintainability.\n' +
    '2. **Documentation**: Create and maintain comprehensive documentation.\n' +
    '3. **Design**: Manage design decisions and ensure consistency.\n' +
    '4. **Dependencies**: Manage dependencies for security and compliance.\n' +
    '5. **Testing**: Ensure comprehensive test coverage and quality.\n\n' +
    '## Rules\n\n' +
    '- Document all important decisions and changes.\n' +
    '- Review code for quality, security, and performance.\n' +
    '- Maintain design consistency across the codebase.\n' +
    '- Keep dependencies secure and up-to-date.\n' +
    '- Ensure comprehensive test coverage.\n\n' +
    '## Output\n\n' +
    'Provide clear, actionable insights. Focus on what matters most for project success.\n\n' +
    '## When to Be Thorough\n\n' +
    'Never skip: security reviews, documentation of critical decisions, design consistency checks.\n' +
    'Always consider: impact on other components, team understanding, long-term maintainability.';
}

function getMyangetInstructions(mode) {
  const configuredMode = normalizePersistedMode(mode) || DEFAULT_MODE;

  if (INDEPENDENT_MODES.has(configuredMode)) {
    return 'MYANGET MODE ACTIVE — level: ' + configuredMode + '. Behavior defined by /myanget-' + configuredMode + ' skill.';
  }

  const effectiveMode = normalizeMode(configuredMode) || DEFAULT_MODE;

  try {
    return 'MYANGET MODE ACTIVE — level: ' + effectiveMode + '\n\n' +
      filterSkillBodyForMode(fs.readFileSync(SKILL_PATH, 'utf8'), effectiveMode);
  } catch (e) {
    return getFallbackInstructions(effectiveMode);
  }
}

module.exports = {
  filterSkillBodyForMode,
  getFallbackInstructions,
  getMyangetInstructions,
};