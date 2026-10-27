// Install an explicit per-agent Pi profile using native settings. No credentials,
// processes, queues or task state are copied or started.
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { parseArgs } from "node:util";

const { values } = parseArgs({ options: {
  "agent-dir": { type: "string" }, workspace: { type: "string" },
  role: { type: "string", default: "general" }, extension: { type: "string" },
  "gh-config-dir": { type: "string" }, "remove-extension": { type: "string", multiple: true, default: [] },
  "openrig-home": { type: "string" }, "seat-guidance": { type: "string" },
  "trust-projects": { type: "boolean", default: false },
} });
if (!values["agent-dir"] || !values.workspace || !["general", "coordinator", "worker"].includes(values.role))
  throw new Error("Required: --agent-dir PATH --workspace PATH --role general|coordinator|worker");
const agentDir = resolve(values["agent-dir"]);
const workspace = realpathSync(resolve(values.workspace));
const seatGuidance = values["seat-guidance"] ? realpathSync(resolve(values["seat-guidance"])) : undefined;
const sourceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const extension = realpathSync(values.extension ? resolve(values.extension) :
  existsSync(join(sourceRoot, "integrations/pi-native.js")) ? join(sourceRoot, "integrations/pi-native.js") :
  join(sourceRoot, "extensions/pi-native.js"));
const configDir = resolve(values["gh-config-dir"] || process.env.GH_CONFIG_DIR ||
  (process.env.XDG_CONFIG_HOME ? join(process.env.XDG_CONFIG_HOME, "gh") :
    process.platform === "win32" && process.env.APPDATA ? join(process.env.APPDATA, "GitHub CLI") :
      join(process.env.HOME || homedir(), ".config/gh")));
mkdirSync(agentDir, { recursive: true });
const settingsPath = join(agentDir, "settings.json");
const settings = existsSync(settingsPath) ? JSON.parse(readFileSync(settingsPath, "utf8")) : {};
const profilePath = join(agentDir, "repostew.json");
const profile = existsSync(profilePath) ? JSON.parse(readFileSync(profilePath, "utf8")) : {};
// OpenRig's official skills are portable; its Claude/Codex hook manifests are not Pi extensions.
// Managed callers use their explicit instance, never the user's global OpenRig directory.
const openrigHome = values["openrig-home"] || process.env.OPENRIG_HOME;
const officialSkills = openrigHome ? realpathSync(join(resolve(openrigHome), "plugins/openrig-core/skills")) : undefined;
const removed = new Set(values["remove-extension"].map(p => resolve(p).toLowerCase()));
settings.extensions = [...new Set((settings.extensions || []).filter(p =>
  typeof p !== "string" || !removed.has(resolve(p).toLowerCase())).concat(extension))];
if (officialSkills) settings.skills = [...new Set([...(settings.skills || []), officialSkills])];
// Pi's native tool selector, not wrapper implementations or approval bypasses.
const nativeTools = ["read", "bash", "powershell", "edit", "write", "grep", "find", "ls", "codemode", "tool_search"];
settings.defaultTools = [...new Set([...(settings.defaultTools || []).filter(t =>
  !nativeTools.includes(t.replace(/^[+-]/, ""))), ...nativeTools])];
if (values["trust-projects"]) settings.defaultProjectTrust = "always";
// Official shellCommandPrefix pattern. Preserve pre-existing setup outside our block.
const start = "# BEGIN REPOSTEW GH", end = "# END REPOSTEW GH";
const prefix = (settings.shellCommandPrefix || "").replace(
  /(?:^|\n)# BEGIN REPOSTEW GH\n[\s\S]*?# END REPOSTEW GH(?=\n|$)/g, "").trim();
const block = [start,
  `export GH_CONFIG_DIR="\${GH_CONFIG_DIR:-${configDir.replaceAll("\\", "/").replaceAll('"', '\\"').replaceAll("$", "\\$").replaceAll("`", "\\`")}}"`,
  "export GH_PROMPT_DISABLED=1", end].join("\n");
// Keep shell quoting explicit and do not embed credentials.
settings.shellCommandPrefix = [prefix, block].filter(Boolean).join("\n");
writeFileSync(profilePath, JSON.stringify({
  ...profile, version: 1, workspace, role: values.role, gh: { ...profile.gh, configDir },
  ...(seatGuidance ? { seatGuidance } : {}),
}, null, 2) + "\n");
writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
console.log(JSON.stringify({ agentDir, extension, role: values.role, workspace, ghConfigDir: configDir,
  officialSkills: officialSkills || null, defaultProjectTrust: settings.defaultProjectTrust, restart: false }));
