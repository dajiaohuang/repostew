// Shared Pi mechanisms only: no project policy, host API or scheduling.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const VERSION = "0.5.0";
export const agentDirectory = () => process.env.PI_CODING_AGENT_DIR || join(homedir(), ".pi", "agent");

export function readOptionalJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return undefined; throw error; }
}

export function registerContext(pi, section, refresh, guidance) {
  pi.on("session_start", refresh);
  pi.on("before_agent_start", event => {
    refresh();
    delete event.systemPromptOptions.sections[section];
    const text = guidance();
    if (text) event.systemPromptOptions.sections[section] = text;
  });
}

export function registerRuntimeCommands(pi, prefix, agentDir, status) {
  pi.registerCommand(`${prefix}-status`, {
    description: "Show this extension's loaded version, paths and native tool state",
    handler: async (_args, ctx) => { ctx.ui.notify(JSON.stringify(status()), "info"); },
  });
  pi.registerCommand(`${prefix}-reload`, {
    description: "Reload native Pi settings, extensions, skills and context",
    handler: async (_args, ctx) => { await ctx.reload(); },
  });
  pi.registerCommand(`${prefix}-restore-tools`, {
    description: "Restore explicitly configured native tools on operator request",
    handler: async (_args, ctx) => {
      const { defaultTools: configured } = JSON.parse(readFileSync(join(agentDir, "settings.json"), "utf8"));
      if (!Array.isArray(configured) || configured.some(name => typeof name !== "string" || /^[+-]/.test(name)))
        throw new Error("Expected an explicit defaultTools list in this seat's settings");
      const registered = new Set(pi.getAllTools().map(tool => tool.name));
      const missing = configured.filter(name => !registered.has(name));
      if (missing.length) throw new Error(`Configured tools are not registered: ${missing.join(", ")}`);
      const before = pi.getActiveTools();
      pi.setActiveTools([...new Set([...before, ...configured])]);
      const after = pi.getActiveTools();
      if (configured.some(name => !after.includes(name))) throw new Error("Native tool activation incomplete");
      ctx.ui.notify(JSON.stringify({ restored: true, before, after }), "info");
    },
  });
}
