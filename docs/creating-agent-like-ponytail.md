# 如何创建一个类似 Ponytail 的优秀 AI Agent

本文档详细介绍了如何从零开始创建一个类似 Ponytail 的 AI Agent，涵盖架构设计、核心组件、实现细节和最佳实践。

## 目录

1. [概述](#概述)
2. [架构设计](#架构设计)
3. [核心组件](#核心组件)
4. [实现步骤](#实现步骤)
5. [平台适配](#平台适配)
6. [最佳实践](#最佳实践)
7. [常见问题](#常见问题)

## 概述

### 什么是 AI Agent？

AI Agent 是一个能够自主执行任务、做出决策并与用户交互的智能系统。在软件开发领域，AI Agent 可以帮助开发者：

- 编写和审查代码
- 生成和维护文档
- 管理项目进度
- 协调团队协作
- 优化系统性能

### 为什么需要自定义 Agent？

现成的 AI 工具（如 ChatGPT、Claude）虽然强大，但存在以下局限：

1. **缺乏上下文感知**：不了解你的项目结构、代码规范、团队流程
2. **无法持久化状态**：每次对话都是独立的，无法记住之前的决策
3. **无法执行操作**：只能提供建议，无法直接修改代码或执行命令
4. **无法定制化行为**：无法根据团队需求调整 AI 的行为模式

自定义 Agent 可以解决这些问题，成为团队的"AI 成员"。

### Ponytail 的设计哲学

Ponytail 是一个优秀的 Agent 实现，其核心设计哲学包括：

1. **最小化原则**：只做必要的事情，不做过度设计
2. **质量第一**：永远不为速度牺牲质量
3. **透明沟通**：所有重要决策必须有记录
4. **风险控制**：所有变更必须评估风险

## 架构设计

### 整体架构

一个完整的 AI Agent 通常包含以下层次：

```
┌─────────────────────────────────────────────────────────┐
│                    用户交互层                            │
│  (CLI / Web UI / IDE 插件 / 聊天界面)                    │
├─────────────────────────────────────────────────────────┤
│                    命令处理层                            │
│  (命令解析 / 权限验证 / 路由分发)                        │
├─────────────────────────────────────────────────────────┤
│                    核心逻辑层                            │
│  (规则引擎 / 状态管理 / 任务调度)                        │
├─────────────────────────────────────────────────────────┤
│                    工具集成层                            │
│  (代码编辑 / 文件操作 / Git / 终端)                      │
├─────────────────────────────────────────────────────────┤
│                    数据存储层                            │
│  (配置文件 / 状态文件 / 规则文件 / 日志)                  │
└─────────────────────────────────────────────────────────┘
```

### 核心设计原则

#### 1. 模块化设计

将 Agent 拆分为独立的模块，每个模块负责单一职责：

- **配置模块**：管理 Agent 的配置和设置
- **规则模块**：定义和加载 Agent 的行为规则
- **命令模块**：处理用户输入的命令
- **状态模块**：管理 Agent 的运行时状态
- **输出模块**：格式化和输出 Agent 的响应

#### 2. 插件化架构

支持通过插件扩展 Agent 的功能：

- **内置插件**：提供核心功能
- **社区插件**：由社区开发和维护
- **自定义插件**：由用户根据需求开发

#### 3. 平台无关性

设计时考虑多平台支持：

- **CLI 工具**：在终端中运行
- **IDE 插件**：集成到开发环境中
- **Web 服务**：通过 API 提供服务
- **聊天机器人**：在聊天平台中运行

### 数据流设计

```
用户输入 → 命令解析 → 权限验证 → 规则匹配 → 执行操作 → 结果输出
    ↑                                                      │
    └──────────────── 状态更新 ←────────────────────────────┘
```

## 核心组件

### 1. 配置管理

配置管理负责 Agent 的各种设置，包括：

#### 配置文件结构

```json
{
  "agent": {
    "name": "my-agent",
    "version": "1.0.0",
    "description": "My custom AI agent"
  },
  "behavior": {
    "defaultMode": "full",
    "allowedModes": ["off", "lite", "full", "ultra"],
    "persistence": true
  },
  "features": {
    "codeReview": true,
    "documentation": true,
    "testing": true,
    "security": true
  },
  "platform": {
    "cli": true,
    "ide": true,
    "web": false
  }
}
```

#### 配置加载优先级

1. 环境变量（最高优先级）
2. 用户配置文件
3. 项目配置文件
4. 默认配置

#### 配置热更新

支持在运行时更新配置，无需重启 Agent：

```javascript
// 监听配置文件变化
fs.watch(configPath, (eventType, filename) => {
  if (filename) {
    reloadConfig();
    applyNewConfig();
  }
});
```

### 2. 规则引擎

规则引擎是 Agent 的核心，定义了 Agent 的行为模式。

#### 规则文件格式

使用 Markdown 格式编写规则，便于阅读和维护：

```markdown
---
name: code-review
description: 代码审查规则
priority: high
---

# 代码审查规则

## 基本原则

1. 代码必须经过审查才能合并
2. 审查必须关注质量、安全性、性能
3. 反馈必须具体、可操作

## 审查检查清单

- [ ] 代码是否符合编码规范？
- [ ] 是否有安全漏洞？
- [ ] 是否有性能问题？
- [ ] 是否有可维护性问题？
```

#### 规则加载机制

```javascript
function loadRules(rulesDir) {
  const rules = [];
  const files = fs.readdirSync(rulesDir);
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const rule = parseRuleFile(path.join(rulesDir, file));
      rules.push(rule);
    }
  }
  
  return rules.sort((a, b) => b.priority - a.priority);
}

function parseRuleFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!match) return null;
  
  const frontmatter = yaml.parse(match[1]);
  const body = match[2];
  
  return {
    ...frontmatter,
    body,
    path: filePath
  };
}
```

#### 规则过滤

根据当前模式过滤规则内容：

```javascript
function filterRulesForMode(rules, mode) {
  return rules.map(rule => {
    const filteredBody = filterContentForMode(rule.body, mode);
    return { ...rule, body: filteredBody };
  });
}

function filterContentForMode(content, mode) {
  // 移除不适用于当前模式的内容
  const lines = content.split('\n');
  const filtered = [];
  
  for (const line of lines) {
    // 检查是否是模式特定的内容
    const modeMatch = line.match(/^\|\s*\*\*(\w+)\*\*\s*\|/);
    if (modeMatch) {
      const lineMode = modeMatch[1];
      if (lineMode !== mode) continue;
    }
    
    filtered.push(line);
  }
  
  return filtered.join('\n');
}
```

### 3. 命令系统

命令系统处理用户输入的各种命令。

#### 命令定义

```javascript
const commands = {
  'agent': {
    description: '切换 Agent 模式',
    args: '[lite|full|ultra|off]',
    handler: handleModeCommand
  },
  'review': {
    description: '审查代码',
    args: '[file or directory]',
    handler: handleReviewCommand
  },
  'audit': {
    description: '审计项目',
    args: '',
    handler: handleAuditCommand
  }
};
```

#### 命令解析

```javascript
function parseCommand(input) {
  const trimmed = input.trim();
  if (!trimmed.startsWith('/')) return null;
  
  const parts = trimmed.slice(1).split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1).join(' ');
  
  return { command, args };
}
```

#### 命令执行

```javascript
async function executeCommand(command, args, context) {
  const handler = commands[command]?.handler;
  if (!handler) {
    return `未知命令: ${command}`;
  }
  
  // 检查权限
  if (!hasPermission(command, context.user)) {
    return '权限不足';
  }
  
  // 执行命令
  try {
    return await handler(args, context);
  } catch (error) {
    return `命令执行失败: ${error.message}`;
  }
}
```

### 4. 状态管理

状态管理负责维护 Agent 的运行时状态。

#### 状态存储

```javascript
class StateManager {
  constructor(statePath) {
    this.statePath = statePath;
    this.state = this.loadState();
  }
  
  loadState() {
    try {
      return JSON.parse(fs.readFileSync(this.statePath, 'utf8'));
    } catch {
      return this.getDefaultState();
    }
  }
  
  saveState() {
    fs.writeFileSync(this.statePath, JSON.stringify(this.state, null, 2));
  }
  
  getDefaultState() {
    return {
      mode: 'full',
      lastActive: new Date().toISOString(),
      commands: {},
      stats: {
        totalCommands: 0,
        successfulCommands: 0,
        failedCommands: 0
      }
    };
  }
}
```

#### 状态持久化

支持多种持久化方式：

1. **文件存储**：简单可靠，适合单机环境
2. **数据库存储**：适合多用户、分布式环境
3. **内存存储**：高性能，适合临时状态

### 5. 输出格式化

输出格式化负责将 Agent 的响应转换为用户友好的格式。

#### 输出类型

```javascript
const outputTypes = {
  TEXT: 'text',
  MARKDOWN: 'markdown',
  JSON: 'json',
  HTML: 'html'
};
```

#### 格式化器

```javascript
class OutputFormatter {
  static format(response, type = 'text') {
    switch (type) {
      case 'text':
        return this.formatText(response);
      case 'markdown':
        return this.formatMarkdown(response);
      case 'json':
        return this.formatJSON(response);
      case 'html':
        return this.formatHTML(response);
      default:
        return response;
    }
  }
  
  static formatText(response) {
    // 纯文本格式化
    return response;
  }
  
  static formatMarkdown(response) {
    // Markdown 格式化
    return response;
  }
}
```

## 实现步骤

### 第一步：项目初始化

```bash
# 创建项目目录
mkdir my-agent
cd my-agent

# 初始化 npm 项目
npm init -y

# 安装依赖
npm install commander inquirer chalk
```

### 第二步：创建基础结构

```
my-agent/
├── src/
│   ├── index.js          # 入口文件
│   ├── config.js         # 配置管理
│   ├── rules.js          # 规则引擎
│   ├── commands.js       # 命令系统
│   ├── state.js          # 状态管理
│   └── output.js         # 输出格式化
├── rules/                # 规则文件目录
│   ├── code-review.md
│   ├── documentation.md
│   └── testing.md
├── config/               # 配置文件目录
│   └── default.json
├── tests/                # 测试文件目录
│   └── ...
└── package.json
```

### 第三步：实现核心模块

#### 配置管理模块

```javascript
// src/config.js
const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = this.loadConfig();
  }
  
  loadConfig() {
    const defaultConfig = this.getDefaultConfig();
    const userConfig = this.getUserConfig();
    
    return this.mergeConfigs(defaultConfig, userConfig);
  }
  
  getDefaultConfig() {
    return {
      agent: {
        name: 'my-agent',
        version: '1.0.0'
      },
      behavior: {
        defaultMode: 'full',
        allowedModes: ['off', 'lite', 'full', 'ultra']
      }
    };
  }
  
  getUserConfig() {
    try {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    } catch {
      return {};
    }
  }
  
  mergeConfigs(defaults, overrides) {
    return {
      ...defaults,
      ...overrides,
      agent: { ...defaults.agent, ...overrides.agent },
      behavior: { ...defaults.behavior, ...overrides.behavior }
    };
  }
}
```

#### 规则引擎模块

```javascript
// src/rules.js
const fs = require('fs');
const path = require('path');

class RuleEngine {
  constructor(rulesDir) {
    this.rulesDir = rulesDir;
    this.rules = this.loadRules();
  }
  
  loadRules() {
    const rules = [];
    
    if (!fs.existsSync(this.rulesDir)) {
      return rules;
    }
    
    const files = fs.readdirSync(this.rulesDir);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const rule = this.parseRuleFile(path.join(this.rulesDir, file));
        if (rule) {
          rules.push(rule);
        }
      }
    }
    
    return rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }
  
  parseRuleFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    
    if (!match) return null;
    
    const frontmatter = this.parseFrontmatter(match[1]);
    const body = match[2];
    
    return {
      ...frontmatter,
      body,
      path: filePath
    };
  }
  
  parseFrontmatter(text) {
    const result = {};
    const lines = text.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        result[match[1]] = match[2];
      }
    }
    
    return result;
  }
  
  getRulesForMode(mode) {
    return this.rules.map(rule => ({
      ...rule,
      body: this.filterContentForMode(rule.body, mode)
    }));
  }
  
  filterContentForMode(content, mode) {
    const lines = content.split('\n');
    const filtered = [];
    
    for (const line of lines) {
      const modeMatch = line.match(/^\|\s*\*\*(\w+)\*\*\s*\|/);
      if (modeMatch && modeMatch[1] !== mode) {
        continue;
      }
      filtered.push(line);
    }
    
    return filtered.join('\n');
  }
}
```

### 第四步：创建 CLI 入口

```javascript
// src/index.js
const { program } = require('commander');
const ConfigManager = require('./config');
const RuleEngine = require('./rules');
const StateManager = require('./state');

class Agent {
  constructor() {
    this.config = new ConfigManager('./config/default.json');
    this.rules = new RuleEngine('./rules');
    this.state = new StateManager('./state.json');
  }
  
  async start() {
    program
      .name('my-agent')
      .description('My custom AI agent')
      .version('1.0.0');
    
    program
      .command('start')
      .description('Start the agent')
      .action(() => this.startInteractive());
    
    program
      .command('review')
      .description('Review code')
      .argument('[target]', 'File or directory to review')
      .action((target) => this.reviewCode(target));
    
    program
      .command('audit')
      .description('Audit the project')
      .action(() => this.auditProject());
    
    await program.parseAsync();
  }
  
  async startInteractive() {
    console.log('Agent started. Type "help" for available commands.');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const prompt = () => {
      rl.question('> ', async (input) => {
        if (input.trim() === 'exit') {
          rl.close();
          return;
        }
        
        const response = await this.processInput(input);
        console.log(response);
        prompt();
      });
    };
    
    prompt();
  }
  
  async processInput(input) {
    // 处理用户输入
    return `You said: ${input}`;
  }
}
```

### 第五步：添加平台适配

#### CLI 适配

```javascript
// platforms/cli.js
const { program } = require('commander');

function setupCLI(agent) {
  program
    .command('cli')
    .description('Run in CLI mode')
    .action(() => {
      agent.startInteractive();
    });
}
```

#### IDE 插件适配

```javascript
// platforms/vscode.js
const vscode = require('vscode');

function activate(context) {
  const agent = new Agent();
  
  let disposable = vscode.commands.registerCommand(
    'my-agent.start',
    () => {
      const panel = vscode.window.createWebviewPanel(
        'myAgent',
        'My Agent',
        vscode.ViewColumn.One,
        {}
      );
      
      panel.webview.html = getWebviewContent();
    }
  );
  
  context.subscriptions.push(disposable);
}
```

#### Web 服务适配

```javascript
// platforms/web.js
const express = require('express');

function setupWebServer(agent) {
  const app = express();
  
  app.use(express.json());
  
  app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    const response = await agent.processInput(message);
    res.json({ response });
  });
  
  app.listen(3000, () => {
    console.log('Web server running on port 3000');
  });
}
```

## 平台适配

### Claude Code 适配

Claude Code 是 Anthropic 的命令行工具，支持通过插件扩展功能。

#### 插件结构

```
.claude-plugin/
├── plugin.json        # 插件配置
├── hooks/             # 钩子脚本
│   ├── session-start.js
│   └── prompt-submit.js
└── skills/            # 技能文件
    └── my-skill/
        └── SKILL.md
```

#### 插件配置

```json
{
  "name": "my-agent",
  "version": "1.0.0",
  "description": "My custom AI agent for Claude Code",
  "hooks": {
    "SessionStart": "./hooks/session-start.js",
    "UserPromptSubmit": "./hooks/prompt-submit.js"
  }
}
```

### Codex 适配

OpenAI 的 Codex CLI 工具，支持类似的插件机制。

#### 插件结构

```
.codex-plugin/
├── plugin.json
├── hooks/
│   ├── session-start.js
│   └── prompt-submit.js
└── skills/
    └── my-skill/
        └── SKILL.md
```

### OpenCode 适配

OpenCode 是一个开源的 AI 编程助手，支持通过配置文件扩展。

#### 插件配置

```json
{
  "plugin": ["my-agent"]
}
```

#### 插件实现

```javascript
// .opencode/plugins/my-agent.mjs
export default async ({ client }) => {
  return {
    config: async (config) => {
      // 注册命令和技能
    },
    'experimental.chat.system.transform': async (input, output) => {
      // 注入系统提示
    }
  };
};
```

### Pi Agent 适配

Pi Agent 是一个轻量级的 AI 助手框架。

#### 扩展结构

```
.pi-extension/
├── index.js          # 扩展入口
├── package.json
└── skills/
    └── my-skill/
        └── SKILL.md
```

#### 扩展实现

```javascript
// .pi-extension/index.js
module.exports = {
  name: 'my-agent',
  version: '1.0.0',
  
  register(ctx) {
    // 注册钩子和命令
    ctx.registerHook('pre_llm_call', async (context) => {
      // 注入规则
    });
    
    ctx.registerCommand('my-command', {
      description: 'My custom command',
      handler: async (args) => {
        return 'Command executed';
      }
    });
  }
};
```

## 最佳实践

### 1. 规则设计

#### 清晰的规则结构

```markdown
---
name: rule-name
description: 规则描述
priority: high
---

# 规则标题

## 基本原则

1. 原则一
2. 原则二
3. 原则三

## 具体要求

### 要求一

详细说明...

### 要求二

详细说明...

## 检查清单

- [ ] 检查项一
- [ ] 检查项二
- [ ] 检查项三
```

#### 规则优先级

- **高优先级**：必须遵守，违反将导致严重后果
- **中优先级**：强烈推荐，违反需要说明理由
- **低优先级**：建议遵守，可根据实际情况调整

#### 规则更新

- 定期评审和更新规则
- 更新需要团队讨论和审批
- 更新后需要通知所有成员

### 2. 错误处理

#### 优雅降级

```javascript
async function executeWithFallback(primary, fallback) {
  try {
    return await primary();
  } catch (error) {
    console.error('Primary failed:', error.message);
    return await fallback();
  }
}
```

#### 错误日志

```javascript
function logError(error, context) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    error: error.message,
    stack: error.stack,
    context
  };
  
  fs.appendFileSync('error.log', JSON.stringify(logEntry) + '\n');
}
```

### 3. 性能优化

#### 缓存机制

```javascript
class Cache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }
  
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
}
```

#### 懒加载

```javascript
class LazyLoader {
  constructor(loader) {
    this.loader = loader;
    this.instance = null;
  }
  
  getInstance() {
    if (!this.instance) {
      this.instance = this.loader();
    }
    return this.instance;
  }
}
```

### 4. 安全考虑

#### 输入验证

```javascript
function validateInput(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  if (input.length > 10000) {
    throw new Error('Input too long');
  }
  
  // 移除潜在的危险字符
  return input.replace(/[<>]/g, '');
}
```

#### 权限控制

```javascript
function checkPermission(user, action) {
  const permissions = {
    admin: ['read', 'write', 'execute', 'delete'],
    user: ['read', 'write'],
    guest: ['read']
  };
  
  return permissions[user.role]?.includes(action) || false;
}
```

### 5. 测试策略

#### 单元测试

```javascript
describe('RuleEngine', () => {
  it('should load rules from directory', () => {
    const engine = new RuleEngine('./test-rules');
    expect(engine.rules.length).toBeGreaterThan(0);
  });
  
  it('should filter rules by mode', () => {
    const engine = new RuleEngine('./test-rules');
    const rules = engine.getRulesForMode('lite');
    expect(rules).toBeDefined();
  });
});
```

#### 集成测试

```javascript
describe('Agent Integration', () => {
  it('should process commands', async () => {
    const agent = new Agent();
    const response = await agent.processInput('/help');
    expect(response).toContain('Available commands');
  });
});
```

## 常见问题

### Q: 如何选择规则文件格式？

A: 推荐使用 Markdown 格式，原因：
1. 人类可读，便于编辑和维护
2. 支持 frontmatter 元数据
3. 版本控制友好
4. 可以转换为其他格式（HTML、PDF）

### Q: 如何处理规则冲突？

A: 建议采用以下策略：
1. 使用优先级系统，高优先级规则覆盖低优先级
2. 规则命名避免冲突
3. 定期评审和清理规则
4. 文档化规则之间的关系

### Q: 如何扩展 Agent 的功能？

A: 可以通过以下方式扩展：
1. 添加新的规则文件
2. 开发新的命令
3. 创建插件
4. 集成外部工具

### Q: 如何调试 Agent？

A: 建议使用以下方法：
1. 启用详细日志
2. 使用调试器
3. 编写单元测试
4. 使用交互式模式测试

### Q: 如何部署 Agent？

A: 可以选择以下部署方式：
1. 本地安装（npm install -g）
2. 项目内安装（作为开发依赖）
3. Docker 容器
4. 云服务

## 总结

创建一个类似 Ponytail 的 AI Agent 需要：

1. **清晰的架构设计**：模块化、插件化、平台无关
2. **完善的核心组件**：配置、规则、命令、状态、输出
3. **良好的平台适配**：支持多种开发环境
4. **最佳实践**：规则设计、错误处理、性能优化、安全考虑、测试策略

通过遵循本文档的指导，你可以创建一个功能强大、易于维护、可扩展的 AI Agent，为你的团队提供智能化的开发支持。

---

*本文档基于 Ponytail 项目的实践经验编写，旨在帮助开发者创建高质量的 AI Agent。*
