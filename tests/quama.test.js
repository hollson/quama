const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

// 测试配置模块
describe('Quama Configuration', () => {
  it('should have valid default mode', () => {
    const { DEFAULT_MODE, RUNTIME_MODES } = require('../hooks/quama-config');
    assert.strictEqual(DEFAULT_MODE, 'full');
    assert.ok(RUNTIME_MODES.includes(DEFAULT_MODE));
  });

  it('should normalize modes correctly', () => {
    const { normalizeMode, normalizePersistedMode } = require('../hooks/quama-config');
    
    // 有效的运行时模式
    assert.strictEqual(normalizeMode('lite'), 'lite');
    assert.strictEqual(normalizeMode('full'), 'full');
    assert.strictEqual(normalizeMode('ultra'), 'ultra');
    assert.strictEqual(normalizeMode('off'), 'off');
    
    // 无效的模式
    assert.strictEqual(normalizeMode('invalid'), null);
    assert.strictEqual(normalizeMode('review'), null); // review 不是运行时模式
    
    // 持久化模式（包含 review）
    assert.strictEqual(normalizePersistedMode('review'), 'review');
    assert.strictEqual(normalizePersistedMode('invalid'), null);
  });

  it('should detect deactivation commands', () => {
    const { isDeactivationCommand } = require('../hooks/quama-config');
    
    assert.strictEqual(isDeactivationCommand('stop quama'), true);
    assert.strictEqual(isDeactivationCommand('normal mode'), true);
    assert.strictEqual(isDeactivationCommand('STOP QUAMA'), true);
    assert.strictEqual(isDeactivationCommand('NORMAL MODE'), true);
    
    // 不应该匹配部分命令
    assert.strictEqual(isDeactivationCommand('please stop quama'), false);
    assert.strictEqual(isDeactivationCommand('switch to normal mode'), false);
    assert.strictEqual(isDeactivationCommand('other command'), false);
  });
});

// 测试指令构建器
describe('Quama Instructions', () => {
  it('should return instructions for valid modes', () => {
    const { getQuamaInstructions } = require('../hooks/quama-instructions');
    
    const liteInstructions = getQuamaInstructions('lite');
    const fullInstructions = getQuamaInstructions('full');
    const ultraInstructions = getQuamaInstructions('ultra');
    
    // 应该包含 🐎 标记
    assert.ok(liteInstructions.includes('🐎'), 'Should include quama marker');
    assert.ok(fullInstructions.includes('🐎'), 'Should include quama marker');
    assert.ok(ultraInstructions.includes('🐎'), 'Should include quama marker');
    
    // 每个模式应该有不同的内容
    assert.notStrictEqual(liteInstructions, fullInstructions);
    assert.notStrictEqual(fullInstructions, ultraInstructions);
  });

  it('should handle review mode specially', () => {
    const { getQuamaInstructions } = require('../hooks/quama-instructions');
    
    const reviewInstructions = getQuamaInstructions('review');
    assert.ok(reviewInstructions.includes('🐎'), 'Should include quama marker');
    assert.ok(reviewInstructions.includes('review'));
  });

  it('should fallback to default instructions when skill file missing', () => {
    const { getFallbackInstructions } = require('../hooks/quama-instructions');
    
    const fallback = getFallbackInstructions('full');
    assert.ok(fallback.includes('🐎'), 'Should include quama marker');
    assert.ok(fallback.includes('full'));
    assert.ok(fallback.includes('项目管理'));
  });

  it('should include ponytail install hint when not installed', () => {
    const { getQuamaInstructions } = require('../hooks/quama-instructions');
    const { detectPonytail } = require('../hooks/quama-runtime');
    
    // 如果 ponytail 未安装，应该包含安装提示
    if (!detectPonytail()) {
      const instructions = getQuamaInstructions('full');
      assert.ok(instructions.includes('ponytail'), 'Should include ponytail install hint');
    }
  });
});

// 测试运行时模块
describe('Quama Runtime', () => {
  it('should detect ponytail installation status', () => {
    const { detectPonytail } = require('../hooks/quama-runtime');
    
    // 检测函数应该返回布尔值
    const result = detectPonytail();
    assert.strictEqual(typeof result, 'boolean');
  });

  it('should generate install hint', () => {
    const { getPonytailInstallHint } = require('../hooks/quama-runtime');
    
    const hint = getPonytailInstallHint();
    assert.ok(hint.includes('ponytail'), 'Should mention ponytail');
    assert.ok(hint.includes('npm'), 'Should include npm install command');
  });
});

// 测试命令文件
describe('Quama Commands', () => {
  it('should parse command files correctly', () => {
    const fs = require('fs');
    const commandPath = path.join(__dirname, '..', 'commands', 'quama.toml');
    
    // 检查命令文件是否存在
    if (fs.existsSync(commandPath)) {
      const content = fs.readFileSync(commandPath, 'utf8');
      assert.ok(content.includes('description'));
      assert.ok(content.includes('prompt'));
    }
  });
});

// 测试技能结构
describe('Quama Skills', () => {
  it('should have quama skill file', () => {
    const fs = require('fs');
    const skillsDir = path.join(__dirname, '..', 'skills');
    
    // 检查 skills 目录是否存在
    if (fs.existsSync(skillsDir)) {
      const skills = fs.readdirSync(skillsDir);
      
      // 应该有 quama skill
      assert.ok(skills.includes('quama'), 'Should have quama skill');
      
      // 检查 quama skill 的 SKILL.md
      const quamaSkillFile = path.join(skillsDir, 'quama', 'SKILL.md');
      if (fs.existsSync(quamaSkillFile)) {
        const content = fs.readFileSync(quamaSkillFile, 'utf8');
        assert.ok(content.includes('name:'), 'Quama skill should have name in frontmatter');
        assert.ok(content.includes('description:'), 'Quama skill should have description in frontmatter');
      }
    }
  });
});
