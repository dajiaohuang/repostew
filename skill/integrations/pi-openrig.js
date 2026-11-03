// OpenRig × Pi bridge. Native facts and Pi mechanisms; no RepoStew business policy.
import { readFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Type } from "typebox";
import { VERSION, agentDirectory, readOptionalJson, registerContext, registerRuntimeCommands, toolSelection } from "./pi-runtime.js";
export { VERSION } from "./pi-runtime.js";

export { deriveSlots, readOpenRigSlots } from './openrig-facts.js';
import { readOpenRigSlots } from './openrig-facts.js';

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
