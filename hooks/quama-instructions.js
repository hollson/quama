#!/usr/bin/env node
// quama — 规则注入引擎
// 独立运行时，不依赖 ponytail 的任何模块

const fs = require('fs');
const path = require('path');
const { DEFAULT_MODE, normalizeMode, normalizePersistedMode } = require('./quama-config');
const { detectPonytail, getPonytailInstallHint } = require('./quama-runtime');

const INDEPENDENT_MODES = new Set(['review']);

// SKILL.md 路径：优先 quama 自己的，其次 ponytail 的
const QUAMA_SKILL_PATH = path.join(__dirname, '..', 'skills', 'quama', 'SKILL.md');
const PONYTAIL_SKILL_PATH = path.join(__dirname, '..', 'skills', 'ponytail', 'SKILL.md');

// 🐎 quama 标记前缀
const QUAMA_MARKER = '🐎 根据 Quama Agent 规则';

/**
 * 按模式过滤 SKILL.md 内容
 * 保留：所有模式通用的规则
 * 过滤：仅特定模式适用的强度等级行
 */
function filterSkillBodyForMode(body, mode) {
  const effectiveMode = normalizeMode(mode) || DEFAULT_MODE;
  const withoutFrontmatter = String(body || '').replace(/^---[\s\S]*?---\s*/, '');

  return withoutFrontmatter
    .split(/\r?\n/)
    .filter((line) => {
      // 过滤强度等级表格行：| **lite** | ... |
      const tableLabel = line.match(/^\|\s*\*\*(.+?)\*\*\s*\|/);
      if (tableLabel) {
        const labelMode = normalizeMode(tableLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      // 过滤模式特定的示例行：- lite: "..."
      const exampleLabel = line.match(/^-\s*([^:]+):\s*"/);
      if (exampleLabel) {
        const labelMode = normalizeMode(exampleLabel[1].trim());
        if (labelMode) return labelMode === effectiveMode;
      }

      return true;
    })
    .join('\n');
}

/**
 * 获取回退指令（当 SKILL.md 不存在时使用）
 */
function getFallbackInstructions(mode) {
  return `${QUAMA_MARKER} — level: ${mode}

你是一个专注于关键项目管理的 AI 助手。你的职责是确保代码质量、文档完整性、设计一致性，并帮助团队高效协作。

## 核心职责

1. **代码质量管理**：确保代码质量、安全性、性能和可维护性
2. **文档完整性管理**：确保文档准确、完整、及时更新
3. **设计一致性管理**：确保设计决策合理、一致、可追溯
4. **团队协作支持**：支持团队高效协作和知识共享

## 工作原则

1. **质量第一**：永远不为速度牺牲质量
2. **最小化原则**：只做必要的事情，不做过度设计
3. **透明沟通**：所有重要决策必须有记录
4. **风险控制**：所有变更必须评估风险

## 管理领域

1. **代码质量**：确保代码质量、安全性、性能和可维护性
2. **文档管理**：创建和维护完整、准确的文档
3. **设计管理**：管理设计决策，确保一致性
4. **依赖管理**：管理依赖的安全性和合规性
5. **测试管理**：确保全面的测试覆盖和质量

## 输出

提供清晰、可操作的洞察。关注对项目成功最重要的事项。`;
}

/**
 * 读取并处理 SKILL.md
 * 优先读取 quama 自己的，其次读取 ponytail 的
 */
function loadSkillContent() {
  // 优先读取 quama 自己的 SKILL.md
  if (fs.existsSync(QUAMA_SKILL_PATH)) {
    return { content: fs.readFileSync(QUAMA_SKILL_PATH, 'utf8'), source: 'quama' };
  }
  
  // 其次读取 ponytail 的 SKILL.md（如果安装了 ponytail）
  if (detectPonytail() && fs.existsSync(PONYTAIL_SKILL_PATH)) {
    return { content: fs.readFileSync(PONYTAIL_SKILL_PATH, 'utf8'), source: 'ponytail' };
  }
  
  return { content: null, source: null };
}

/**
 * 获取 quama 指令（核心函数）
 * 
 * 1. 检测 ponytail 是否安装
 * 2. 加载 SKILL.md（优先 quama，其次 ponytail）
 * 3. 按模式过滤内容
 * 4. 添加 🐎 标记
 */
function getQuamaInstructions(mode) {
  const configuredMode = normalizePersistedMode(mode) || DEFAULT_MODE;
  
  // 关闭模式：不注入任何内容
  if (configuredMode === 'off') return '';

  // review 模式：独立处理
  if (INDEPENDENT_MODES.has(configuredMode)) {
    return `${QUAMA_MARKER} — level: review. 行为由 /quama-review skill 定义。`;
  }

  const effectiveMode = normalizeMode(configuredMode) || DEFAULT_MODE;
  
  // 检测 ponytail
  const ponytailInstalled = detectPonytail();
  
  // 加载 SKILL.md
  const { content, source } = loadSkillContent();
  
  let instructions = '';
  
  if (content) {
    // 成功加载 SKILL.md
    const filtered = filterSkillBodyForMode(content, effectiveMode);
    instructions = `${QUAMA_MARKER} — level: ${effectiveMode} (via ${source})\n\n${filtered}`;
  } else {
    // 使用回退指令
    instructions = getFallbackInstructions(effectiveMode);
  }
  
  // 如果 ponytail 未安装，附加安装提示
  if (!ponytailInstalled) {
    instructions += '\n\n' + getPonytailInstallHint();
  }
  
  return instructions;
}

module.exports = {
  filterSkillBodyForMode,
  getFallbackInstructions,
  getQuamaInstructions,
  QUAMA_MARKER,
};
