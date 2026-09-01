# Quama

面向关键软件项目的 AI Agent 基座。

Quama 是一个独立运行的项目管理 Agent，可以安装在 Claude Code、Codex、OpenCode 等 AI 编程助手中。它为 AI 注入团队规范、代码审查标准、项目管理流程，让 AI 成为团队的"虚拟成员"，而不仅仅是一个代码生成工具。

## 它解决什么问题

AI 编程助手（如 Claude、GPT）虽然强大，但存在几个核心问题：

1. **没有团队上下文** — 不了解你的代码规范、架构决策、协作流程
2. **没有持久化状态** — 每次对话都是独立的，不记得之前的决策
3. **没有质量约束** — 可能生成不符合团队标准的代码
4. **没有流程意识** — 不知道什么时候该审查、什么时候该测试、什么时候该文档

Quama 通过在每次对话中注入团队规则来解决这些问题。AI 在生成代码、审查代码、编写文档时，会自动遵循你的团队规范。

## 工作原理

```
你的项目
├── .quama/
│   └── rules/          # 团队规范（你定义的）
│       ├── core-principles.md
│       ├── coding-standards.md
│       └── ...
├── skills/
│   └── quama/
│       └── SKILL.md    # Quama 核心指令
└── hooks/
    └── quama-*.js      # 运行时逻辑
```

当 AI 启动对话时，Quama 会：

1. **读取规则** — 加载 `.quama/rules/` 下的规范文件和 `skills/quama/SKILL.md`
2. **过滤内容** — 根据当前模式（lite/full/ultra）筛选适用的规则
3. **注入上下文** — 将规则注入到 AI 的系统提示中
4. **显示标记** — 每次注入都带 `🐎 根据 Quama Agent 规则` 标记，便于验证

效果：AI 在整个对话过程中都会遵循你的团队规范。

## 功能特性

### 代码质量管理

- 自动审查代码质量、安全性、性能
- 检查是否符合编码规范
- 识别潜在的安全漏洞
- 评估代码可维护性

### 文档完整性管理

- 确保代码变更同步更新文档
- 审查 API 文档完整性
- 检查架构文档一致性
- 维护变更日志

### 设计一致性管理

- 记录设计决策，确保可追溯
- 管理架构模式，防止随意变更
- 检查设计一致性
- 维护技术债清单

### 团队协作支持

- 统一代码审查标准
- 规范提交信息格式
- 协调跨团队协作
- 知识共享和传承

### 风险控制

- 评估变更风险等级
- 要求高风险变更的回滚方案
- 监控关键路径的测试覆盖
- 审查依赖安全性和合规性

## 模式系统

Quama 支持三种强度等级，适应不同的工作场景：

| 模式 | 行为 | 适用场景 |
|------|------|----------|
| **lite** | 基础管理，仅建议 | 快速原型、个人项目 |
| **full** | 全面管理，主动审查 | 团队项目（默认） |
| **ultra** | 严格管理，最大监督 | 关键系统、金融项目 |
| **off** | 关闭 Quama | 不需要规则时 |

切换方式：`/quama lite`、`/quama full`、`/quama ultra`、`/quama off`

## 团队规范体系

Quama 内置完整的团队规范，涵盖软件开发的各个方面：

### 核心原则

- **质量第一**：永远不为速度牺牲质量
- **最小化原则**：只做必要的事情，不做过度设计
- **透明沟通**：所有重要决策必须有记录
- **风险控制**：所有变更必须评估风险

### 编码规范

- 代码简洁性：最好的代码是永远不需要写的代码
- 代码可读性：命名清晰、结构合理、注释得当
- 代码复用：优先使用标准库和已安装依赖
- 错误处理：捕获所有错误，提供有意义的反馈
- 安全编码：输入验证、输出编码、参数化查询

### 项目管理规范

- 需求管理：明确、可衡量、可实现
- 进度管理：可跟踪、可预测、可控制
- 质量管理：可度量、可改进、可保证
- 风险管理：识别、评估、控制、监控

### 协作规范

- 团队协作：高效、透明、互相尊重
- 代码协作：有序、高效、质量保证
- 问题协作：及时、有效、彻底解决
- 知识协作：分享、积累、传承

### 安全规范

- 安全原则：安全是系统的基石
- 身份认证：可靠、安全、易用
- 访问控制：严格、精细、可审计
- 数据安全：保护机密性、完整性、可用性

### 性能规范

- 性能意识：明确目标、度量、监控、优化
- 设计阶段：考虑性能需求
- 开发阶段：编写高性能代码
- 测试阶段：验证系统性能

