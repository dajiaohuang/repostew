# RepoStew Pi Harness

**面向持续仓库工作的智能体执行服务。**

[English](README.md) · [仓库总览](../../README.zh.md) · [配套 Skill](../../skill/README.zh.md)

Harness 使用 Pi 原生会话、RPC、工具和结构化结果，负责执行生命周期。
仓库调查、交付与维护的方法放在独立的 `skill/` 组件。

## 能力

**[全部 19 类工作流](WORKFLOWS.md)** 已接入：发现、审计、反馈、巡检、实际使用调查、
私密报告、交付、维护、记录、备份与授权清理。每次任务装配完整 Skill、角色和表单，
按实际动作读取规范；源码保持一份。具体执行仍需要相应的工具、账户与目标平台能力。

- **原生 C/W：**Coordinator 组织工作，Worker 完成任务，也支持独立 W。
- **自主管队列：**C 查看、调优先级、暂停、恢复或撤回自己的符合条件的任务。
- **持久续跑：**按子任务结果、容量或相关事件恢复等待，保留原会话及累计限制。
- **治理与恢复：**MCP / CLI、操作回执、定向控制、独立 guardian 和事件订阅。
- **多机基础：**显式注册、SSH 传输、项目放置和回执核对。

投稿完成即释放 W；后续 CLA 等个人事项由通知处理提醒用户。

## 开始

需要 Node 24、Python 3、RTK、Pi 1.3.0，并已登录模型提供方。
在本目录运行：

```sh
rtk npm ci --ignore-scripts
rtk node src/cli.mjs init
```

编辑 `config.local.json`：设置 Pi CLI、工作区、提供方和模型。
`policyDir` 指向 `../../skill`。然后：

```sh
rtk node src/cli.mjs start
rtk node src/cli.mjs governance
```

服务以暂停状态启动。按[治理指南](GOVERNANCE.md)连接客户端、分配任务并恢复执行。

## 文档与验证

| 入口 | 内容 |
| --- | --- |
| [工作流与来源](WORKFLOWS.md) | 全部流程、来源配置、捕获、GitHub/GitLab 和持续巡检 |
| [阻塞与恢复](OPERATIONS.md) | 实际工作暴露的问题、改进和保留边界 |
| [治理](GOVERNANCE.md) | 分配、队列控制、回执和恢复 |
| [事件订阅](EVENT-SUBSCRIPTIONS.md) | 结果递送与客户端唤醒 |
| [多机](FLEET.md) | 注册、SSH、项目放置和就绪状态 |
| [实现来源](PI-IMPLEMENTATION.md) | 原生组件和验证说明 |

```sh
rtk npm run check
rtk npm test
```

Windows 使用原生 Job Object 管理进程归属。Linux/macOS 的完整后代进程约束和真实多机执行尚未验收。
本次 Windows 源码验证：88 项通过，1 项 POSIX 原生测试跳过；新增来源适配器使用隔离测试数据。
运行时数据库、凭据与任务材料留在本地；源码发布不会自动更新运行中的服务。
