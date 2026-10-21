// RepoStew's Pi extension. Uses the official prompt-customizer, tools and
// reload-runtime patterns; Pi owns tools/lifecycle and the host owns scheduling.
import { readFileSync, realpathSync } from "node:fs";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { Type } from "typebox";

export const VERSION = "0.4.1";

// A projection of native ownership, never a reservation or a second queue.
export function deriveSlots(binding, nodes, rows) {
  const active = rows.filter(row => !["done", "canceled"].includes(row.state));
  return binding.workers.map(seat => {
    const node = nodes.find(item => item.canonicalSessionName === seat);
    const assignments = active.filter(row => row.destinationSession === seat);
    const returns = active.filter(row => row.destinationSession === binding.coordinator && row.sourceSession === seat);
    let state = "unknown";
    if (assignments.length) state = "occupied";
    else if (returns.length) state = "awaiting-coordinator";
    else if (node?.intentionallyStopped || node?.sessionStatus === "exited") state = "stopped";
    else if (node?.activityState?.needsInput?.count > 0) state = "needs-input";
    else if (node?.agentActivity?.state === "running") state = "busy";
    else if (node?.sessionStatus === "running" && node?.startupStatus === "ready"
      && node?.activityState?.activity === "idle-at-prompt"
      && node.activityState.needsInput?.count === 0
      && !node.heldReason && !node.assignedWorkCount) state = "available";
    return { seat, state, assignments: assignments.map(row => row.qitemId),
      pendingResults: returns.map(row => row.qitemId), model: node?.model ?? null,
      activity: node?.agentActivity?.state ?? "unknown" };
  });
}

