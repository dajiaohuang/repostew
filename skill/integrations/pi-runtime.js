// Shared Pi mechanisms only: no project policy, host API or scheduling.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const VERSION = "0.5.1";
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

export function toolSelection(pi) {
  return {
    configured: {
      source: "Pi.getSettings().defaultTools (effective merged settings)",
      entries: pi.getSettings().defaultTools ?? null,
      representation: "Settings declaration; patterns/modifiers are not expanded here. Null means no explicit defaultTools.",
    },
    intended: null, // Current human intent is not inferred from saved configuration.
    registered: pi.getAllTools().map(tool => tool.name),
    active: pi.getActiveTools(),
  };
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
    description: "Add only explicitly named current intended tools, preserving active extras; usage: /" + prefix + "-restore-tools read bash",
    handler: async (args, ctx) => {
      const intended = [...new Set(args.trim().split(/\s+/).filter(Boolean))];
      if (!intended.length) throw new Error(`Name the tools intended now: /${prefix}-restore-tools read bash. No selection changed.`);
      const tools = pi.getAllTools();
      const unavailable = intended.filter(name => !tools.some(tool => tool.name === name && tool.exposure !== "hidden"));
      if (unavailable.length) throw new Error(`Intended tools are unregistered or hidden: ${unavailable.join(", ")}. No selection changed.`);
      const selection = toolSelection(pi);
      const before = pi.getActiveTools();
      const target = [...new Set([...before, ...intended])];
      pi.setActiveTools(target);
      const after = pi.getActiveTools();
      const missing = target.filter(name => !after.includes(name));
      const receipt = { at: new Date().toISOString(), restored: missing.length === 0,
        configured: selection.configured, intended, registered: selection.registered, before, after, missing };
      ctx.ui.notify(JSON.stringify(receipt), missing.length ? "error" : "info");
      if (missing.length) throw new Error(`Native tool activation incomplete: ${missing.join(", ")}. Inspect the before/after receipt before retrying.`);
    },
  });
}
