# RepoStew

面向多 agent harness 的可移植仓库维护 Skill：从发现、审计、投稿跟进到授权维护。Coordinator 按范围与权限组装 Worker；直接读写 Markdown，默认串行。

[English](README.en.md) · [完整入口](SKILL.md) · [网站](https://dajiaohuang.github.io/RepoStew_skills/)

## 全部流程

1. **准备与组装**：确定目标、范围、已有工作、权限和资源；[Coordinator](roles/coordinator.md) 按
   [组装规则](references/worker-assembly.md) 选择形态与方法，用 [prompt](prompts/README.md) 指派
   [Worker](roles/worker.md)，授权管理时加 [Maintainer](roles/maintainer.md)。[Harness](references/harness.md) 承载执行；[协作](references/orchestration.md)
   一次派发、等待结果、整合、增量续办、必要交接与局部恢复。
2. **选择形态**：[发现入库](references/work-forms/discovery.md)、[新库审计](references/work-forms/new-repository.md)、
   [投稿复审](references/work-forms/contribution-reassessment.md)、[增量反馈](references/work-forms/incremental-feedback.md)、
   [持续巡查](references/work-forms/recurring-patrol.md)。增量来源为
   [关注新 issue](references/workflows/followed-issues.md)、[通知／选定邮件](references/workflows/notifications.md)、
   [开放／未完成对象](references/workflows/open-objects.md)；分别抓取、去重、保留位置。
3. **调查**：[实际使用与文档查错](references/audit.md)，按 [贡献门槛](references/contribution-value.md) 证明错误；
   普通契约未定时据证讨论；所有新安全发现只走[私有报告](references/security.md)，不发公开 issue。完成审计范围后集中交付。
4. **交付与跟进**：[最小修复、验证、投稿](references/workflows/delivery.md)，遵守 [目标与安全门槛](references/safety.md)；
   处理反馈、合并同根因、在授权内撤回；[维护](references/workflows/maintain.md) 管理／自有库的 issue、PR、代码、文档与 CI/测试。
5. **记录与收尾**：[极简记录／授权迁移](references/records.md)、[历史核对／恢复／重分类](references/workflows/history.md)、
   [请求后的审阅备份](references/workflows/records-and-backup.md)、[源码准备与资源处置](references/storage.md)。
   覆盖、交付、解决和释放分别记录。

## 必须保留的边界

- 选择或继续 GitHub 工作前应用[用户指定排除规则](references/forges/github/exclusions/agentscan.md)；保留已有对象与历史，不推导撤回或删除权限。
- 范围与权限明确；角色、成员、历史和安装不授予权限或任务。默认串行，委派、并行、调度和外部操作按授权。
- 依据实际使用、契约及 [质量标准](references/contribution-value.md)，不虚构错误或必要性；禁止防御性编程，信任内部契约，保留必要边界校验。
- 同资源单写入者；Coordinator 写共享状态，Worker 写本库记录。保留无关、脏／未推送／未知／私密工作及恢复材料。
- 一次充分派发，按增量续办，信任可用结果；不例行收据、进度轮询或回读验收。
- 直接使用 Markdown，不建运行时／队列／claims／数据库；如实区分覆盖、结果、未完成工作和资源释放。

## 使用

使用工作区 RepoStew_skills/ 或 [Codex/Claude/Pi/OMP 接入包](integrations/README.md)。
优先适配 [Pi 工作区绑定](references/harnesses/pi.md) 与 [Codex 原生 Worker](references/harnesses/codex.md)，复用官方执行能力。
state/、work/<owner>/<repo>/ 和 state/maintained-repositories.md 保留在所选工作区。
[工作区布局](references/workspace.md) 定义成员名单、独立读取位置、每库 state.md/work.md 与 checkout/temp。
读取 SKILL.md，指定本次范围与权限；具体 harness 的能力需实际验证，规则不自动创建任务或计划。

[MIT](LICENSE)