### 测试规范

- 测试原则：尽早测试、持续测试、全面测试
- 测试类型：单元测试、集成测试、系统测试、验收测试
- 测试用例：清晰、完整、可执行
- 自动化测试：可靠、可维护、有价值

### 文档规范

- 文档原则：准确、完整、及时、可访问
- 文档分类：用户文档、开发文档、运维文档、管理文档
- 文档格式：统一模板、清晰结构、规范样式
- 文档编写：使用中文、简洁明了、提供示例

## 可见性验证

Quama 在每次规则注入时都会显示标记，便于验证 Agent 是否生效：

```
🐎 根据 Quama Agent 规则 — level: full (via quama)

[SKILL.md 内容，按模式过滤]

---

🐎 根据 Quama Agent 规则 — 团队规范

[.quama/rules/ 下的规范文件内容]
```

如果 Quama 未激活，对话中不会出现 `🐎` 标记。

## 与 Ponytail 的关系

Quama 是一个独立的 Agent，不依赖 Ponytail。但 Quama 可以利用 Ponytail 的能力：

- **Ponytail 已安装** — Quama 会加载 `skills/ponytail/SKILL.md` 作为补充规则
- **Ponytail 未安装** — Quama 使用自己的 fallback 指令，并提示安装

安装 Ponytail 不是必须的，但可以增强 Quama 的能力（如模式切换、状态持久化）。

## 支持平台

| 平台 | 状态 | 安装方式 |
|------|------|----------|
| Claude Code | ✅ 已支持 | `/plugin marketplace add hollson/quama` |
| Codex | ✅ 已支持 | `codex plugin marketplace add hollson/quama` |
| Qoder | ✅ 已支持 | 内置支持 |
| OpenCode | ✅ 已支持 | `opencode.json` 添加 `@hollson/quama` |
| Pi Agent | ✅ 已支持 | `pi install git:github.com/hollson/quama` |
| Trae | ✅ 已支持 | 复制 `.trae/rules/` 下的规则文件 |
| CodeBuddy | ✅ 已支持 | 复制 `.codebuddy/rules/` 下的规则文件 |
| Cursor | 🔲 待实现 | — |
| Windsurf | 🔲 待实现 | — |
| GitHub Copilot | 🔲 待实现 | — |
| Cline | 🔲 待实现 | — |
| Aider | 🔲 待实现 | — |

## 安装方式

### Claude Code
```bash
/plugin marketplace add hollson/quama
/plugin install quama@quama
```

### Codex
```bash
codex plugin marketplace add hollson/quama
codex plugin add quama@quama
```

### OpenCode
在 `opencode.json` 中添加：
```json
{ "plugin": ["@hollson/quama"] }
```

### Pi Agent
```bash
pi install git:github.com/hollson/quama
```

### 其他平台
将本仓库中对应的规则文件复制到你的项目中。

## 使用方法

### 命令
- `/quama [lite|full|ultra|off]` — 切换强度等级
- `/quama-project-status` — 查看项目状态
- `/quama-code-review` — 代码质量审查
- `/quama-doc-gen` — 生成文档
- `/quama-design-manage` — 管理设计决策
- `/quama-dependency-manage` — 管理依赖
- `/quama-test-coverage` — 管理测试覆盖

### 配置

#### 环境变量
- `QUAMA_DEFAULT_MODE` — 设置默认模式（lite/full/ultra/off）
- `QUAMA_HIDE_STATUS` — 隐藏状态指示器
- `QUAMA_QUIET_STARTUP` — 抑制启动通知

#### 配置文件
`~/.config/quama/config.json`：
```json
{
  "defaultMode": "full",
  "hideStatus": false,
  "quietStartup": false
}
```

## 自定义规范

你可以修改 `.quama/rules/` 下的文件来定义自己的团队规范：

```
.quama/rules/
├── core-principles.md      # 核心原则（可修改）
├── coding-standards.md     # 编码规范（可修改）
├── project-management.md   # 项目管理规范（可修改）
├── collaboration.md        # 协作规范（可修改）
├── security.md             # 安全规范（可修改）
├── performance.md          # 性能规范（可修改）
├── testing.md              # 测试规范（可修改）
├── documentation.md        # 文档规范（可修改）
└── index.md                # 规范索引
```

规范文件使用 Markdown 格式，支持 frontmatter 元数据。修改后无需重启 AI，下次对话自动生效。

## 开发

### 运行测试
```bash
npm test
```

### 构建
项目开箱即用，无需构建步骤。

## 许可证

MIT
