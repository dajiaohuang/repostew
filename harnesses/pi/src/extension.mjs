// Explicitly loaded per isolated Pi process. No autoload, timers or delegation here.
const str=(description,maxLength=30000)=>({type:'string',minLength:1,maxLength,description});
const obj=properties=>({type:'object',properties,required:Object.keys(properties),additionalProperties:false});
const project=obj({host:str('Native forge host',100),namespace:str('Owner or nested namespace',200),repo:str('Native repository name',200)});
const brief=obj({objectOutcome:str('Object and complete outcome'),locationPrior:str('Location and prior work'),completeTodo:str('Complete TODO through delivery'),authorityResources:str('Authority and resource boundaries'),finishReturn:str('Finish criteria and evidence')});

export default function harnessExtension(pi) {
  const base=process.env.REPOSTEW_HARNESS_URL;
  const token=process.env.REPOSTEW_RUN_TOKEN;
  const run=process.env.REPOSTEW_RUN_ID;
  const role=process.env.REPOSTEW_ROLE;
  if(!base || !token || !run || !['coordinator','worker'].includes(role)) throw new Error('Harness role binding is missing');
  async function send(action,payload,signal) {
    const response=await fetch(`${base}/agent/${run}/${action}`,{
      method:'POST',headers:{authorization:`Bearer ${token}`,'content-type':'application/json'},
      body:JSON.stringify(payload),signal:signal ? AbortSignal.any([signal,AbortSignal.timeout(30000)]) : AbortSignal.timeout(30000),
    });
    const data=await response.json(); if(!response.ok) throw new Error(data.error ?? `Harness HTTP ${response.status}`);
    return data;
  }
  function register(name,description,parameters,action) {
    pi.registerTool({name,label:name,description,parameters,executionMode:'sequential',
      async execute(id,params,signal) {
        const data=await send(action,{...params,requestId:id},signal);
        // Pi examples/extensions/structured-output.ts: a successful final
        // report terminates the turn, without another model round trip.
        return {content:[{type:'text',text:JSON.stringify(data)}],details:action==='report'?{...data,report:params}:data,...(action==='report'?{terminate:true}:{})};
      },
    });
  }
  register('harness_status','Current native task/capacity facts. Do not poll; use once when planning a dispatch.',obj({}),'status');
  register('harness_policy','List supported Skill workflows or read 1..8 complete canonical policy documents by relative path. Select methods for the actual action; do not recursively read all rules. This does not grant new scope, tools or permissions.',
    {type:'object',properties:{action:{type:'string',enum:['list','read']},paths:{type:'array',items:str('Canonical path such as references/security.md',300),minItems:1,maxItems:8}},required:['action'],additionalProperties:false},'policy');
  register('harness_repository','Read-only native GitHub/GitLab access for the assigned project: inspection, issue/PR/MR pages, exact objects/comments or files. Each page is partial until pagination finishes. This performs GET only and never claims public-write permission from push metadata.',
    {type:'object',properties:{project,operation:{type:'string',enum:['inspect','issues','pulls','issue','pull','issue-comments','pull-comments','file']},page:{type:'integer',minimum:1,maximum:10000},limit:{type:'integer',minimum:1,maximum:100},number:{type:'integer',minimum:1},path:str('Repository-relative file path',1000),ref:str('Native branch, tag or commit',500)},required:['operation'],additionalProperties:false},'repository');
  if(role==='coordinator') {
    register('harness_source','List or capture only the exact sources registered in your campaign. GET-only native pages or explicitly supplied capture files; raw pages remain local. Follow nextPage, then use the retained globally sorted processing index. Capture is not handling; search caps, missing pages and imported provenance limits remain explicit.',
      {type:'object',properties:{action:{type:'string',enum:['list','capture']},sourceId:str('Registered source ID',80),page:{type:'integer',minimum:1,maximum:10000}},required:['action'],additionalProperties:false},'source');
    register('harness_queue','Manage only your owned queue: list (paged), priority (-100..100; higher first), pause future dispatch, resume your own pause, or withdraw a never-started assignment. Pause never kills a running process or releases an unknown project. Global/operator pauses and all run/reconciliation budgets remain binding.',
      {type:'object',properties:{action:{type:'string',enum:['list','priority','pause','resume','withdraw']},taskId:str('Your task ID',80),reason:str('Concrete queue decision',2000),priority:{type:'integer',minimum:-100,maximum:100},offset:{type:'integer',minimum:0},limit:{type:'integer',minimum:1,maximum:50}},required:['action'],additionalProperties:false},'queue');
    register('harness_inspect','Read-only native GitHub/GitLab admission: identity, activity, contribution guidance and recent reception sample. A refreshed inspection requires a concrete changed-input reason. It does not establish a full issue window or action permission.',
      {type:'object',properties:{project,refresh:{type:'boolean'},reason:str('Changed input/evidence for refresh',2000)},required:['project'],additionalProperties:false},'inspect');
    register('harness_admit','Record your eligibility judgment after inspection. Explain target suitability and policy limits. This does not waive Worker native policy/identity/duplicate checks.',obj({project,reason:str('Concrete admission judgment and limitations',4000)}),'admit');
    register('harness_decide','Judge one exact Worker result event. Check complete assigned scope, TODO evidence and actual delivery: checkmarks alone are not completion. Continue concrete feasible omissions on the SAME task/session, retaining attempts/budgets. An earlier blocked/no_delivery/delivered judgment may be superseded by continue with new concrete reason, nextAction and stopped/effects reconciliation; previous judgment is retained. Do not rerun completed audit/tests without a causal need.',
      obj({taskId:str('Assignment id',80),runId:str('Exact completed run id',80),disposition:{type:'string',enum:['delivered','no_delivery','continue','blocked','failed']},reason:str('Coverage, evidence and delivery judgment',6000),nextAction:{type:'string',maxLength:12000},reconciliation:{type:'string',maxLength:6000}}),'decide');
    register('harness_dispatch','Assign one complete independent Worker unit. Stable id makes repeats idempotent. accepted=true reserves it even when status=waiting-capacity; never resend under a new ID. accepted=false leaves the input unassigned: retain it in your Pi session and wait for capacity or accepted children. Never duplicate a project writer.',
      obj({id:str('Stable assignment id: alphanumeric, underscore, hyphen',80),project,brief}),'dispatch');
    register('harness_candidates','Read the next bounded, already authorized candidate page. Selection is not work completion. Do not create new sources.',
      obj({limit:{type:'integer',minimum:1,maximum:20}}),'candidates');
    register('harness_skip','Record an evidenced unsuitable candidate from this campaign. No project engineering, no false completed audit.',
      obj({project,reason:str('Concrete suitability/exclusion reason',2000),evidence:str('Evidence reference',2000)}),'skip');
    register('harness_message','Send one combined same-task delta to an existing Worker. No new authority, replacement, or budget reset.',
      obj({taskId:str('Assignment id',80),message:str('Applicable delta',20000)}),'message');
    const resultSchema=obj({outcome:{type:'string',enum:['wait','complete','blocked','continue']},summary:str('Outcome and remaining scope',4000),evidence:{type:'array',items:str('Reference',2000),maxItems:20},remaining:{type:'array',items:str('Remaining item',2000),maxItems:20},blocker:{type:'string',maxLength:4000}});
    resultSchema.properties.waitFor={type:'object',properties:{kind:{type:'string',enum:['capacity','children','external','time']},until:{type:'string',description:'Future ISO datetime for time waits only'}},required:['kind'],additionalProperties:false};
    register('harness_result','End this C turn. waitFor names the durable wait: children (including accepted waiting-capacity tasks), capacity, external (exact blocker), or time (future until). Capacity is temporary waiting, not blocked. continue retains same-scope feasible remainder for a later native turn. blocked is for a real external gate; complete means the entire selected scope. This is not independent acceptance.',resultSchema,'report');
  } else {
    register('harness_task','Read your immutable assigned goal, attempts, continuation and result. Use Pi todo list for your session checklist. Use after compaction or recovery; do not poll.',obj({}),'task');
    const resultSchema=obj({outcome:{type:'string',enum:['delivered','no_delivery','blocked','failed','continue']},summary:str('Actual result, validation and limits',6000),evidence:{type:'array',items:str('Actual URL/head or local reference',2000),maxItems:20},remaining:{type:'array',items:str('Complete remaining work',2000),maxItems:20},blocker:{type:'string',maxLength:4000}});
    resultSchema.properties.userAction=obj({kind:{type:'string',enum:['cla','dco','other']},reference:str('Exact request URL or retained evidence reference',2000),action:str('Personal action for the user to decide, never execute for them',2000)});
    register('harness_result','End the Worker turn with its actual result. delivered/no_delivery require evidence and empty remaining/blocker. Post-submission CLA or other personal follow-up goes in optional userAction; only notification handling alerts the user. A platform barrier preventing submission remains blocked.',
      resultSchema,'report');
  }
  pi.on('tool_call',async event=>{
    if(event.toolName!=='harness_result') {
      try{await send('activity',{tool:event.toolName});}
      catch(e){return {block:true,reason:e.message};}
    }
  });
}
