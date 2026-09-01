# Quama

面向关键软件项目的项目管理基座。管理代码、文档、设计、依赖和测试。

## 功能特性

- **代码质量**：审查代码质量、安全性、性能和可维护性
- **文档管理**：生成和维护 README、API 文档、架构文档和变更日志
- **设计管理**：记录设计决策、管理架构模式、确保一致性
- **依赖管理**：检查安全漏洞、更新依赖、验证许可证合规性
- **测试覆盖**：分析测试覆盖率、改进测试质量、规划自动化
- **团队规范**：包含完整的团队规范体系，涵盖核心原则、编码规范、项目管理、协作、安全、性能、测试、文档等方面

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

### 模式
- **lite** — 基础项目管理，提供改进建议
- **full** — 全面项目管理（默认）
- **ultra** — 严格项目管理，最大监督力度

## 团队规范体系

Quama 包含完整的团队规范体系，基于 Ponytail 项目的优秀实践，针对团队使用场景进行了优化。

### 规范文件位置
```
.quama/rules/
├── core-principles.md      # 核心原则
├── coding-standards.md     # 编码规范
├── project-management.md   # 项目管理规范
├── collaboration.md        # 协作规范
├── security.md             # 安全规范
├── performance.md          # 性能规范
├── testing.md              # 测试规范
├── documentation.md        # 文档规范
└── index.md                # 规范索引
```

### 规范分类
1. **强制规则**：必须遵守，违反将导致严重后果
2. **推荐规则**：强烈推荐，违反需要说明理由
3. **建议规则**：建议遵守，可根据实际情况调整

### 规范使用
- 所有项目成员必须遵守这些规范
- 所有代码和文档必须符合这些标准
- 所有流程必须遵循这些规范

### 规范更新
- 规范定期评审和更新
- 更新需要团队讨论和审批
- 更新后需要通知所有成员

## 配置

### 环境变量
- `QUAMA_DEFAULT_MODE` — 设置默认模式（lite/full/ultra/off）
- `QUAMA_HIDE_STATUS` — 隐藏状态指示器
- `QUAMA_QUIET_STARTUP` — 抑制启动通知

### 配置文件
`~/.config/quama/config.json`：
```json
{
  "defaultMode": "full",
  "hideStatus": false,
  "quietStartup": false
}
```

## 开发

### 运行测试
```bash
npm test
```

### 构建
项目开箱即用，无需构建步骤。

## 许可证

MIT
