import { readFileSync, realpathSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, relative, isAbsolute, sep, join, basename } from 'node:path';

export function invariant(ok, message) { if (!ok) throw new Error(message); }
export function nonempty(value, name, max = 50000) {
  invariant(typeof value === 'string' && value.trim().length > 0 && value.length <= max, `${name}: expected nonempty string (max ${max})`);
  return value;
}
export function integer(n, name, min, max) {
  invariant(Number.isSafeInteger(n) && n >= min && n <= max, `${name}: expected integer ${min}..${max}`);
}
export function canonical(path) {
  let current = resolve(path); const tail = [];
  while (!existsSync(current)) { tail.unshift(basename(current)); current = dirname(current); }
  return join(realpathSync(current), ...tail);
}
export function within(root, path) {
  const delta = relative(canonical(root), canonical(path));
  return delta === '' || (!isAbsolute(delta) && delta !== '..' && !delta.startsWith(`..${sep}`));
}
export function safeId(value, name = 'id') {
  invariant(typeof value === 'string' && /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(value), `${name}: use 1..80 alphanumeric, underscore or hyphen characters`);
  return value;
}
const forbiddenNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i;
export function projectKey(project) {
  invariant(project && typeof project === 'object', 'project is required');
  for (const field of ['host', 'namespace', 'repo']) nonempty(project[field], `project.${field}`, 200);
  invariant(!project.host.includes('/') && !project.repo.includes('/'), 'host/repo must be single path components');
  const parts = [project.host, ...project.namespace.split('/'), project.repo];
  for (const part of parts) invariant(/^[a-zA-Z0-9_.-]+$/.test(part) && part !== '.' && part !== '..' && !/[. ]$/.test(part) && !forbiddenNames.test(part), `unsafe project component: ${part}`);
  return parts.join('/').toLowerCase();
}
export function validateConfig(c) {
  invariant(c.schemaVersion === 1, 'Unsupported configuration version');
  integer(c.maxWorkers, 'maxWorkers', 1, 64); integer(c.maxQueued, 'maxQueued', 1, 1000);
  c.maxCoordinators ??= 2;
  integer(c.maxCoordinators, 'maxCoordinators', 1, 32);
  integer(c.heartbeatMs, 'heartbeatMs', 1000, 3600000);
  integer(c.rpcTimeoutMs, 'rpcTimeoutMs', 100, 300000);
  integer(c.shutdownTimeoutMs, 'shutdownTimeoutMs', 100, 300000);
  integer(c.maxRunMs, 'maxRunMs', 1000, 86400000);
  integer(c.missingReportReminders, 'missingReportReminders', 0, 3);
  integer(c.maxContinuations, 'maxContinuations', 0, 100);
  invariant(Array.isArray(c.pools) && c.pools.length > 0, 'At least one provider pool required');
  const ids = new Set();
  for (const p of c.pools) {
    safeId(p.id, 'pool id'); invariant(!ids.has(p.id), 'Duplicate pool id'); ids.add(p.id);
    integer(p.priority, 'priority', 0, 100); integer(p.weight, 'weight', 1, 1000);
    integer(p.maxConcurrent, 'maxConcurrent', 1, 64); invariant(typeof p.enabled === 'boolean', 'enabled must be boolean');
  }
  for (const p of [...c.pools, c.coordinator]) {
    invariant(p, 'coordinator required');
    nonempty(p.provider, 'provider', 100); nonempty(p.model, 'model', 200);
    invariant(['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'].includes(p.thinking), 'Invalid thinking level');
  }
  return c;
}
export function loadConfig(file) {
  file = resolve(file); const c = validateConfig(JSON.parse(readFileSync(file, 'utf8').replace(/^\uFEFF/, '')));
  c.piCli=process.env.REPOSTEW_PI_CLI??c.piCli;
  for (const k of ['runtimeDir', 'workRoot', 'workspace', 'piCli']) c[k] = canonical(resolve(dirname(file), nonempty(c[k], k)));
  if(c.policyDir)c.policyDir=canonical(resolve(dirname(file),nonempty(c.policyDir,'policyDir')));
  invariant(!within(c.workRoot, c.runtimeDir) && !within(c.runtimeDir, c.workRoot), 'runtimeDir and workRoot must not overlap');
  nonempty(c.python, 'python', 1000); c.configFile = file;
  return c;
}
export function validateCampaign(c) {
  safeId(c.id, 'campaign id'); nonempty(c.mandate, 'mandate');
  invariant(Array.isArray(c.allowedProjects) && Array.isArray(c.allowedHosts), 'Specify allowedProjects and allowedHosts explicitly');
  c.allowedProjects.forEach(p => projectKey(p));
  c.allowedHosts.forEach(h => invariant(/^[a-z0-9.-]+$/i.test(h), 'Invalid allowed host'));
  invariant(c.allowedProjects.length + c.allowedHosts.length > 0, 'Campaign must declare a project or host scope');
  invariant(['read-only', 'engineering'].includes(c.workerMode), 'workerMode must be read-only or engineering');
  invariant(typeof c.continuous === 'boolean', 'continuous required');
  integer(c.revisitMs, 'revisitMs', 60000, 86400000);
  if(c.workflow!==undefined)nonempty(c.workflow,'workflow',100);
  if(c.candidates!==undefined) {
    invariant(Array.isArray(c.candidates),'candidates must be an array');
    const keys=new Set();
    for(const candidate of c.candidates){const key=projectKey(candidate.project??candidate);invariant(!keys.has(key),'Duplicate candidate project');keys.add(key);}
  }
  return c;
}
export function assignmentDir(c, project, id) {
  safeId(id); const key = projectKey(project); const path = resolve(c.workRoot, key, id);
  invariant(within(c.workRoot, path) && path !== c.workRoot, 'Assignment path escapes work root');
  mkdirSync(path, { recursive: true });
  invariant(within(c.workRoot, path), 'Assignment symlink escapes work root');
  return path;
}
