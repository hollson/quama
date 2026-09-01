// quama — OpenCode plugin.
//
// Injects the quama ruleset into every chat's system prompt at the active
// intensity, persists /quama mode switches, and registers slash commands so
// they work when the package is installed from npm. Reuses the shared
// instruction builder so Claude Code, Codex, pi, and OpenCode all read one
// source of truth.
//
// OpenCode loads this as a server plugin — add it to your opencode.json:
//   { "plugin": ["@hollson/quama"] }

import { createRequire } from 'module';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The shared instruction builder is CommonJS; bridge to it from this ES module.
const require = createRequire(import.meta.url);
const { getQuamaInstructions } = require('../../hooks/quama-instructions');
const { getDefaultMode, normalizePersistedMode } = require('../../hooks/quama-config');
const { parseCommandFile } = require('./quama-frontmatter.cjs');

// OpenCode has no flag-file convention of its own; keep mode beside its config.
const statePath = path.join(
  process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config'),
  'opencode',
  '.quama-active',
);

function readMode() {
  try {
    return normalizePersistedMode(fs.readFileSync(statePath, 'utf8').trim()) || getDefaultMode();
  } catch (e) {
    return getDefaultMode();
  }
}

function writeMode(mode) {
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  fs.writeFileSync(statePath, mode);
}

// Load all rule files from .quama/rules/ directory
function loadRuleFiles() {
  const rulesDir = path.resolve(__dirname, '../../.quama/rules');
  const rules = [];
  
  try {
    if (fs.existsSync(rulesDir)) {
      const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.md') && f !== 'index.md');
      
      for (const file of files) {
        const filePath = path.join(rulesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        rules.push(content);
      }
    }
  } catch (e) {
    // Silent fail - rules are optional
  }
  
  return rules.join('\n\n---\n\n');
}

export default async ({ client } = {}) => {
  const log = (level, message) => {
    try { client && client.app && client.app.log({ body: { service: 'quama', level, message } }); } catch (e) {}
  };

  const quamaSkillsDir = path.resolve(__dirname, '../../skills');

  return {
    // Register slash commands + skills directory.
    config: async (config) => {
      if (!config.command) config.command = {};
      const commandDir = path.join(__dirname, '..', 'command');
      try {
        for (const file of fs.readdirSync(commandDir).filter((f) => f.endsWith('.md'))) {
          const name = path.basename(file, '.md');
          const parsed = parseCommandFile(path.join(commandDir, file));
          if (parsed) config.command[name] = parsed;
        }
      } catch (e) {}

      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(quamaSkillsDir)) {
        config.skills.paths.push(quamaSkillsDir);
      }
    },

    // Append the ruleset to the system prompt every turn.
    'experimental.chat.system.transform': async (_input, output) => {
      const mode = readMode();
      if (mode === 'off') return;
      
      // Load base instructions
      const instructions = getQuamaInstructions(mode);
      
      // Load rule files
      const ruleFiles = loadRuleFiles();
      
      // Combine instructions and rules
      let fullContent = instructions;
      if (ruleFiles) {
        fullContent += '\n\n---\n\n# 团队规范\n\n' + ruleFiles;
      }
      
      if (output.system.length > 0) {
        output.system[output.system.length - 1] += '\n\n' + fullContent;
      } else {
        output.system.push(fullContent);
      }
    },

    // Persist `/quama <level>` so the next turn's injection follows it.
    // quama: mode applies from the next message, not the current one — the
    // transform reads the flag the command writes. Good enough; switch to a
    // synchronous store if same-turn switching ever matters.
    'command.execute.before': async (input) => {
      if (!input || input.command !== 'quama') return;
      // `off` is persisted like any mode; the transform reads it and stays silent.
      const args = String(input.arguments || '').trim();
      const mode = args ? normalizePersistedMode(args) : getDefaultMode();
      if (!mode) return;
      writeMode(mode);
      log('info', 'quama ' + mode);
    },
  };
};
