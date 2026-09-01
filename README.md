# MyAnget

Project management基座 for critical software projects. Manages code, documentation, design, dependencies, and testing.

## Features

- **Code Quality**: Review code for quality, security, performance, and maintainability.
- **Documentation**: Generate and maintain README, API docs, architecture docs, and changelogs.
- **Design Management**: Record design decisions, manage architecture patterns, ensure consistency.
- **Dependency Management**: Check security vulnerabilities, update dependencies, verify license compliance.
- **Test Coverage**: Analyze test coverage, improve test quality, plan automation.
- **团队规范**: 包含完整的团队规范体系，涵盖核心原则、编码规范、项目管理、协作、安全、性能、测试、文档等方面。

## Supported Platforms

- Claude Code
- Codex
- Qoder
- OpenCode
- Trae
- Pi agent
- CodeBuddy

## Installation

### Claude Code
```bash
/plugin marketplace add yourname/myanget
/plugin install myanget@myanget
```

### Codex
```bash
codex plugin marketplace add yourname/myanget
codex plugin add myanget@myanget
```

### OpenCode
Add to `opencode.json`:
```json
{ "plugin": ["@yourname/myanget"] }
```

### Pi Agent
```bash
pi install git:github.com/yourname/myanget
```

### Other Platforms
Copy the appropriate rule files from this repository to your project.

## Usage

### Commands
- `/myanget [lite|full|ultra|off]` - Switch intensity level
- `/myanget-project-status` - Check project status
- `/myanget-code-review` - Review code quality
- `/myanget-doc-gen` - Generate documentation
- `/myanget-design-manage` - Manage design decisions
- `/myanget-dependency-manage` - Manage dependencies
- `/myanget-test-coverage` - Manage test coverage

### Modes
- **lite**: Basic project management with suggestions
- **full**: Comprehensive project management (default)
- **ultra**: Strict project management with maximum oversight

## 团队规范体系

MyAnget 包含完整的团队规范体系，基于 Ponytail 项目的优秀实践，针对团队使用场景进行了优化。

### 规范文件位置
```
.myanget/rules/
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

## Configuration

### Environment Variables
- `MYANGET_DEFAULT_MODE`: Set default mode (lite/full/ultra/off)
- `MYANGET_HIDE_STATUS`: Hide status indicator
- `MYANGET_QUIET_STARTUP`: Suppress startup notification

### Config File
`~/.config/myanget/config.json`:
```json
{
  "defaultMode": "full",
  "hideStatus": false,
  "quietStartup": false
}
```

## Development

### Testing
```bash
npm test
```

### Building
The project is ready to use as-is. No build step required.

## License

MIT