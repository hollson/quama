#!/usr/bin/env node
// myanget — Codex SessionStart activation hook
//
// Runs on every session start:
//   1. Writes flag file at $CODEX_CONFIG_DIR/.myanget-active
//   2. Emits myanget ruleset as hidden SessionStart context

const fs = require('fs');
const path = require('path');
const { getDefaultMode, getConfigDir } = require('./myanget-config');
const { getMyangetInstructions } = require('./myanget-instructions');
const { clearMode, isCodex, setMode, writeHookOutput } = require('./myanget-runtime');

const configDir = getConfigDir();
const flagPath = path.join(configDir, '.myanget-active');

const mode = getDefaultMode();

// "off" mode — skip activation entirely, don't write flag or emit rules
if (mode === 'off') {
  clearMode();
  writeHookOutput('SessionStart', 'off', '');
  process.exit(0);
}

// 1. Write flag file
try {
  setMode(mode);
} catch (e) {
  // Silent fail -- flag is best-effort, don't block the hook
}

// 2. Emit the myanget ruleset, filtered to the active intensity level.
let output = getMyangetInstructions(mode);

try {
  writeHookOutput('SessionStart', mode, output);
} catch (e) {
  // Silent fail — stdout closed/EPIPE at hook exit must not surface as a hook failure
}