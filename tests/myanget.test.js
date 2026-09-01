const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('path');

// Test configuration
describe('MyAnget Configuration', () => {
  it('should have valid default mode', () => {
    const { DEFAULT_MODE, RUNTIME_MODES } = require('../hooks/myanget-config');
    assert.strictEqual(DEFAULT_MODE, 'full');
    assert.ok(RUNTIME_MODES.includes(DEFAULT_MODE));
  });

  it('should normalize modes correctly', () => {
    const { normalizeMode, normalizePersistedMode } = require('../hooks/myanget-config');
    
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
    const { isDeactivationCommand } = require('../hooks/myanget-config');
    
    assert.strictEqual(isDeactivationCommand('stop myanget'), true);
    assert.strictEqual(isDeactivationCommand('normal mode'), true);
    assert.strictEqual(isDeactivationCommand('STOP MYANGET'), true);
    assert.strictEqual(isDeactivationCommand('NORMAL MODE'), true);
    
    // Should not match partial commands
    assert.strictEqual(isDeactivationCommand('please stop myanget'), false);
    assert.strictEqual(isDeactivationCommand('switch to normal mode'), false);
    assert.strictEqual(isDeactivationCommand('other command'), false);
  });
});

// Test instructions builder
describe('MyAnget Instructions', () => {
  it('should return instructions for valid modes', () => {
    const { getMyangetInstructions } = require('../hooks/myanget-instructions');
    
    const liteInstructions = getMyangetInstructions('lite');
    const fullInstructions = getMyangetInstructions('full');
    const ultraInstructions = getMyangetInstructions('ultra');
    
    assert.ok(liteInstructions.includes('MYANGET MODE ACTIVE'));
    assert.ok(fullInstructions.includes('MYANGET MODE ACTIVE'));
    assert.ok(ultraInstructions.includes('MYANGET MODE ACTIVE'));
    
    // Each mode should have different content
    assert.notStrictEqual(liteInstructions, fullInstructions);
    assert.notStrictEqual(fullInstructions, ultraInstructions);
  });

  it('should handle review mode specially', () => {
    const { getMyangetInstructions } = require('../hooks/myanget-instructions');
    
    const reviewInstructions = getMyangetInstructions('review');
    assert.ok(reviewInstructions.includes('MYANGET MODE ACTIVE'));
    assert.ok(reviewInstructions.includes('review'));
  });

  it('should fallback to default instructions when skill file missing', () => {
    const { getFallbackInstructions } = require('../hooks/myanget-instructions');
    
    const fallback = getFallbackInstructions('full');
    assert.ok(fallback.includes('MYANGET MODE ACTIVE'));
    assert.ok(fallback.includes('full'));
    assert.ok(fallback.includes('project management'));
  });
});

// Test command parsing
describe('MyAnget Commands', () => {
  it('should parse command files correctly', () => {
    const fs = require('fs');
    const commandPath = path.join(__dirname, '..', 'commands', 'myanget.toml');
    
    // Check if command file exists
    if (fs.existsSync(commandPath)) {
      const content = fs.readFileSync(commandPath, 'utf8');
      assert.ok(content.includes('description'));
      assert.ok(content.includes('prompt'));
    }
  });
});

// Test skill structure
describe('MyAnget Skills', () => {
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