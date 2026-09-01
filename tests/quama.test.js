const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

// Test configuration
describe('Quama Configuration', () => {
  it('should have valid default mode', () => {
    const { DEFAULT_MODE, RUNTIME_MODES } = require('../hooks/quama-config');
    assert.strictEqual(DEFAULT_MODE, 'full');
    assert.ok(RUNTIME_MODES.includes(DEFAULT_MODE));
  });

  it('should normalize modes correctly', () => {
    const { normalizeMode, normalizePersistedMode } = require('../hooks/quama-config');
    
    // Valid runtime modes
    assert.strictEqual(normalizeMode('lite'), 'lite');
    assert.strictEqual(normalizeMode('full'), 'full');
    assert.strictEqual(normalizeMode('ultra'), 'ultra');
    assert.strictEqual(normalizeMode('off'), 'off');
    
    // Invalid modes
    assert.strictEqual(normalizeMode('invalid'), null);
    assert.strictEqual(normalizeMode('review'), null); // review is not a runtime mode
    
    // Persisted modes (includes review)
    assert.strictEqual(normalizePersistedMode('review'), 'review');
    assert.strictEqual(normalizePersistedMode('invalid'), null);
  });

  it('should detect deactivation commands', () => {
    const { isDeactivationCommand } = require('../hooks/quama-config');
    
    assert.strictEqual(isDeactivationCommand('stop quama'), true);
    assert.strictEqual(isDeactivationCommand('normal mode'), true);
    assert.strictEqual(isDeactivationCommand('STOP QUAMA'), true);
    assert.strictEqual(isDeactivationCommand('NORMAL MODE'), true);
    
    // Should not match partial commands
    assert.strictEqual(isDeactivationCommand('please stop quama'), false);
    assert.strictEqual(isDeactivationCommand('switch to normal mode'), false);
    assert.strictEqual(isDeactivationCommand('other command'), false);
  });
});

// Test instructions builder
describe('Quama Instructions', () => {
  it('should return instructions for valid modes', () => {
    const { getQuamaInstructions } = require('../hooks/quama-instructions');
    
    const liteInstructions = getQuamaInstructions('lite');
    const fullInstructions = getQuamaInstructions('full');
    const ultraInstructions = getQuamaInstructions('ultra');
    
    assert.ok(liteInstructions.includes('QUAMA MODE ACTIVE'));
    assert.ok(fullInstructions.includes('QUAMA MODE ACTIVE'));
    assert.ok(ultraInstructions.includes('QUAMA MODE ACTIVE'));
    
    // Each mode should have different content
    assert.notStrictEqual(liteInstructions, fullInstructions);
    assert.notStrictEqual(fullInstructions, ultraInstructions);
  });

  it('should handle review mode specially', () => {
    const { getQuamaInstructions } = require('../hooks/quama-instructions');
    
    const reviewInstructions = getQuamaInstructions('review');
    assert.ok(reviewInstructions.includes('QUAMA MODE ACTIVE'));
    assert.ok(reviewInstructions.includes('review'));
  });

  it('should fallback to default instructions when skill file missing', () => {
    const { getFallbackInstructions } = require('../hooks/quama-instructions');
    
    const fallback = getFallbackInstructions('full');
    assert.ok(fallback.includes('QUAMA MODE ACTIVE'));
    assert.ok(fallback.includes('full'));
    assert.ok(fallback.includes('project management'));
  });
});

// Test command parsing
describe('Quama Commands', () => {
  it('should parse command files correctly', () => {
    const fs = require('fs');
    const commandPath = path.join(__dirname, '..', 'commands', 'quama.toml');
    
    // Check if command file exists
    if (fs.existsSync(commandPath)) {
      const content = fs.readFileSync(commandPath, 'utf8');
      assert.ok(content.includes('description'));
      assert.ok(content.includes('prompt'));
    }
  });
});

// Test skill structure
describe('Quama Skills', () => {
  it('should have required skill files', () => {
    const fs = require('fs');
    const skillsDir = path.join(__dirname, '..', 'skills');
    
    // Check if skills directory exists
    if (fs.existsSync(skillsDir)) {
      const skills = fs.readdirSync(skillsDir);
      
      // Should have at least the project-status skill
      assert.ok(skills.includes('project-status'), 'Should have project-status skill');
      
      // Check for SKILL.md in each skill
      skills.forEach(skill => {
        const skillFile = path.join(skillsDir, skill, 'SKILL.md');
        if (fs.existsSync(skillFile)) {
          const content = fs.readFileSync(skillFile, 'utf8');
          assert.ok(content.includes('name:'), `Skill ${skill} should have name in frontmatter`);
          assert.ok(content.includes('description:'), `Skill ${skill} should have description in frontmatter`);
        }
      });
    }
  });
});
