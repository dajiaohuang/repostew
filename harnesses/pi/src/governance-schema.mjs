import {z} from 'zod';

const id=z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/);
const text=z.string().min(1).max(30000);
const project=z.object({host:z.string().min(1).max(100),namespace:z.string().min(1).max(200),repo:z.string().min(1).max(200)}).strict();
const model=z.object({provider:z.string().min(1),model:z.string().min(1),thinking:z.enum(['off','minimal','low','medium','high','xhigh','max'])}).strict();
const target=z.discriminatedUnion('kind',[
  z.object({kind:z.literal('all')}).strict(),
  z.object({kind:z.literal('coordinator'),id}).strict(),
  z.object({kind:z.literal('worker'),id}).strict(),
]);
const singleTarget=z.discriminatedUnion('kind',target.options.slice(1));
const brief=z.object({objectOutcome:text,locationPrior:text,completeTodo:text,authorityResources:text,finishReturn:text}).strict();
const source=z.object({
  id,kind:z.enum(['github-notifications','github-issues','github-repositories','gitlab-issues','gitlab-merge-requests','url','capture-file']),
  host:z.string().min(1).optional(),query:text.optional(),project:project.optional(),
  since:z.iso.datetime().optional(),until:z.iso.datetime().optional(),windowMs:z.number().int().min(60000).max(90*86400000).optional(),
  url:z.url().optional(),path:z.string().min(1).max(2000).optional(),expectedProvenance:z.record(z.string(),z.string()).optional(),
}).strict();
const task=z.object({id,project,brief,workerMode:z.enum(['read-only','engineering']),workflow:z.string().min(1).max(100).optional()}).strict();
const campaign=z.object({id,mandate:text,allowedProjects:z.array(project),allowedHosts:z.array(z.string().min(1)),workerMode:z.enum(['read-only','engineering']),continuous:z.boolean(),revisitMs:z.number().int().min(60000).max(86400000),workflow:z.string().min(1).max(100).optional(),sources:z.array(source).max(50).optional(),freshMembership:z.boolean().optional(),requireAdmission:z.boolean().optional(),requireAbsentProjectRoot:z.boolean().optional(),candidates:z.array(z.object({project,evidence:z.string().optional()}).passthrough()).optional()}).strict();
const pool=model.extend({id,priority:z.number().int().min(0).max(100),weight:z.number().int().min(1).max(1000),maxConcurrent:z.number().int().min(1).max(64),enabled:z.boolean()});
const decision=z.object({taskId:id,runId:z.string().uuid(),disposition:z.enum(['delivered','no_delivery','continue','blocked','failed']),reason:text,nextAction:z.string().max(12000).optional(),reconciliation:z.string().max(6000).optional()}).strict();
const recovery=z.object({additionalAttempts:z.number().int().min(1).max(3),deadline:z.iso.datetime(),authority:text}).strict();
export const commandSchema=z.discriminatedUnion('action',[
  ...['resume','pause','drain','stop'].map(action=>z.object({action:z.literal(action),target}).strict()),
  z.object({action:z.literal('coordinator-add'),spec:z.object({id,campaign,model:model.optional(),maxWorkers:z.number().int().min(1).max(64).optional()}).strict()}).strict(),
  z.object({action:z.literal('dispatch-independent'),task}).strict(),
  z.object({action:z.literal('dispatch'),coordinatorId:id,task:task.omit({workerMode:true,workflow:true})}).strict(),
  z.object({action:z.literal('wake'),coordinatorId:id,message:text}).strict(),
  z.object({action:z.literal('message'),target:singleTarget,message:text,messageId:z.string().min(1).max(200)}).strict(),
  z.object({action:z.literal('decide-independent'),decision}).strict(),
  z.object({action:z.literal('routing'),pools:z.array(pool).min(1).optional(),maxWorkers:z.number().int().min(1).max(64).optional(),maxCoordinators:z.number().int().min(1).max(32).optional()}).strict(),
  z.object({action:z.literal('clear-provider'),id,evidence:text}).strict(),
  z.object({action:z.literal('clear-forge'),evidence:text,host:z.string().min(1).optional(),project:project.optional(),source:z.object({coordinatorId:id,id}).strict().optional()}).strict().refine(v=>[v.host,v.project,v.source].filter(Boolean).length<=1,'Name one affected host, project or source'),
  z.object({action:z.literal('reconcile'),taskId:id.optional(),coordinatorId:id.optional(),runId:z.string().uuid(),decision:z.enum(['continue','close']),evidence:text,message:text.optional(),recovery:recovery.optional()}).strict().refine(v=>Boolean(v.taskId)!==Boolean(v.coordinatorId),'Name exactly one task or coordinator'),
  z.object({action:z.literal('incident-resolve'),id:z.string().min(1).max(200),evidence:text}).strict(),
]);
export const governanceRequestSchema=z.object({requestId:z.string().min(1).max(200).describe('Stable operation ID. Reuse this ID only to retrieve the same operation, never change its command.'),command:commandSchema}).strict();
export const inspectTargetSchema=z.object({target:singleTarget}).strict();
