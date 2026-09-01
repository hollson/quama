#!/usr/bin/env node
// myanget — shared runtime utilities for Claude/Codex/Qoder hooks

const fs = require('fs');
const path = require('path');
const { getConfigDir, getClaudeDir, normalizeMode } = require('./myanget-config');

const isCodex = !!process.env.CODEX_SESSION_ID;
const isCopilot = !!process.env.COPILOT_SESSION_ID;
const isQoder = !!process.env.QODER_SESSION_ID;

function getFlagPath() {
  if (isCodex) {
    return path.join(getConfigDir(), '.myanget-active');
  }
  if (isQoder) {
    return path.join(getConfigDir(), '.myanget-active');
  }
  return path.join(getClaudeDir(), '.myanget-active');
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
  if (isCodex || isCopilot) {
    // Codex/Copilot: write to stdout as JSON
    console.log(JSON.stringify({ hook: hookName, mode, output }));
  } else if (isQoder) {
    // Qoder: write to stdout as JSON
    console.log(JSON.stringify({ hook: hookName, mode, output }));
  } else {
    // Claude Code: write to stdout
    process.stdout.write(output);
  }
}

module.exports = {
  isCodex,
  isCopilot,
  isQoder,
  readMode,
  setMode,
  clearMode,
  writeHookOutput,
};