# RepoStew Skill

**可移植的仓库发现、修复、投稿与维护工作流。**

[English](README.md) · [加载 Skill](SKILL.md) · [接入包](integrations/README.md) · [仓库总览](../README.zh.md)

Skill 定义智能体如何调查实际使用、完成有界仓库任务、发布修复和处理反馈，
提供角色、任务模板与工作流规则。执行由你使用的 harness 承担。

## 包含什么

| 目录 | 职责 |
| --- | --- |
| [SKILL.md](SKILL.md) | 入口及完整工作流索引 |
| [roles/](roles/) | Supervisor、Coordinator、Worker 与 Maintainer 职责 |
| [prompts/](prompts/README.md) | 任务表单、续跑与交接模板 |
| [references/](references/) | 调查、交付、反馈、状态与资源规则 |
| [integrations/](integrations/README.md) | 支持平台的接入包与适配 |

## 使用

1. 在兼容智能体环境中加载 [SKILL.md](SKILL.md)。
2. 在源码目录之外选择工作区，保存项目记录和工作材料。
3. 使用链接中的角色与任务表单，分配范围明确的工作。

Skill 不启动执行服务，可独立于 [RepoStew Harness](../harnesses/pi/README.md) 使用。
Harness 也可以通过 `policyDir` 配置加载本目录。

## 构建与验证

在当前目录执行：

```sh
rtk python scripts/validate-policy.py
rtk python scripts/test-policy-boundaries.py
rtk python scripts/build-package.py
rtk python scripts/validate-package.py
```

生成的接入包位于 `dist/repostew/`；再次构建时使用 `--output <新目录>`。
按[接入说明](integrations/README.md)安装。生成副本不作为源文件修改。

通用工作流保持 harness 无关；平台行为放在适配器和 [harness 参考](references/harness.md)中。

[MIT](../LICENSE)
