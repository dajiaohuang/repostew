import { createHash } from "node:crypto";
import { posix, win32 } from "node:path";

export const GREP_CONTEXT_MAX_BYTES = 65536;

export function broadStateGrep(event, workspace, cwd) {
  if (event.toolName !== "grep" || !workspace || typeof event.input?.path !== "string") return undefined;
  const windows = /^[A-Za-z]:[\\/]/.test(workspace);
  const paths = windows ? win32 : posix;
  const normalize = value => {
    const absolute = paths.resolve(value).replace(/[\\/]+$/, "");
    return windows ? absolute.toLowerCase() : absolute;
  };
  if (normalize(paths.resolve(cwd || workspace, event.input.path)) !== normalize(paths.join(workspace, "state"))) return undefined;
  return { block: true, reason: "RepoStew forbids broad recursive state searches. Search the exact assigned project/file or a bounded native index instead; the previous whole-state grep produced about 38 MB and blocked provider requests. No permission is needed to narrow the search." };
}

// Provider-facing projection only. The native session and original results stay intact.
export function boundGrepContext(messages, observe = () => {}) {
  let changed = false;
  const projected = messages.map(message => {
    if (message.role !== "toolResult" || message.toolName !== "grep") return message;
    const serialized = JSON.stringify(message);
    const bytes = Buffer.byteLength(serialized, "utf8");
    if (bytes <= GREP_CONTEXT_MAX_BYTES) return message;
    const sha256 = createHash("sha256").update(serialized).digest("hex");
    const evidence = { toolCallId: message.toolCallId, bytes, sha256 };
    observe(evidence);
    changed = true;
    // Do not retain details/structuredContent: either can duplicate the oversized body.
    const { content, details, structuredContent, ...identity } = message;
    return { ...identity, content: [{ type: "text", text:
      `[RepoStew provider context: oversized grep output omitted; ${bytes} UTF-8 bytes; SHA256 ${sha256}. Original result remains in the native session. This is not complete search evidence. Repeat only a narrowly scoped search with bounded output; do not recursively search state.]` }] };
  });
  return changed ? projected : messages;
}
