# RepoStew

面向多 agent harness 的仓库维护 Skill。Coordinator 按范围与权限组装 Worker；直接读写 Markdown，默认串行。

[English](README.en.md) · [完整入口](SKILL.md) · [网站](https://dajiaohuang.github.io/RepoStew_skills/)

## 全部流程

1. **准备与组装**：确定目标、范围、已有工作、权限和资源；[Coordinator](roles/coordinator.md) 按
   [组装规则](references/worker-assembly.md) 选择形态与方法，用 [prompt](prompts/README.md) 指派
   [Worker](roles/worker.md)。[Harness](references/harness.md) 承载执行；[协作](references/orchestration.md)
   一次派发、等待结果、整合、增量续办、必要交接与局部恢复。
2. **选择形态**：[发现入库](references/work-forms/discovery.md)、[新库审计](references/work-forms/new-repository.md)、
   [投稿复审](references/work-forms/contribution-reassessment.md)、[增量反馈](references/work-forms/incremental-feedback.md)、
   [持续巡查](references/work-forms/recurring-patrol.md)。增量来源为
   [关注新 issue](references/workflows/followed-issues.md)、[通知／选定邮件](references/workflows/notifications.md)、
   [开放／未完成对象](references/workflows/open-objects.md)；分别抓取、去重、保留位置。
3. **调查**：[实际使用与文档查错](references/audit.md)，按 [贡献门槛](references/contribution-value.md) 证明错误；
   有证据但契约未定时讨论；[安全调查与私密披露](references/security.md) 独立处理。完成审计范围后集中交付。
4. **交付与跟进**：[最小修复、验证、投稿](references/workflows/delivery.md)，遵守 [目标与安全门槛](references/safety.md)；
   处理反馈、合并同根因、在授权内撤回。优先普通 Open PR；无合格发现可直接结束。
5. **记录与收尾**：[极简记录／授权迁移](references/records.md)、[历史核对／恢复／重分类](references/workflows/history.md)、
   [请求后的审阅备份](references/workflows/records-and-backup.md)、[源码准备与资源处置](references/storage.md)。
   覆盖、交付、解决和释放分别记录。

## 必须保留的边界

- 修复必须有实际错误；禁止防御性编程，内部信任契约、源头修错，必要边界校验保留。
- 文件可读就按需读取；否则传完整适用正文。角色在 roles/，模板在 prompts/，专项规则在
  [references/forges/](references/forges/README.md) 保存原生 CLI 映射及仓库规则；不复制政策或给每个 Worker 装载全部方法。
- Worker 写本库记录，Coordinator 写共享名单／位置；同文件单写入者。先完成指定投稿复审，再补入新库。
- 并行、调度、公共操作、撤回和清理只按授权；保留脏／未推送／未知／私密数据及恢复材料。
- [巡查配置](references/patrols.md) 不代表执行完成；暂停任务保持暂停。只读选定邮件，不发邮件，不改已读／订阅。
- 复用未变证据，必要检查照做；不例行回读验收、轮询进度或新增 PR 审查阶段。资源检查不授予删除权限。

## 使用

使用工作区 RepoStew_skills/ 或 [Codex/Claude/Pi/OMP 接入包](integrations/README.md)。
优先适配 [Pi 工作区绑定](references/harnesses/pi.md) 与 [Codex 原生 Worker](references/harnesses/codex.md)，复用官方执行能力。
state/、work/<owner>/<repo>/ 和 MAINTAINED_REPOSITORIES.md 保留在所选工作区。
[工作区布局](references/workspace.md) 定义成员名单、独立读取位置、每库 state.md/work.md 与 checkout/temp。
读取 SKILL.md，指定本次范围与权限；具体 harness 的能力需实际验证，规则不自动创建任务或计划。

[MIT](LICENSE)
