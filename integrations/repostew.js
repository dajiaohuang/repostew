import { fileURLToPath } from "node:url";

const skill = fileURLToPath(new URL("../skills/repostew/SKILL.md", import.meta.url));

export default function repostew(pi) {
  pi.registerCommand("repostew", {
    description: "Use RepoStew for the supplied repository task",
    handler: async (args, ctx) => {
      if (!args.trim()) {
        ctx.ui.notify("Usage: /repostew <task and workspace>", "info");
        return;
      }
      pi.sendUserMessage(
        `Read ${JSON.stringify(skill)} and its applicable references. ` +
        `Use the requested workspace as policy/state root; the package contains instructions only.\n\n${args}`,
      );
    },
  });
}
