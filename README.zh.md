# RepoStew

**可靠的智能体执行与可移植的仓库工作流，同处一个仓库。**

[English](README.md) · [项目页](https://dajiaohuang.github.io/repostew/index.zh.html)

## 选择组件

| | 执行 Harness | 仓库 Skill |
| --- | --- | --- |
| 用途 | 运行并治理持续进行的智能体任务 | 定义仓库调查、交付与维护方法 |
| 包含 | Pi 原生会话、C 自主管队列、持久续跑、恢复、MCP / CLI 和多机基础 | 角色、任务模板、工作流规则和平台接入 |
| 目录 | [`harnesses/pi/`](harnesses/pi/) | [`skill/`](skill/) |
| 入口 | [Harness README](harnesses/pi/README.zh.md) | [Skill README](skill/README.zh.md) |

Harness 管**执行**：任务生命周期、容量、项目占用和操作回执。
Skill 管**工作流**：调查、修复、投稿、反馈和授权维护。

Skill 可在兼容智能体环境中独立使用，也可搭配 Harness。
Harness 通过 `policyDir` 加载 Skill，目前仍保留面向仓库的任务与项目概念。

已接入[全部 19 类工作流](harnesses/pi/WORKFLOWS.md)：完整规范与表单、来源捕获、
GitHub/GitLab 读取、持续巡检、交付、维护、记录、备份和授权清理。
[运行问题与恢复](harnesses/pi/OPERATIONS.md)说明实际阻塞带来的改进，以及仍需外部工具和平台支持的部分。

## 推荐运行形态

- **OpenRig + Pi：**OpenRig 管原生席位、队列和恢复，搭配 RepoStew 集成 C/W 契约与 Pi 扩展。参见从实际独立组部署提炼的[配置模板与激活指南](examples/openrig-pi/README.zh.md)。
- **独立 RepoStew Pi Harness：**使用下文的内置执行服务。
- **仅 Skill：**在其他兼容宿主中使用可移植工作流。

每个任务只选一个执行所有者。OpenRig 模板不会启动集群或修改现有 Harness 配置；原生 Windows OpenRig 仍为实验形态。

## 当前统一口径

以[Skill](skill/SKILL.md)、[C/W职责](skill/roles/coordinator.md)和[固定合同＋短事实](skill/prompts/fixed-context.md)为当前规则。
C只筛选、分派、登记和续派，无审批或工程验收权。W独立完成理解、修复、目标要求的测试、直接投稿、投稿链接登记、可行任务内清理六步后交回容量。
W依据真实身份和权利事实自主完成所需条款、CLA/DCO；投稿后不例行查等CI、不加二次验收。私密发送／处置仅按用户明确范围执行。
OpenRig示例与独立执行器提示词采用同一合同；每项任务只选一个执行owner。包版本0.5.1，原生Pi扩展版本0.5.1，本次统一为同一发布版本。

## 目录

```text
repostew/
├── harnesses/
│   └── pi/          执行运行时、智能体、测试和设置
├── skill/
│   ├── SKILL.md     规范工作流入口
│   ├── roles/       角色职责
│   ├── prompts/     任务模板
│   ├── references/  工作流与平台规则
│   ├── integrations/ 平台接入包
│   └── scripts/     Skill 构建与验证
└── docs/            中英文项目网站
```

## 开始

- **运行智能体：**按 [Harness 设置](harnesses/pi/README.zh.md)安装，再看[治理指南](harnesses/pi/GOVERNANCE.md)。服务以暂停状态启动。
- **使用工作流：**先看 [Skill 介绍](skill/README.zh.md)，再加载 [skill/SKILL.md](skill/SKILL.md)。
- **连接多台电脑：**参见 [Fleet 设置与就绪状态](harnesses/pi/FLEET.md)。Windows 原生进程测试已执行；Linux/macOS 完整进程约束和真实多机验收尚未完成。

运行时数据库、凭据和任务工作区留在本地。安装任一组件不会自动派发任务。

## 原有用户

Skill 源文件从仓库根目录移到 `skill/`。请更新源码路径；
使用 Harness 示例配置时，将 `policyDir` 设为 `../../skill`。
Skill 构建与检查命令改在 `skill/` 中执行，生成包的内部结构保持不变。
根目录 [SKILL.md](SKILL.md)保留为导航入口。

[MIT](LICENSE)

Pi扩展现分为 `pi-repostew.js`（RepoStew业务）和 `pi-openrig.js`（中立OpenRig桥接）；共享 `pi-runtime.js` 仅提供通用机制。默认只加载业务模块，桥接可单独或组合使用。配置分别在 `repostew.json` 与 `openrig-pi.json`；旧 `pi-native.js` 仅保留兼容。
