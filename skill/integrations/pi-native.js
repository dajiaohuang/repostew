// Legacy combined entrypoint. New installations select the independent modules explicitly.
import repostewPi, { loadProfile } from "./pi-repostew.js";
import { registerOpenRig, deriveSlots as projectSlots, readOpenRigSlots as readSlots } from "./pi-openrig.js";
import { agentDirectory } from "./pi-runtime.js";
import { Type } from "typebox";
export { VERSION, COORDINATOR_REFILL, loadProfile, applyGhEnvironment, roleGuidance } from "./pi-repostew.js";

export function legacyBinding(binding) {
  return binding && { url: binding.url, rig: binding.rig, observer: binding.coordinator, seats: binding.workers };
}
const legacySlots = slots => slots.map(slot => ({ ...slot,
  state: slot.state === "awaiting-observer" ? "awaiting-coordinator" : slot.state,
}));
export const deriveSlots = (binding, nodes, rows) => legacySlots(projectSlots(legacyBinding(binding), nodes, rows));
export async function readOpenRigSlots(binding, signal) {
  const snapshot = await readSlots(legacyBinding(binding), signal);
  const { pendingObserverItems, ...facts } = snapshot;
  return { ...facts, slots: legacySlots(facts.slots), pendingCoordinatorItems: pendingObserverItems };
}

export default function legacyCombined(pi) {
  repostewPi(pi);
  const agentDir = agentDirectory();
  // Preserve existing combined profiles. App-only profiles register no OpenRig tools.
  if (loadProfile(agentDir)?.openrig) {
    registerOpenRig(pi, {
      profileProvider: () => ({ version: 1, binding: legacyBinding(loadProfile(agentDir)?.openrig) }),
    });
    pi.registerTool({
      name: "repostew_openrig_slots", label: "Legacy OpenRig snapshot",
      description: "Compatibility alias for the original configured roster. Facts only; no dispatch or approval.",
      parameters: Type.Object({}),
      async execute(_id, _params, signal) {
        const details = await readOpenRigSlots(loadProfile(agentDir)?.openrig, signal);
        return { content: [{ type: "text", text: JSON.stringify(details) }], details };
      },
    });
  }
}
