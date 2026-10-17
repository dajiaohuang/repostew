import { realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const core = fileURLToPath(new URL("../skills/repostew/", import.meta.url));
const entryType = "repostew.workspace";

function resolveWorkspace(path, cwd) {
  const absolute = realpathSync(resolve(cwd, path));
  if (!statSync(absolute).isDirectory()) throw new Error("RepoStew workspace must be a directory");
  return absolute;
}

export function workspaceFromBranch(ctx) {
  let workspace;
  for (const entry of ctx.sessionManager.getBranch()) {
    if (entry.type === "custom" && entry.customType === entryType) workspace = entry.data.workspace;
  }
  return workspace;
}

export function taskPrompt(workspace, task) {
  return `Read ${JSON.stringify(core + "SKILL.md")} and its applicable references. ` +
    `Use ${JSON.stringify(workspace)} as policy/state root.\n\n${task}`;
}

export default function repostew(pi) {
  let workspace;
  pi.registerFlag("repostew-workspace", { type: "string", description: "Bind RepoStew policy/state workspace" });
  function bind(absolute) {
    pi.appendEntry(entryType, { workspace: absolute });
    workspace = absolute;
  }
  function restore(ctx) {
    workspace = workspaceFromBranch(ctx);
  }
  pi.on("session_start", (event, ctx) => {
    restore(ctx);
    const path = pi.getFlag("repostew-workspace");
    if (event.reason === "startup" && path) bind(resolveWorkspace(path, ctx.cwd));
  });
  pi.on("session_tree", (_event, ctx) => restore(ctx));
  pi.on("before_agent_start", (event) => {
    delete event.systemPromptOptions.sections.repostew;
    if (workspace) event.systemPromptOptions.sections.repostew =
      `RepoStew workspace: ${JSON.stringify(workspace)}; policy/state authority stays there. ` +
      `For RepoStew assignments read ${JSON.stringify(core + "SKILL.md")} and applicable references. ` +
      `Native tools own execution, permissions and lifecycle; binding grants no task or authority.`;
  });
  pi.registerCommand("repostew-workspace", {
    description: "Bind RepoStew workspace without starting work",
    handler: async (args, ctx) => {
      if (!args.trim()) { ctx.ui.notify(workspace || "Usage: /repostew-workspace <directory>", "info"); return; }
      if (!ctx.isIdle()) { ctx.ui.notify("Wait until idle before rebinding the workspace", "warning"); return; }
      let absolute;
      try { absolute = resolveWorkspace(args.trim(), ctx.cwd); }
      catch (error) { ctx.ui.notify(error.message, "error"); return; }
      bind(absolute);
      ctx.ui.notify(`RepoStew workspace: ${workspace}`, "info");
    },
  });
  pi.registerCommand("repostew", {
    description: "Run a RepoStew task in the bound workspace",
    handler: async (args, ctx) => {
      if (!workspace || !args.trim()) {
        ctx.ui.notify("Bind /repostew-workspace <directory>, then /repostew <task>", "info"); return;
      }
      if (!ctx.isIdle()) { ctx.ui.notify("Use native steering/follow-up for same-task deltas", "warning"); return; }
      pi.sendUserMessage(taskPrompt(workspace, args));
    },
  });
}