export async function readOpenRigSlots(binding, signal) {
  if (!binding?.url || !binding.rig || !binding.coordinator || !Array.isArray(binding.workers))
    throw new Error("No explicit OpenRig slot binding in repostew.json");
  const origin = new URL(binding.url);
  if (origin.username || origin.password || !["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname))
    throw new Error("OpenRig slot reader requires an explicitly configured local daemon");
  const get = async path => {
    const response = await fetch(new URL(path, origin), {
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error(`OpenRig read failed: HTTP ${response.status}`);
    return response.json();
  };
  const rigs = await get("/api/ps");
  const rig = rigs.find(item => item.name === binding.rig);
  if (!rig) throw new Error("Configured OpenRig rig is absent");
  // Read all active owners, not only this campaign: unrelated work also occupies a seat.
  const query = new URLSearchParams({ rig: binding.rig, activeOnly: "1", compact: "1", limit: "10000" });
  const [nodes, rows, execution] = await Promise.all([
    get(`/api/rigs/${encodeURIComponent(rig.rigId)}/nodes`), get(`/api/queue/list?${query}`),
    get("/api/views/execution"),
  ]);
  if (!Array.isArray(nodes) || !Array.isArray(rows) || rows.length >= 10000)
    throw new Error("Incomplete native slot input; reconcile through native CLI");
  const slots = deriveSlots(binding, nodes, rows);
  return { observedAt: new Date().toISOString(), rig: binding.rig,
    sharedIdleCapacity: execution.rows?.[0]?.q6_parallelism?.idle_seats_with_capacity ?? { value: null, basis: "native view unavailable" },
    sharedIdleScope: "daemon-wide native execution view; all Coordinators share this signal; includes seats outside this assignment",
    slots,
    available: slots.filter(slot => slot.state === "available").map(slot => slot.seat),
    pendingCoordinatorItems: rows.filter(row => row.destinationSession === binding.coordinator).map(row => ({
      id: row.qitemId, state: row.state, source: row.sourceSession, handedOffFrom: row.handedOffFrom,
    })),
    reservation: false, processClearance: false,
    nextAction: "Consume native results, reconcile owned processes, then dispatch available authorized work. Unknown is not free. Use native handoff wake; no additional polling loop." };
}

export function loadProfile(agentDir) {
  let profile;
  try { profile = JSON.parse(readFileSync(join(agentDir, "repostew.json"), "utf8")); }
  catch (error) { if (error.code === "ENOENT") return undefined; throw error; }
  if (profile.version !== 1 || !["general", "coordinator", "worker"].includes(profile.role))
    throw new Error("Unsupported RepoStew Pi profile");
  if (!isAbsolute(profile.workspace)) throw new Error("RepoStew workspace must be absolute");
  if (profile.seatGuidance && !isAbsolute(profile.seatGuidance))
    throw new Error("RepoStew seat guidance must be an absolute file path");
  profile.workspace = realpathSync(profile.workspace);
  if (profile.gh?.configDir && !isAbsolute(profile.gh.configDir))
    throw new Error("GitHub CLI configuration directory must be absolute");
  return profile;
}

export function applyGhEnvironment(profile, env = process.env) {
  // Paths only. gh reads its existing configuration/keyring itself.
  if (profile?.gh?.configDir && !env.GH_CONFIG_DIR) env.GH_CONFIG_DIR = profile.gh.configDir;
  if (profile?.gh) env.GH_PROMPT_DISABLED = "1";
}

export function roleGuidance(profile) {
  if (profile.seatGuidance) return readFileSync(profile.seatGuidance, "utf8");
  const root = profile.workspace.replaceAll("\\", "/");
  const lines = [
    `RepoStew policy/state root: ${root}. Read ${root}/RepoStew_skills/SKILL.md and only applicable references.`,
    `Configured role: ${profile.role}. This profile does not assign work or expand the user's scope.`,
    "Within an assigned complete unit, proceed through necessary task-isolated dependency installation, implementation, validation and authorized publication without routine approval requests.",
    "Missing dependencies or an absent fixture are engineering work, not by themselves external blockers. Do not invent pre-edit approval, mandatory second review, or maintainer-approval requirements absent actual target wording.",
    "Preserve actual user stops, platform restrictions, confidentiality, identity/signing boundaries, single-writer ownership and unknown-write reconciliation. Confirm destructive actions only where existing explicit authority does not already cover the exact scope.",
    "Use native read/edit/write/search and shell tools. Use the existing host gh authentication; never print/copy tokens or run login merely because an inherited path is missing.",
    "Use rtk proxy gh for exact native help or machine-readable output; use --body-file for multiline publication text. Check command exit status; a formatted success label alone does not prove a write.",
  ];
  if (profile.role === "coordinator") lines.push(
    `Read ${root}/RepoStew_skills/roles/coordinator.md. Dispatch complete independent units through the selected host's native queue, integrate usable W results and refill available authorized capacity in the same event turn.`,
    "Use supplied live capacity/ownership facts. Do not serialize independent projects behind one worker or turn whole units into inspection-only tasks. Keep unfinished ownership until disposition is established.",
    "No additional agent, timer, polling loop or parallel task database is provided by this extension. Use the existing native host lifecycle and queue.",
    ...(profile.openrig ? [
      "Shared scheduling objective: fill every authorized compatible Worker slot while feasible independent backlog exists. Use repostew_openrig_slots; all C share the same native daemon-wide idle-capacity signal.",
      "On assignment/result/native wake, consume results then refill in the same turn. Do not idle at a page boundary. Global idle count is advisory, not a reservation or permission to use an unassigned seat. Honor disjoint dispatch ownership and actual Stop/limits.",
    ] : []),
  );
  if (profile.role === "worker") lines.push(
    `Read ${root}/RepoStew_skills/roles/worker.md. Own the assigned repository through setup, minimal repair, required checks, authorized PR/MR delivery and records.`,
    "Resolve ordinary execution faults within scope. Return exact delivered/no-delivery-needed/externally-blocked/execution-failed facts internally to C. Do not claim completion merely from a local patch, ended turn or handoff.",
    "Preserve other writers and shared resources. Stop your unused owned processes; resource disposition remains with the assigned owner.",
  );
  return lines.join("\n");
}

export default function repostewNative(pi) {
  const agentDir = process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");
  let profile = loadProfile(agentDir);
  function refresh() {
    profile = loadProfile(agentDir);
    applyGhEnvironment(profile);
  }
  function status() {
    return {
      extension: "repostew-pi-native", version: VERSION,
      role: profile?.role || "unconfigured", workspace: profile?.workspace || "",
      seatGuidance: profile?.seatGuidance || null,
      activeTools: pi.getActiveTools(),
      ghConfigDir: process.env.GH_CONFIG_DIR || "",
      ghPromptDisabled: process.env.GH_PROMPT_DISABLED === "1",
      approvalGate: false, automaticContinuation: false,
    };
  }
  refresh();
  pi.on("session_start", refresh);
  pi.on("before_agent_start", (event) => {
    delete event.systemPromptOptions.sections.repostew;
    if (profile) event.systemPromptOptions.sections.repostew = roleGuidance(profile);
  });
  pi.registerCommand("repostew-status", {
    description: "Show the loaded RepoStew role, native tools and non-secret gh paths",
    handler: async (_args, ctx) => { ctx.ui.notify(JSON.stringify(status()), "info"); },
  });
  // Same native reload mechanism as Pi's reload-runtime example. No replacement
  // process, forced interruption or hidden continuation loop.
  pi.registerCommand("repostew-reload", {
    description: "Reload Pi settings, extensions, skills and context",
    handler: async (_args, ctx) => { await ctx.reload(); return; },
  });
  pi.registerTool({
    name: "repostew_runtime_status", label: "RepoStew runtime status",
    description: "Inspect loaded role/tools and non-secret configuration paths. Does not grant authority or claim task completion.",
    parameters: Type.Object({}),
    async execute() {
      const details = status();
      return { content: [{ type: "text", text: JSON.stringify(details) }], details };
    },
  });
  pi.registerTool({
    name: "repostew_openrig_slots", label: "OpenRig worker slots",
    description: "Read this profile's explicitly bound OpenRig roster, active ownership and pending C results. Snapshot only; does not reserve, dispatch, wake, or certify process stop.",
    parameters: Type.Object({}),
    async execute(_id, _params, signal) {
      const details = await readOpenRigSlots(profile?.openrig, signal);
      return { content: [{ type: "text", text: JSON.stringify(details) }], details };
    },
  });
  pi.registerTool({
    name: "repostew_gh_status", label: "Native GitHub CLI authentication",
    description: "Verify existing native gh authentication using a read-only API call. Returns login and exit code, never credentials; does not log in or change accounts.",
    parameters: Type.Object({ hostname: Type.Optional(Type.String({ default: "github.com" })) }),
    async execute(_id, { hostname = "github.com" }, signal) {
      const result = await pi.exec("gh", ["api", "--hostname", hostname, "user", "--jq", ".login"], { signal, timeout: 20000 });
      const login = result.stdout.trim();
      const authenticated = result.code === 0 && /^[A-Za-z0-9-]+$/.test(login);
      const details = { hostname, authenticated, login: authenticated ? login : "", exitCode: result.code };
      return {
        content: [{ type: "text", text: JSON.stringify(details) }],
        details, isError: !authenticated,
      };
    },
  });
}
