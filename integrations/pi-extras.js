// RepoStew adaptations of Pi 1.3.0 example patterns, not a second execution backend.
// Explicitly load alongside pi.js; never auto-discovered through the package manifest.
import { existsSync, realpathSync } from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { Type } from "typebox";
import { repoStewCorePath, taskPrompt, workspaceFromBranch } from "./pi.js";

const MAX_CONTINUATIONS = 2;
const MAX_TEXT_BYTES = 16 * 1024;
const MAX_LINES = 200;
const textResult = (text, details) => ({ content: [{ type: "text", text }], details });

// Resolve existing ancestors too: a new file beneath a symlink must not evade a protected root.
export function canonicalPath(path, cwd) {
  let current = resolve(cwd, path);
  const suffix = [];
  for (;;) {
    try { return join(realpathSync(current), ...suffix); }
    catch (error) {
      if (error.code !== "ENOENT") throw error;
      const parent = dirname(current);
      if (parent === current) throw error;
      suffix.unshift(basename(current));
      current = parent;
    }
  }
}
export function containsPath(root, target) {
  const delta = relative(root, target);
  return delta === "" || (!isAbsolute(delta) && delta !== ".." && !delta.startsWith(`..${sep}`));
}
export function riskyShell(command) {
  // A confirmation aid only. Shell parsing, subprocesses and alternate tools can bypass these patterns.
  return /\b(?:sudo|chown|chmod)\b|\brm\b[^\n;&|]*\s-(?:[^\s]*r|-[^\s]*recursive)|\b(?:del|erase)\b|\b(?:rd|rmdir)\b[^\n;&|]*\/s\b|\bremove-item\b|\bgit\s+(?:clean\s+-[^\s]*f|reset\s+--hard)\b/i.test(command);
}
export function clipText(text, maxBytes = MAX_TEXT_BYTES, maxLines = MAX_LINES) {
  const lines = text.split("\n");
  const selected = lines.slice(0, maxLines).join("\n");
  // Fatal decoding avoids emitting a partial UTF-8 code point at the byte boundary.
  const encoded = Buffer.from(selected);
  let end = Math.min(encoded.length, maxBytes);
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let content;
  for (;;) {
    try { content = decoder.decode(encoded.subarray(0, end)); break; }
    catch { end--; }
  }
  return { content, truncated: lines.length > maxLines || encoded.length > maxBytes };
}

