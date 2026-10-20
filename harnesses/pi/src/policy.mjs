import {readFileSync, realpathSync} from 'node:fs';
import {join, resolve, relative, isAbsolute, sep} from 'node:path';
import {createHash} from 'node:crypto';
import {workflows, workflowFor} from './workflows.mjs';

export function policyRoot(config) {
  return config.policyDir ?? join(config.workspace, 'RepoStew_skills');
}
export function policyDocument(config, path) {
  if (typeof path !== 'string' || !/^(SKILL\.md|(?:roles|prompts|references)\/[A-Za-z0-9_./-]+\.md)$/.test(path) ||
      path.split('/').includes('..')) throw new Error('Select a canonical Skill document');
  const root = realpathSync(policyRoot(config));
  const file = realpathSync(resolve(root, path));
  const delta = relative(root, file);
  if (isAbsolute(delta) || delta === '..' || delta.startsWith(`..${sep}`)) throw new Error('Policy link escapes the canonical Skill');
  const bytes = readFileSync(file);
  if (bytes.length > 128 * 1024) throw new Error('Policy document exceeds the read bound; use the native read tool with its exact path');
  return {path, absolutePath: file, sha256: createHash('sha256').update(bytes).digest('hex'), text: bytes.toString('utf8')};
}
export function policySelection(config, role, campaign = {}) {
  const workflow = workflowFor(campaign.workflow);
  const paths = ['SKILL.md', `roles/${role}.md`, 'prompts/task.md'];
  if (workflow.forms) paths.push(workflow.forms[role]);
  // Full form text is supplied once; methods are selected by action through
  // harness_policy/native read, not recursively expanded into every model turn.
  return {
    root: policyRoot(config), workflow: workflow.id,
    documents: [...new Set(paths)].map(path => policyDocument(config, path)),
    methods: workflow.documents,
    conditional: {
      state: ['references/workspace.md', 'references/records.md'],
      investigation: ['references/audit.md', 'references/contribution-value.md'],
      publication: ['references/workflows/delivery.md', 'references/safety.md'],
      security: ['references/security.md'],
      resources: ['references/storage.md'],
      coordination: ['references/orchestration.md', 'references/refill.md'],
      target: ['references/forges/README.md'],
    },
  };
}
export function readPolicy(config, body = {}, campaign = {}) {
  if (body.action === 'list') return {selected: workflowFor(campaign.workflow).id, root: policyRoot(config), workflows};
  if (body.action !== 'read' || !Array.isArray(body.paths) || body.paths.length < 1 || body.paths.length > 8) {
    throw new Error('Read 1..8 exact canonical Skill paths, or list workflows');
  }
  const documents = [...new Set(body.paths)].map(path => policyDocument(config, path));
  if (documents.reduce((n, d) => n + Buffer.byteLength(d.text), 0) > 256 * 1024) {
    throw new Error('Policy batch exceeds 256 KiB; split the selected documents');
  }
  return {documents};
}
