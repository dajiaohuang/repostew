// RepoStew's Pi extension. Uses the official prompt-customizer, tools and
// reload-runtime patterns; Pi owns tools/lifecycle and the host owns scheduling.
import { readFileSync, realpathSync, existsSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Type } from "typebox";

import { VERSION, agentDirectory, readOptionalJson, registerContext, registerRuntimeCommands } from "./pi-runtime.js";
export { VERSION } from "./pi-runtime.js";

export const COORDINATOR_REFILL = `## Coordinator capacity and continuation
On each assignment, result or recovery event, register usable results and fill every available authorized compatible Worker slot while independent feasible work remains. Continue dispatching in this turn; one dispatch is not the stopping condition.
Source order is selection order, not completion order. Record the next unassigned position separately from completed coverage and outstanding units. A parent waiting for one child does not block unrelated units or other Workers.
Keep execution occupancy, retained project ownership, pending result registration and external waiting distinct. Reconcile each affected Worker before reuse; do not require fleet-wide process clearance. Unknown process state is not permission to reuse resources, and is not a global prohibition on independent dispatch.
Use existing native queue and slot facts. Register returned results promptly; leave an external dependency with its original owner without treating every historical blocked row as an executing task. Do not clear real ownership or assign an ambiguous Worker merely to fill capacity.
End the turn only when no compatible capacity remains, no independent feasible input remains, or a real constraint applies to every remaining candidate. Record the specific reason for unused capacity. No new polling loop, timer, seat, approval gate or task database.
For feedback domains, an exhausted capture is a source checkpoint, not completion of a continuing authorized domain. Capture the necessary incremental window within current authority; preserve exclusions, original owners and exact captured task inputs. Explicit finite-source limits and user Stops still apply.`;

export function loadProfile(agentDir) {
  const profile = readOptionalJson(join(agentDir, "repostew.json"));
  if (!profile) return undefined;
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
  if (profile.seatGuidance) {
    const contract = readFileSync(profile.seatGuidance, "utf8");
    return profile.role === "coordinator" && !contract.includes(COORDINATOR_REFILL)
      ? `${contract}\n\n${COORDINATOR_REFILL}` : contract;
  }
  const candidates = [join(profile.workspace, "RepoStew_skills/skill"), join(profile.workspace, "skill"), join(profile.workspace, "RepoStew_skills")];
  const root = (candidates.find(path => existsSync(join(path, "roles/worker.md"))) || candidates[0]).replaceAll("\\", "/");
  const lines = [
    `RepoStew canonical policy root: ${root}. Read ${root}/SKILL.md and only applicable references. Workspace state root: ${profile.workspace}.`,
    `Configured role: ${profile.role}. This profile does not assign work or expand the user's scope.`,
    "Within an assigned complete unit, proceed through necessary task-isolated dependency installation, implementation, validation and authorized publication without routine approval requests.",
    "Missing dependencies or an absent fixture are engineering work, not by themselves external blockers. Do not invent pre-edit approval, mandatory second review, or maintainer-approval requirements absent actual target wording.",
    "Preserve actual user stops, platform restrictions, confidentiality, identity/signing boundaries, single-writer ownership and unknown-write reconciliation. Confirm destructive actions only where existing explicit authority does not already cover the exact scope.",
    "Use native read/edit/write/search and shell tools. Use the existing host gh authentication; never print/copy tokens or run login merely because an inherited path is missing.",
    "Use rtk proxy gh for exact native help or machine-readable output; use --body-file for multiline publication text. Check command exit status; a formatted success label alone does not prove a write.",
  ];
  if (profile.role === "coordinator") lines.push(
    COORDINATOR_REFILL,
    `Read ${root}/roles/coordinator.md. Dispatch complete independent units through the selected host's native queue, register W results and refill available authorized capacity in the same event turn without approval or engineering acceptance.`,
    "Use supplied live capacity/ownership facts. Do not serialize independent projects behind one worker or turn whole units into inspection-only tasks. Keep unfinished ownership until disposition is established.",
    "No additional agent, timer, polling loop or parallel task database is provided by this extension. Use the existing native host lifecycle and queue.",

  );
  if (profile.role === "worker") lines.push(
    `Read ${root}/roles/worker.md. Own the six-step unit through setup, minimal repair, target-required tests, truthful terms/CLA/DCO, authorized PR/MR delivery, submitted/link record and feasible authorized task cleanup before capacity return. No CI lookup or wait.`,
    "Resolve ordinary execution faults within scope. Return exact delivered/no-delivery-needed/externally-blocked/execution-failed facts internally to C. Do not claim completion merely from a local patch, ended turn or handoff.",
    "Preserve other writers and shared resources. Stop your unused owned processes; resource disposition remains with the assigned owner.",
  );
  return lines.join("\n");
}

export default function repostewPi(pi) {
  const agentDir = agentDirectory();
  let profile = loadProfile(agentDir);
  function refresh() {
    profile = loadProfile(agentDir);
    applyGhEnvironment(profile);
  }
  function status() {
    refresh();
    return {
      extension: "repostew-pi-native", version: VERSION,
      entrypoint: fileURLToPath(import.meta.url),
      role: profile?.role || "unconfigured", workspace: profile?.workspace || "",
      seatGuidance: profile?.seatGuidance || null,
      activeTools: pi.getActiveTools(),
      registeredTools: pi.getAllTools().map(tool => tool.name),
      ghConfigDir: process.env.GH_CONFIG_DIR || "",
      ghPromptDisabled: process.env.GH_PROMPT_DISABLED === "1",
      approvalGate: false, automaticContinuation: false,
    };
  }
  refresh();
  registerContext(pi, "repostew", refresh, () => profile ? roleGuidance(profile) : undefined);
  registerRuntimeCommands(pi, "repostew", agentDir, status);
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
