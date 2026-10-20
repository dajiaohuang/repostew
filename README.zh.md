# RepoStew

**让仓库工作持续推进的智能体执行 harness，任务不随一次对话结束。**

[English](README.md) · [项目页](https://dajiaohuang.github.io/repostew/index.zh.html) · [快速开始](harnesses/pi/README.md) · [治理接口](harnesses/pi/GOVERNANCE.md)

RepoStew 在 **Pi 原生会话**中运行 Coordinator 和 Worker，提供持久任务状态、公平调度、自主管队列和故障恢复。你可以从常用对话客户端通过 MCP 或 CLI 管理执行；任务由独立运行的服务持有。

仓库同时提供可独立使用的 **Skill**：用角色、任务模板和工作流指导仓库发现、审计、修复、投稿与后续维护。

## Harness 能做什么

| 能力 | 行为 |
| --- | --- |
| 原生 C/W 执行 | C 组织授权范围内的工作，W 完成仓库任务，也支持独立 W；续跑保留原 Pi 会话和累计限制。 |
| C 自主管队列 | 每个 C 可查看、调优先级、暂停、恢复和撤回自己符合条件的待执行任务；不同 owner 公平共享容量。 |
| 持久等待与续跑 | 子任务完成、容量释放和保留事件唤醒等待中的工作；定时等待有期限，外部等待需要相关新信息。 |
| 从常用客户端治理 | MCP / CLI 提供状态、任务分配、定向控制和操作回执；事件订阅向已配置客户端递送执行结果。 |
| 有证据的故障恢复 | 独立 guardian 允许一次暂停状态的重启；效果不明的操作保留待核对，不自动重放。 |

投稿完成即释放 W；后续 CLA 等个人签署事项由通知处理提醒用户。

## 如何协作

```text
你的治理客户端
        │ MCP / CLI · 命令、回执、事件
        ▼
本地执行服务
        ├── Coordinator → 自己的队列 → Workers
        ├── Coordinator → 自己的队列 → Workers
        └── 独立 Worker
                     │
               Pi 原生会话
                     │
            仓库工作区 + 平台投稿
```

本地服务统一持有执行状态和容量，项目占用防止并发写入。工作区 Markdown 记录仓库事实，运行时数据库记录执行状态。凭据和工作材料留在执行机器上。

## 快速开始

需要 **Node 24、Python 3、RTK 和 Pi 1.3.0**，并已登录模型提供方。

```sh
rtk git clone https://github.com/dajiaohuang/repostew.git
cd repostew/harnesses/pi
rtk npm ci --ignore-scripts
rtk node src/cli.mjs init
```

编辑 `config.local.json`，填写已安装的 Pi CLI 路径、工作区以及已配置的提供方和模型，然后运行：

```sh
rtk node src/cli.mjs start
rtk node src/cli.mjs governance
```

服务以**暂停状态**启动。按[治理指南](harnesses/pi/GOVERNANCE.md)连接客户端、分配有明确范围的任务并恢复执行。安装不会自动派发任务。

## 多台电脑

[Fleet 基础](harnesses/pi/FLEET.md)提供显式机器注册、SSH 传输、项目放置和持久操作回执。每台电脑保留自己的服务、凭据和文件。

| 平台 / 层级 | 当前状态 |
| --- | --- |
| Windows 执行 | 使用原生 Job Object 管理进程归属；已执行原生进程及恢复测试。 |
| Linux / macOS | 已实现传输和进程组支持；完整后代进程约束尚未验证，无人值守 C/W 替换尚未就绪。 |
| Fleet | 注册、gateway 和回执测试通过；真实多机执行尚未验收，未实现自动迁移或故障转移。 |

发布校验：Windows 上 **76 项测试通过，1 项 POSIX 原生测试跳过**。参见[实现来源](harnesses/pi/PI-IMPLEMENTATION.md)。

## 单独使用 Skill

[Skill 入口](SKILL.md)可独立于执行服务使用，覆盖仓库发现、实际使用链路调查、修复与直接 PR/MR 投稿、反馈、授权维护及资源处置。

在兼容 harness 中加载[接入包](integrations/README.md)，或从 checkout 读取 Skill。任务状态保存在你选择的工作区。

## 文档

| 入口 | 内容 |
| --- | --- |
| [运行时设置](harnesses/pi/README.md) | 安装与本地验证 |
| [治理](harnesses/pi/GOVERNANCE.md) | MCP / CLI、分配、队列控制和恢复 |
| [事件订阅](harnesses/pi/EVENT-SUBSCRIPTIONS.md) | 结果递送与客户端唤醒 |
| [Fleet](harnesses/pi/FLEET.md) | 注册、SSH、项目放置和回执 |
| [Skill 与工作流索引](SKILL.md) | 角色、仓库工作与权限范围 |

[MIT](LICENSE)
