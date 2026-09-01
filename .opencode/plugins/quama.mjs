// quama — OpenCode plugin.
//
// 独立运行时，不依赖 ponytail。
// 检测 ponytail 安装状态，未安装时提示用户。
// 规则注入时添加 🐎 标记，便于验证 quama 是否生效。
//
// OpenCode 加载方式 — 在 opencode.json 中添加：
//   { "plugin": ["@hollson/quama"] }

import { createRequire } from 'module';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// CommonJS 桥接
const require = createRequire(import.meta.url);
const { getQuamaInstructions, QUAMA_MARKER } = require('../../hooks/quama-instructions');
const { getDefaultMode, normalizePersistedMode } = require('../../hooks/quama-config');
const { detectPonytail, getPonytailInstallHint } = require('../../hooks/quama-runtime');
const { parseCommandFile } = require('./quama-frontmatter.cjs');

// OpenCode 状态文件
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

// 加载 .quama/rules/ 目录下的规则文件
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
    // 规则文件可选
  }
  
  return rules.join('\n\n---\n\n');
}

export default async ({ client } = {}) => {
  const log = (level, message) => {
    try { client && client.app && client.app.log({ body: { service: 'quama', level, message } }); } catch (e) {}
  };

  const quamaSkillsDir = path.resolve(__dirname, '../../skills');

  return {
    // 注册 slash commands + skills 目录
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

    // 每轮对话注入规则到系统提示
    'experimental.chat.system.transform': async (_input, output) => {
      const mode = readMode();
      if (mode === 'off') return;
      
      // 加载基础指令（包含 🐎 标记）
      const instructions = getQuamaInstructions(mode);
      
      // 加载规则文件
      const ruleFiles = loadRuleFiles();
      
      // 组合指令和规则
      let fullContent = instructions;
      if (ruleFiles) {
        fullContent += '\n\n---\n\n' + QUAMA_MARKER + ' — 团队规范\n\n' + ruleFiles;
      }
      
      if (output.system.length > 0) {
        output.system[output.system.length - 1] += '\n\n' + fullContent;
      } else {
        output.system.push(fullContent);
      }
    },

    // 持久化 `/quama <level>` 命令
    'command.execute.before': async (input) => {
      if (!input || input.command !== 'quama') return;
      const args = String(input.arguments || '').trim();
      const mode = args ? normalizePersistedMode(args) : getDefaultMode();
      if (!mode) return;
      writeMode(mode);
      log('info', 'quama ' + mode);
    },
  };
};