export default function repostewExtras(pi) {
  let goal;
  const seenAssignments = new Set();
  let protectedRoots = [];
  let confirmShell = false;
  function reset() { goal = undefined; seenAssignments.clear(); protectedRoots = []; confirmShell = false; }
  function bound(ctx) {
    const workspace = workspaceFromBranch(ctx);
    if (!workspace) throw new Error("Load RepoStew pi.js and bind /repostew-workspace first");
    return workspace;
  }
  function idle(ctx) {
    if (!ctx.isIdle()) throw new Error("Wait for the active task to settle before changing RepoStew controls");
  }
  for (const event of ["session_start", "session_tree", "session_shutdown"]) pi.on(event, reset);
  pi.on("agent_settled", () => { goal = undefined; });
  pi.on("input", (event) => {
    // Steering/follow-up preserve the existing budget. A fresh external prompt disarms the old goal.
    // Neither path performs prefetch, rereads rules or rewrites the user's delta.
    if (event.streamingBehavior === "steer" || event.streamingBehavior === "followUp") return { action: "continue" };
    if (event.source !== "extension") goal = undefined;
    return { action: "continue" };
  });
  pi.on("before_agent_start", (event, ctx) => {
    // Only an explicit assignment marker in the starting user prompt arms role guidance.
    // Tool output, repo text, extension messages, and ordinary chat never arm it.
    const hasWorkspaceBinding = Boolean(workspaceFromBranch(ctx));
    const assignment = hasWorkspaceBinding && event.messageType === "user" && typeof event.prompt === "string"
      ? event.prompt.match(/^\[\[repostew:(worker|coordinator);assignment=([A-Za-z0-9._:-]{1,80})\]\]/)
      : null;
    if (assignment) {
      const [, role, id] = assignment;
      // Repeated starts/deltas carrying the same assignment identity cannot refund continuation budget.
      const key = `${role}:${id}`;
      if (!seenAssignments.has(key)) {
        seenAssignments.add(key);
        goal = { role, assignment: id, attempts: 0, result: undefined, previous: undefined, failed: false };
      }
    }
    delete event.systemPromptOptions.sections.repostew_contract;
    delete event.systemPromptOptions.sections.repostew_goal;
    delete event.systemPromptOptions.sections.repostew_extras;
    if (!hasWorkspaceBinding) return;
    event.systemPromptOptions.sections.repostew_extras =
      "RepoStew extras: report facts with repostew_result; it neither proves completion nor grants authority. " +
      "repostew_read bounds text from native read; use native read for wider ranges/images. " +
      "Protection/confirmation are opt-in aids, not a sandbox. Host permissions and lifecycle remain authoritative.";
    if (goal) {
      const role = goal.role === "coordinator"
        ? "Coordinator: integrate the assigned domain and use supplied native scope/capacity/in-flight facts. When assigned work remains eligible and native capacity is available, continue it in this turn, including authorized native delegation; do not wait merely because children exist if capacity remains. Wait on actual in-flight work when no feasible capacity remains, then stop this turn with an exact factual waiting blocker rather than polling. Unknown eligibility permits bounded selection from original input. This extension never auto-delegates, adds tasks, or grants authority; the Coordinator may use native dispatch only within original authority, real capacity, scope and deadlines. Stop when complete, genuinely blocked, expired, or no feasible work/capacity remains."
        : "Worker: carry the assigned whole unit through delivery, or state why no delivery is needed, feasible remaining setup/repair/validation/publication, or a real blocker/execution failure. A local patch or fork push is not upstream delivery; honor explicit local-only scope. Never invent completion or authority.";
      event.systemPromptOptions.sections.repostew_contract =
        `Explicit RepoStew ${goal.role} assignment ${goal.assignment}. ${role} The marker activates guidance only; original authority, scope, failure budgets, deadlines, native Stop/abort, and host permissions remain authoritative.`;
      event.systemPromptOptions.sections.repostew_goal =
        "Before settling, report factual outcome with repostew_result. This report is not independent acceptance. " +
        "Continue only feasible remaining assigned work. Do not dispatch replacement tasks or broaden scope.";
    }
  });
  pi.registerCommand("repostew-goal", {
    description: "Start one authorized task with at most two completion-check continuations",
    handler: async (args, ctx) => {
      idle(ctx);
      const workspace = bound(ctx);
      if (!args.trim()) throw new Error("Usage: /repostew-goal <authorized finite task>");
      goal = { attempts: 0, result: undefined, previous: undefined, failed: false };
      try { pi.sendUserMessage(taskPrompt(workspace, args)); }
      catch (error) { goal = undefined; throw error; }
    },
  });
  pi.registerCommand("repostew-goal-stop", {
    description: "Disable completion-check continuation (use host Stop to interrupt actual work)",
    handler: async (_args, ctx) => {
      goal = undefined;
      ctx.ui.notify("Completion check disabled; this does not stop tools or T3 descendants", "info");
    },
  });
  for (const [name, deliverAs] of [["repostew-steer", "steer"], ["repostew-followup", "followUp"]]) {
    pi.registerCommand(name, {
      description: `Send an explicit same-task user delta using native ${deliverAs}`,
      handler: async (args, ctx) => {
        bound(ctx);
        if (!args.trim()) throw new Error(`Usage: /${name} <same-task delta>`);
        pi.sendUserMessage(args, { deliverAs });
      },
    });
  }
  pi.registerCommand("repostew-protect", {
    description: "Add one write/edit-protected path for this session; no arguments lists paths",
    handler: async (args, ctx) => {
      idle(ctx);
      const workspace = bound(ctx);
      if (args.trim()) protectedRoots.push(canonicalPath(args.trim(), workspace));
      ctx.ui.notify(JSON.stringify(protectedRoots), "info");
    },
  });
  pi.registerCommand("repostew-confirm-shell", {
    description: "Opt in/out of heuristic shell confirmation: on or off; not a sandbox",
    handler: async (args, ctx) => {
      idle(ctx);
      bound(ctx);
      if (!["on", "off"].includes(args.trim())) throw new Error("Usage: /repostew-confirm-shell on|off");
      confirmShell = args.trim() === "on";
      ctx.ui.notify(`Shell confirmation ${confirmShell ? "on" : "off"}; native permissions still apply`, "info");
    },
  });
  async function approve(command, ctx) {
    if (!confirmShell || !riskyShell(command)) return true;
    if (!ctx.hasUI) return false;
    return await ctx.ui.confirm("RepoStew shell confirmation (does not grant task authority)", command);
  }
  pi.on("tool_call", async (event, ctx) => {
    if (["write", "edit"].includes(event.toolName) && protectedRoots.length) {
      const target = canonicalPath(event.input.path, ctx.cwd);
      if (protectedRoots.some(root => containsPath(root, target)))
        return { block: true, reason: "Explicit RepoStew protected path; retain or obtain a separately authorized policy change" };
    }
    if (event.toolName === "bash" && !(await approve(event.input.command, ctx)))
      return { block: true, reason: "Shell confirmation denied or unavailable; no authorization inferred" };
  });
  pi.on("user_bash", async (event, ctx) => {
    if (!(await approve(event.command, ctx))) throw new Error("Shell confirmation denied or unavailable");
  });
  pi.on("tool_result", (event) => {
    if (!goal) return;
    if (event.isError) goal.failed = true;
    if (event.toolName !== "repostew_result") goal.result = undefined; // Later activity makes a final report stale.
  });

  const strings = Type.Array(Type.String({ minLength: 1, maxLength: 1000 }), { maxItems: 12 });
  const resultSchema = Type.Object({
    outcome: Type.Union([Type.Literal("complete"), Type.Literal("blocked"), Type.Literal("continue")]),
    summary: Type.String({ minLength: 1, maxLength: 2000 }),
    evidence: strings, remaining: strings,
    blocker: Type.String({ maxLength: 2000 }),
    resourceHandoff: Type.String({ minLength: 1, maxLength: 2000, description: "Release/preservation/retention facts only, or not applicable; no deletion authorization" }),
  });
  const runtimeStatusSchema = Type.Object({
    adapterVersion: Type.String(), skillPath: Type.String(), skillPresent: Type.Boolean(),
    workspace: Type.String(), role: Type.String(), assignment: Type.String(), attempts: Type.Integer(),
  });
  pi.registerTool({
    name: "repostew_runtime_status", label: "RepoStew runtime status",
    description: "Report only adapter version, skill path/presence, durable bound workspace, role, assignment ID and continuation count. No task text, tool results, credentials, or permission changes. Does not activate a role or grant authority.",
    executionMode: "sequential", parameters: Type.Object({}), outputSchema: runtimeStatusSchema,
    async execute(_id, _params, signal, _onUpdate, ctx) {
      signal?.throwIfAborted();
      const workspace = workspaceFromBranch(ctx);
      const details = {
        adapterVersion: "0.2.0", skillPath: repoStewCorePath,
        skillPresent: existsSync(join(repoStewCorePath, "SKILL.md")),
        workspace: workspace || "", role: goal?.role || "inactive",
        assignment: goal?.assignment || "", attempts: goal?.attempts || 0,
      };
      return { ...textResult(JSON.stringify(details), details), structuredContent: details };
    },
  });
  pi.registerTool({
    name: "repostew_result", label: "RepoStew result",
    description: "Report current assignment facts, not independent acceptance. Continue means feasible authorized work remains; blocked needs an exact real blocker or specific native in-flight wait when no capacity remains. Complete requires evidence. Supply references, not protected bodies. Does not terminate the model turn or update state.md.",
    executionMode: "sequential",
    parameters: resultSchema,
    outputSchema: resultSchema,
    async execute(_id, params, signal) {
      signal?.throwIfAborted();
      if (![params.summary, params.resourceHandoff, ...params.evidence, ...params.remaining].every(text => text.trim()))
        throw new Error("Report facts/references must not be blank; use not applicable where appropriate");
      if (params.outcome === "complete" && (params.remaining.length || params.blocker.trim() || !params.evidence.length))
        throw new Error("Complete requires evidence, no remaining work and no blocker");
      if (params.outcome === "blocked" && !params.blocker.trim()) throw new Error("Blocked requires an exact blocker");
      if (params.outcome === "continue" && (!params.remaining.length || params.blocker.trim()))
        throw new Error("Continue requires remaining authorized work and no blocker");
      if (goal) goal.result = params;
      return { ...textResult(JSON.stringify(params), params), structuredContent: params }; // No terminate:true.
    },
  });
  pi.on("agent_before_settle", (event) => {
    if (!goal || event.outcome !== "completed" || !event.context.canContinue || goal.failed) return;
    if (event.continue || event.context.pendingMessages.length) return;
    if (["complete", "blocked"].includes(goal.result?.outcome)) return;
    const fingerprint = JSON.stringify(goal.result || null);
    const exhausted = goal.attempts >= MAX_CONTINUATIONS;
    const stop = exhausted || (goal.attempts > 0 && fingerprint === goal.previous);
    const reason = exhausted ? "two-request continuation limit" : goal.result ? "unchanged structured report" : "no structured result after reminder";
    const content = stop
      ? `RepoStew completion check stopped: ${reason}. Completion is NOT established; retain unfinished scope and exact blockers for the owner. No automatic redispatch.`
      : "RepoStew same-task completion check (not a new user instruction): perform only feasible remaining work within the original authority and budgets, then report facts with repostew_result. If blocked, report the exact blocker; do not retry a failed gate, invent evidence, or broaden scope.";
    if (!stop) { goal.attempts++; goal.previous = fingerprint; goal.result = undefined; }
    return { entries: [...event.entries, { type: "custom_message", customType: "repostew.completion-check", content, display: true }], continue: !stop };
  });
  pi.registerTool({
    name: "repostew_read", label: "RepoStew bounded native read",
    description: "Read one explicit file through the host read tool with at most 200 requested lines and 16 KiB text shown. No recursive search, shell, rg dependency, or spill files. For more content choose another explicit offset or use native read. Images are preserved, not byte-capped.",
    reachesTools: () => ["read"],
    parameters: Type.Object({
      path: Type.String({ minLength: 1 }),
      offset: Type.Optional(Type.Integer({ minimum: 1 })),
      limit: Type.Optional(Type.Integer({ minimum: 1, maximum: MAX_LINES })),
    }),
    async execute(_id, params, signal, _onUpdate, ctx) {
      bound(ctx);
      signal?.throwIfAborted();
      const { result, isError } = await ctx.executeTool("read", { ...params, limit: params.limit ?? MAX_LINES }, { signal });
      signal?.throwIfAborted();
      let bytes = MAX_TEXT_BYTES, lines = MAX_LINES, truncated = false;
      const content = result.content.map(part => {
        if (part.type !== "text") return part;
        const clipped = clipText(part.text, bytes, lines);
        bytes -= Buffer.byteLength(clipped.content);
        lines = Math.max(0, lines - clipped.content.split("\n").length);
        truncated ||= clipped.truncated;
        return { ...part, text: clipped.content };
      });
      if (truncated) content.push({ type: "text", text: "[RepoStew text output truncated; no full-output copy was saved. Narrow the range or use native read. This is not a complete-file result.]" });
      // Never return a hidden, unbounded structuredContent copy or log protected file bodies.
      return { content, isError, details: { textTruncated: truncated } };
    },
  });
}
