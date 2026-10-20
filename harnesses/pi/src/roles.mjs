import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { piRoot } from './pi-install.mjs';

// Same frontmatter/body contract as Pi examples/extensions/subagent/agents.ts.
// Only the two explicit project roles are loaded; no user/global agent discovery.
export function loadRole(config,role) {
  const {parseFrontmatter}=createRequire(import.meta.url)(join(piRoot(config),'dist/utils/frontmatter.js'));
  const path=fileURLToPath(new URL(`../agents/${role}.md`,import.meta.url));
  const {frontmatter,body}=parseFrontmatter(readFileSync(path,'utf8'));
  const raw=Array.isArray(frontmatter.tools)?frontmatter.tools:String(frontmatter.tools??'').split(',');
  return {name:frontmatter.name,description:frontmatter.description,tools:raw.map(s=>s.trim()).filter(Boolean),systemPrompt:body};
}
