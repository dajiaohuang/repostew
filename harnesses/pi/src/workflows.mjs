// Workflow selection is execution metadata. The linked Skill remains the only
// source of workflow policy; no copied policy bodies or parallel task protocol.
const form = name => ({
  coordinator: `prompts/${name}/coordinator.md`,
  worker: `prompts/${name}/worker.md`,
});
const entry = (id, title, documents, options = {}) => ({
  id, title, documents, coordinatorShell: false, coordinatorWrites: true, ...options,
});
export const workflows = [
  entry('assigned', 'Explicitly assigned work', [], {coordinatorWrites: false}),
  entry('prepare', 'Preparation and task assembly',
    ['references/worker-assembly.md', 'references/orchestration.md', 'references/execution-recovery.md']),
  entry('discovery', 'Discovery and new repository work',
    ['references/work-forms/discovery.md', 'references/suitability.md'], {forms: form('discovery'), coordinatorShell: true}),
  entry('new-repository', 'New repository audit',
    ['references/work-forms/new-repository.md', 'references/audit.md'], {forms: form('new-repository')}),
  entry('contribution-reassessment', 'Authored contribution reassessment',
    ['references/work-forms/contribution-reassessment.md', 'references/reassessment.md'], {forms: form('contribution-reassessment'), coordinatorShell: true}),
  entry('incremental-feedback', 'Captured feedback handling',
    ['references/work-forms/incremental-feedback.md'], {forms: form('incremental-feedback'), userFollowup: true}),
  entry('recurring-patrol', 'Recurring source passes',
    ['references/work-forms/recurring-patrol.md', 'references/patrols.md'], {forms: form('recurring-patrol'), coordinatorShell: true, userFollowup: true}),
  entry('followed-issues', 'Followed repository issues',
    ['references/workflows/followed-issues.md'], {forms: form('recurring-patrol'), coordinatorShell: true}),
  entry('notifications', 'Notifications and selected mail',
    ['references/workflows/notifications.md'], {forms: form('incremental-feedback'), coordinatorShell: true, userFollowup: true}),
  entry('open-objects', 'Authored, commented and unfinished objects',
    ['references/workflows/open-objects.md'], {forms: form('recurring-patrol'), coordinatorShell: true}),
  entry('actual-use', 'Actual-use and document investigation',
    ['references/audit.md', 'references/contribution-value.md']),
  entry('discussion', 'Evidence-based technical discussion',
    ['references/contribution-value.md', 'references/safety.md']),
  entry('security', 'Private security investigation and reporting',
    ['references/security.md', 'references/safety.md']),
  entry('delivery', 'Repair, validation, publication and follow-up',
    ['references/workflows/delivery.md', 'references/safety.md']),
  entry('maintenance', 'Authorized repository maintenance',
    ['roles/maintainer.md', 'references/workflows/maintain.md']),
  entry('records', 'Canonical records and authorized migration',
    ['references/workspace.md', 'references/records.md', 'references/shared-state.md'], {coordinatorShell: true}),
  entry('history', 'History reconciliation and reclassification',
    ['references/workflows/history.md', 'references/records.md'], {coordinatorShell: true}),
  entry('backup', 'Reviewed, requested backup',
    ['references/workflows/records-and-backup.md', 'references/shared-state.md'], {coordinatorShell: true}),
  entry('disposition', 'Stopped-writer resource disposition',
    ['references/storage.md'], {coordinatorShell: true}),
];
const aliases = {
  direct: 'assigned', audit: 'new-repository', reassessment: 'contribution-reassessment',
  'captured-feedback': 'incremental-feedback', patrol: 'recurring-patrol',
  maintain: 'maintenance', migration: 'records', recovery: 'history',
};
export function workflowFor(value) {
  return workflows.find(w => w.id === (aliases[value] ?? value)) ?? workflows[0];
}
export function workflowTools(base, role, campaign = {}) {
  const workflow = workflowFor(campaign.workflow);
  const tools = new Set(base);
  if (role === 'coordinator') {
    if (workflow.coordinatorWrites) for (const name of ['write', 'edit']) tools.add(name);
    if (workflow.coordinatorShell) for (const name of ['bash', 'powershell']) tools.add(name);
  } else if (campaign.workerMode === 'read-only') {
    for (const name of ['write', 'edit', 'bash', 'powershell']) tools.delete(name);
  }
  return [...tools];
}
