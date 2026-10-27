// Configure explicit independent Pi modules. No processes, credentials or task state are copied.
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: {
  "agent-dir": { type: "string" }, workspace: { type: "string" },
  role: { type: "string", default: "general" }, extension: { type: "string" },
  mode: { type: "string", default: "repostew" },
  "gh-config-dir": { type: "string" }, "remove-extension": { type: "string", multiple: true, default: [] },
  "openrig-home": { type: "string" }, "seat-guidance": { type: "string" },
  "openrig-binding": { type: "string" }, "openrig-guidance": { type: "string" },
  "trust-projects": { type: "boolean", default: false },
} });
if (!values["agent-dir"] || !["repostew", "openrig", "combined"].includes(values.mode))
  throw new Error("Required: --agent-dir PATH --mode repostew|openrig|combined");
const appEnabled = values.mode !== "openrig", bridgeEnabled = values.mode !== "repostew";
if (appEnabled && (!values.workspace || !["general", "coordinator", "worker"].includes(values.role)))
  throw new Error("RepoStew requires --workspace PATH --role general|coordinator|worker");
const agentDir = resolve(values["agent-dir"]);
const workspace = appEnabled ? realpathSync(resolve(values.workspace)) : undefined;
const seatGuidance = values["seat-guidance"] ? realpathSync(resolve(values["seat-guidance"])) : undefined;
const bridgeGuidance = values["openrig-guidance"] ? realpathSync(resolve(values["openrig-guidance"])) : undefined;
const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const moduleDir = existsSync(join(sourceRoot, "integrations/pi-repostew.js")) ? join(sourceRoot, "integrations") : join(sourceRoot, "extensions");
const extensions = [
  ...(appEnabled ? [realpathSync(values.extension ? resolve(values.extension) : join(moduleDir, "pi-repostew.js"))] : []),
  ...(bridgeEnabled ? [realpathSync(join(moduleDir, "pi-openrig.js"))] : []),
];
const read = path => existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : {};
const settingsPath = join(agentDir, "settings.json"), profilePath = join(agentDir, "repostew.json");
const bridgePath = join(agentDir, "openrig-pi.json");
const settings = read(settingsPath), profile = appEnabled ? read(profilePath) : {};
const bridge = bridgeEnabled ? read(bridgePath) : {};
const legacy = profile.openrig;
const binding = bridgeEnabled ? (values["openrig-binding"] ? read(realpathSync(resolve(values["openrig-binding"]))) :
  bridge.binding || (legacy && { url: legacy.url, rig: legacy.rig, observer: legacy.coordinator, seats: legacy.workers })) : undefined;
if (bridgeEnabled) {
  if (!binding?.url || !binding.rig || !binding.observer || !Array.isArray(binding.seats))
    throw new Error("OpenRig requires --openrig-binding JSON (url, rig, observer, seats) or an existing bridge/legacy binding");
  const origin = new URL(binding.url);
  if (origin.username || origin.password || !["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname))
    throw new Error("OpenRig bridge requires an explicit loopback daemon URL");
}
const openrigHome = bridgeEnabled ? values["openrig-home"] || process.env.OPENRIG_HOME : undefined;
const officialSkills = openrigHome ? realpathSync(join(resolve(openrigHome), "plugins/openrig-core/skills")) : undefined;
// Only known modules in this installation plus exact operator-provided removals are replaced.
const removed = new Set(["pi-native.js", "pi-repostew.js", "pi-openrig.js"].map(p => resolve(moduleDir, p).toLowerCase()));
for (const path of values["remove-extension"]) removed.add(resolve(path).toLowerCase());
settings.extensions = [...new Set((settings.extensions || []).filter(p =>
  typeof p !== "string" || !removed.has(resolve(p).toLowerCase())).concat(extensions))];
if (officialSkills) settings.skills = [...new Set([...(settings.skills || []), officialSkills])];
const nativeTools = ["read", "bash", "powershell", "edit", "write", "grep", "find", "ls", "codemode", "tool_search"];
settings.defaultTools = [...new Set([...(settings.defaultTools || []).filter(t => !nativeTools.includes(t.replace(/^[+-]/, ""))), ...nativeTools])];
if (values["trust-projects"]) settings.defaultProjectTrust = "always";
let configDir;
if (appEnabled) {
  configDir = resolve(values["gh-config-dir"] || process.env.GH_CONFIG_DIR ||
    (process.env.XDG_CONFIG_HOME ? join(process.env.XDG_CONFIG_HOME, "gh") :
      process.platform === "win32" && process.env.APPDATA ? join(process.env.APPDATA, "GitHub CLI") : join(process.env.HOME || homedir(), ".config/gh")));
const start = "# BEGIN REPOSTEW GH", end = "# END REPOSTEW GH";
const prefix = (settings.shellCommandPrefix || "").replace(
  /(?:^|\n)# BEGIN REPOSTEW GH\n[\s\S]*?# END REPOSTEW GH(?=\n|$)/g, "").trim();
const block = [start,
  `export GH_CONFIG_DIR="\${GH_CONFIG_DIR:-${configDir.replaceAll("\\", "/").replaceAll('"', '\\"').replaceAll("$", "\\$").replaceAll("`", "\\`")}}"`,
  "export GH_PROMPT_DISABLED=1", end].join("\n");
// Keep shell quoting explicit and do not embed credentials.
settings.shellCommandPrefix = [prefix, block].filter(Boolean).join("\n");
}
// Validate/resolve every selected input before the first write.
mkdirSync(agentDir, { recursive: true });
if (appEnabled) writeFileSync(profilePath, JSON.stringify({ ...profile, version: 1, workspace,
  role: values.role, gh: { ...profile.gh, configDir }, ...(seatGuidance ? { seatGuidance } : {}) }, null, 2) + "\n");
if (bridgeEnabled) writeFileSync(bridgePath, JSON.stringify({ ...bridge, version: 1, binding,
  ...(bridgeGuidance ? { seatGuidance: bridgeGuidance } : {}) }, null, 2) + "\n");
writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
console.log(JSON.stringify({ agentDir, mode: values.mode, extensions, workspace,
  officialSkills: officialSkills || null, ghConfigDir: configDir || null, restart: false }));
