#!/usr/bin/env node
// quama — shared runtime utilities for Claude/Codex/Qoder hooks

const fs = require('fs');
const path = require('path');
const { getConfigDir, normalizeMode } = require('./quama-config');

const isCodex = !!process.env.CODEX_SESSION_ID;
const isCopilot = !!process.env.COPILOT_SESSION_ID;
const isQoder = !!process.env.QODER_SESSION_ID;

function getFlagPath() {
  return path.join(getConfigDir(), '.quama-active');
}

function getClaudeDir() {
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(require('os').homedir(), 'AppData', 'Roaming'), 'Claude');
  }
  return path.join(require('os').homedir(), '.claude');
}

function readMode() {
  try {
    const flag = fs.readFileSync(getFlagPath(), 'utf8').trim();
    return normalizeMode(flag) || null;
  } catch (e) {
    return null;
  }
}

function setMode(mode) {
  const normalized = normalizeMode(mode);
  if (!normalized) return;
  fs.mkdirSync(path.dirname(getFlagPath()), { recursive: true });
  fs.writeFileSync(getFlagPath(), normalized);
}

function clearMode() {
  try {
    fs.unlinkSync(getFlagPath());
  } catch (e) {
    // Ignore if file doesn't exist
  }
}

function writeHookOutput(hookName, mode, output) {
  if (isCodex || isCopilot || isQoder) {
    console.log(JSON.stringify({ hook: hookName, mode, output }));
  } else {
    process.stdout.write(output);
  }
}

// 检测 ponytail 是否已安装
function detectPonytail() {
  // 检查环境变量
  if (process.env.PONYTAIL_INSTALLED === '1') return true;
  
  // 检查常见安装路径
  const possiblePaths = [
    // npm 全局安装
    path.join(getConfigDir(), '..', 'ponytail'),
    // 项目内 node_modules
    path.join(process.cwd(), 'node_modules', 'ponytail'),
    // .ponytail 目录
    path.join(process.cwd(), '.ponytail'),
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return true;
  }
  
  // 检查 ponytail 配置目录
  const ponytailConfigDir = path.join(
    process.env.XDG_CONFIG_HOME || path.join(require('os').homedir(), '.config'),
    'ponytail'
  );
  if (fs.existsSync(ponytailConfigDir)) return true;
  
  return false;
}

// 生成 ponytail 安装提示
function getPonytailInstallHint() {
  return [
    '',
    '🐎 [Quama] 检测到 ponytail 未安装。',
    '',
    'Ponytail 是 Quama 的底层运行时，提供模式切换、状态持久化等核心能力。',
    '安装方式：',
    '  npm install -g ponytail',
    '  或访问 https://github.com/DietrichGebert/ponytail',
    '',
    '安装后 Quama 将自动启用完整功能。',
    ''
  ].join('\n');
}

module.exports = {
  isCodex,
  isCopilot,
  isQoder,
  readMode,
  setMode,
  clearMode,
  writeHookOutput,
  detectPonytail,
  getPonytailInstallHint,
  getClaudeDir,
};
