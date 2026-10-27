// OpenRig × Pi bridge. Native facts and Pi mechanisms; no RepoStew business policy.
import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Type } from "typebox";
import { VERSION, agentDirectory, readOptionalJson, registerContext, registerRuntimeCommands, toolSelection } from "./pi-runtime.js";
export { VERSION } from "./pi-runtime.js";

// A projection of native ownership, never a reservation or a second queue.
export function deriveSlots(binding, nodes, rows) {
  const active = rows.filter(row => ["pending", "in-progress", "blocked"].includes(row.state));
  return binding.seats.map(seat => {
    const node = nodes.find(item => item.canonicalSessionName === seat);
    const assignments = active.filter(row => row.destinationSession === seat);
    const returns = active.filter(row => row.destinationSession === binding.observer && row.sourceSession === seat);
    const executing = assignments.filter(row => row.state !== "blocked");
    const waiting = assignments.filter(row => row.state === "blocked");
    const pendingResults = returns.filter(row => row.state !== "blocked");
    const waitingResults = returns.filter(row => row.state === "blocked");
    let state = "unknown";
    if (node?.intentionallyStopped || node?.sessionStatus === "exited") state = "stopped";
    else if (node?.heldReason) state = "held";
    else if (node?.activityState?.needsInput?.count > 0) state = "needs-input";
    else if (executing.length) state = "occupied";
    else if (node?.agentActivity?.state === "running") state = "busy";
    else if (pendingResults.length) state = "awaiting-observer";
    else if (waiting.length || waitingResults.length) state = "waiting-reconciliation";
    else if (node?.sessionStatus === "running" && node?.startupStatus === "ready"
      && node?.activityState?.activity === "idle-at-prompt"
      && node.activityState.needsInput?.count === 0
      && !node.heldReason && !node.assignedWorkCount) state = "available";
    return { seat, state, assignments: assignments.map(row => row.qitemId),
      executingAssignments: executing.map(row => row.qitemId),
      waitingObligations: [...waiting, ...waitingResults].map(row => ({ id: row.qitemId, destination: row.destinationSession, blockedOn: row.blockedOn ?? null })),
      pendingResults: pendingResults.map(row => row.qitemId),
      reason: state === "waiting-reconciliation" ? "Blocked obligations remain; execution clearance is unmeasured."
        : state === "awaiting-observer" ? "Pending results are addressed to the configured observer."
        : state === "held" ? node.heldReason : state,
      processClearance: "unknown", model: node?.model ?? null,
      activity: node?.agentActivity?.state ?? "unknown" };
  });
}

export async function readOpenRigSlots(binding, signal) {
  if (!binding?.url || !binding.rig || !binding.observer || !Array.isArray(binding.seats))
    throw new Error("No explicit binding in openrig-pi.json");
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
    sharedIdleScope: "daemon-wide native execution view; includes seats outside this binding",
    slots,
    available: slots.filter(slot => slot.state === "available").map(slot => slot.seat),
    pendingObserverItems: rows.filter(row => row.destinationSession === binding.observer).map(row => ({
      id: row.qitemId, state: row.state, source: row.sourceSession, handedOffFrom: row.handedOffFrom,
    })),
    reservation: false, processClearance: "unknown",
  };
}


export function loadBridgeProfile(agentDir) {
  const profile = readOptionalJson(join(agentDir, "openrig-pi.json"));
  if (!profile) return undefined;
  if (profile.version !== 1) throw new Error("Unsupported OpenRig Pi profile");
  if (profile.seatGuidance && !isAbsolute(profile.seatGuidance))
    throw new Error("OpenRig guidance must be an absolute file path");
  return profile;
}

export function registerOpenRig(pi, { profileProvider, slotTool = "openrig_slots" } = {}) {
  const agentDir = agentDirectory();
  const load = profileProvider || (() => loadBridgeProfile(agentDir));
  let profile;
  const refresh = () => { profile = load(); };
  refresh();
  registerContext(pi, "openrig", refresh, () => profile?.seatGuidance ? readFileSync(profile.seatGuidance, "utf8") : undefined);
  const status = () => {
    refresh();
    return { extension: "openrig-pi", version: VERSION, entrypoint: fileURLToPath(import.meta.url),
      binding: profile?.binding || null, seatGuidance: profile?.seatGuidance || null,
      activeTools: pi.getActiveTools(), registeredTools: pi.getAllTools().map(tool => tool.name),
      toolSelection: toolSelection(pi),
      automaticContinuation: false, reservation: false };
  };
  registerRuntimeCommands(pi, "openrig", agentDir, status);
  pi.registerTool({
    name: "openrig_runtime_status", label: "OpenRig Pi status",
    description: "Read bridge configuration and loaded Pi tool state; no task or process-clearance claim.",
    parameters: Type.Object({}),
    async execute() {
      const details = status();
      return { content: [{ type: "text", text: JSON.stringify(details) }], details };
    },
  });
  pi.registerTool({
    name: slotTool, label: "OpenRig native snapshot",
    description: "Read explicitly bound native seats, queue rows and pending observer results. Facts only; no reservation, dispatch, wake, policy or process-stop certification.",
    parameters: Type.Object({}),
    async execute(_id, _params, signal) {
      refresh();
      const details = await readOpenRigSlots(profile?.binding, signal);
      return { content: [{ type: "text", text: JSON.stringify(details) }], details };
    },
  });
}

export default function openrigPi(pi) { registerOpenRig(pi); }
