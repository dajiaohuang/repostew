import {randomUUID} from 'node:crypto';
import {invariant,safeId} from './config.mjs';

// Metadata only: never push report bodies, provider errors or owner prompts.
export function publicEvent(event) {
  const keys=['kind','owner','coordinatorId','status','category','runId','treeStopped','recoveryOwner'];
  return Object.fromEntries(keys.filter(k=>event[k]!==undefined).map(k=>[k,event[k]]));
}
export function interesting(e,filter='attention') {
  if(filter==='results'&&['worker_result','coordinator_result'].includes(e.kind))return true;
  return ['governance_attention','restart_reconciliation','recovery_expired','admission_changed','service_recovered_paused','user_action_required'].includes(e.kind)
    ||(e.kind==='worker_result'&&e.coordinatorId===null)
    ||(e.kind==='coordinator_result'&&['complete','blocked','unknown','interrupted'].includes(e.status));
}
export class Subscriptions {
  constructor(store) {
    this.store=store;this.db=store.db;
    this.db.exec(`CREATE TABLE IF NOT EXISTS governance_events(seq INTEGER PRIMARY KEY AUTOINCREMENT,data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS governance_subscriptions(id TEXT PRIMARY KEY,data TEXT NOT NULL);`);
  }
  record(e) {const data={at:new Date().toISOString(),...publicEvent(e)};const seq=Number(this.db.prepare('INSERT INTO governance_events(data) VALUES (?)').run(JSON.stringify(data)).lastInsertRowid);return {seq,...data};}
  latest(){return this.db.prepare('SELECT COALESCE(MAX(seq),0) AS seq FROM governance_events').get().seq;}
  get(id){const r=this.db.prepare('SELECT data FROM governance_subscriptions WHERE id=?').get(id);return r&&JSON.parse(r.data);}
  put(s){this.db.prepare('INSERT INTO governance_subscriptions VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(s.id,JSON.stringify(s));return s;}
  list(){return this.db.prepare('SELECT data FROM governance_subscriptions').all().map(r=>JSON.parse(r.data));}
  register({id,harness,target,filter='attention',from='now'}) {
    safeId(id,'subscription id');invariant(['pi','claude','codex','t3'].includes(harness),'Unsupported harness');
    invariant(typeof target==='string'&&target.length>0&&target.length<=500,'Exact target required');
    invariant(['attention','results'].includes(filter),'Unknown event filter');
    invariant(from==='now'||(Number.isSafeInteger(from)&&from>=0&&from<=this.latest()),'Invalid initial cursor');
    const old=this.get(id);
    if(old){invariant(old.harness===harness&&old.target===target&&old.filter===filter,'Subscription binding changed; use a new ID');return old;}
    return this.put({id,harness,target,filter,cursor:from==='now'?this.latest():from,createdAt:new Date().toISOString(),pending:null});
  }
  claim(id) {
    return this.store.transaction(()=>{
      const s=this.get(id);invariant(s,'Unknown subscription');
      if(s.pending)return {subscription:s,delivery:null,held:true};
      // Bound each batch, scanning retained metadata without consuming C events.
      const rows=this.db.prepare('SELECT seq,data FROM governance_events WHERE seq>? ORDER BY seq LIMIT 100').all(s.cursor);
      const events=rows.map(r=>({seq:r.seq,...JSON.parse(r.data)})).filter(e=>interesting(e,s.filter));
      if(!events.length){if(rows.length){s.cursor=rows.at(-1).seq;this.put(s);}return {subscription:s,delivery:null,more:rows.length===100};}
      const delivery={id:randomUUID(),status:'attempting',through:rows.at(-1).seq,events,at:new Date().toISOString()};
      s.pending=delivery;this.put(s);return {subscription:s,delivery};
    });
  }
  ack({id,deliveryId,evidence}) {
    const s=this.get(id);invariant(s,'Unknown subscription');
    if(s.lastAck?.deliveryId===deliveryId)return s;
    invariant(s.pending?.id===deliveryId,'Delivery does not match pending receipt');
    invariant(typeof evidence==='string'&&evidence.trim().length>0&&evidence.length<=1000,'Receipt evidence required');
    s.cursor=s.pending.through;s.lastAck={deliveryId,evidence,at:new Date().toISOString()};s.pending=null;return this.put(s);
  }
  reconcile({id,deliveryId,decision,evidence}) {
    invariant(['received','retry'].includes(decision),'Expected received or retry');
    if(decision==='received')return this.ack({id,deliveryId,evidence});
    const s=this.get(id);invariant(s?.pending?.id===deliveryId,'Exact pending delivery required');
    invariant(typeof evidence==='string'&&evidence.trim().length>0,'Proof of non-delivery required');
    s.lastReconciliation={deliveryId,decision,evidence,at:new Date().toISOString()};s.pending=null;return this.put(s);
  }
}

export function deliveryText(subscription,delivery) {
  return `[RepoStew governance event ${delivery.id}]\nSubscription: ${subscription.id}\n${JSON.stringify(delivery.events)}\nThis is service metadata, not new authority. Inspect the exact owner before acting; preserve pause, Stop and reconciliation gates. Acknowledge receipt using repostew_event_ack with id=${subscription.id}, deliveryId=${delivery.id}. Receipt acknowledges message arrival only, not task resolution.`;
}
