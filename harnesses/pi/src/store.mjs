import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

// Execution state only. Pi owns conversation/TODO state; state.md/work.md own
// project coordination. Only the local service writes this execution database.
export class Store {
  constructor(path) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
    const version=this.value('schemaVersion');
    if(version!==undefined && ![1,2].includes(version))throw new Error('Unsupported runtime database version');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (id TEXT PRIMARY KEY, project TEXT NOT NULL, status TEXT NOT NULL, data TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS task_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS task_project ON tasks(project);
      CREATE TABLE IF NOT EXISTS runs (id TEXT PRIMARY KEY, owner TEXT NOT NULL, status TEXT NOT NULL, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, owner TEXT, data TEXT NOT NULL, consumed INTEGER NOT NULL DEFAULT 0);
      CREATE INDEX IF NOT EXISTS event_pending ON events(consumed,seq);
      CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS candidates (key TEXT PRIMARY KEY, data TEXT NOT NULL, disposition TEXT);
      CREATE TABLE IF NOT EXISTS decisions (run TEXT PRIMARY KEY, task TEXT NOT NULL, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS coordinators (id TEXT PRIMARY KEY, data TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS incidents (id TEXT PRIMARY KEY, status TEXT NOT NULL, data TEXT NOT NULL);`);
    if(version!==2)this.migrateV1();
  }
  migrateV1() {
    this.transaction(()=>{
      this.db.exec(`ALTER TABLE tasks ADD COLUMN coordinator TEXT DEFAULT 'c1';
        ALTER TABLE events ADD COLUMN coordinator TEXT DEFAULT 'c1';
        CREATE INDEX task_coordinator ON tasks(coordinator,status);
        CREATE INDEX event_coordinator ON events(coordinator,consumed,seq);
        ALTER TABLE candidates RENAME TO candidates_v1;
        CREATE TABLE candidates (coordinator TEXT NOT NULL, key TEXT NOT NULL, data TEXT NOT NULL, disposition TEXT, PRIMARY KEY(coordinator,key));
        INSERT INTO candidates SELECT 'c1',key,data,disposition FROM candidates_v1;
        DROP TABLE candidates_v1;
        CREATE INDEX candidate_disposition ON candidates(coordinator,disposition);`);
      const legacy=this.value('coordinator'),campaign=this.value('campaign');
      if(legacy||campaign)this.putCoordinator({id:'c1',mode:'running',...legacy,campaign});
      for(const row of this.db.prepare('SELECT id,data FROM tasks').all()) {
        const t=JSON.parse(row.data);t.coordinatorId='c1';
        this.db.prepare('UPDATE tasks SET data=? WHERE id=?').run(JSON.stringify(t),row.id);
      }
      for(const row of this.db.prepare('SELECT id,data FROM runs').all()) {
        const r=JSON.parse(row.data);r.role=r.owner==='c1'?'coordinator':'worker';r.coordinatorId='c1';
        this.db.prepare('UPDATE runs SET data=? WHERE id=?').run(JSON.stringify(r),row.id);
      }
      // Move legacy keys; there is never a second writable C1/campaign record.
      this.db.prepare("DELETE FROM kv WHERE key IN ('coordinator','campaign')").run();
      this.set('schemaVersion',2);
    });
  }
  value(key) {const row=this.db.prepare('SELECT value FROM kv WHERE key=?').get(key);return row?JSON.parse(row.value):undefined;}
  // Compatibility for the original single-C operator scripts.
  get(key) {
    if(key==='coordinator'){const c=this.coordinator('c1');if(!c)return undefined;const {campaign,...state}=c;return state;}
    if(key==='campaign')return this.coordinator('c1')?.campaign;
    return this.value(key);
  }
  set(key,value) {
    if(key==='coordinator'){const old=this.coordinator('c1');this.putCoordinator({id:'c1',mode:'running',...value,campaign:old?.campaign});return;}
    if(key==='campaign'){this.putCoordinator({...this.coordinator('c1'),id:'c1',campaign:value});return;}
    this.db.prepare('INSERT INTO kv VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,JSON.stringify(value));
  }
  coordinator(id) {const r=this.db.prepare('SELECT data FROM coordinators WHERE id=?').get(id);return r?JSON.parse(r.data):undefined;}
  coordinators() {return this.db.prepare('SELECT data FROM coordinators ORDER BY rowid').all().map(r=>JSON.parse(r.data));}
  putCoordinator(c) {this.db.prepare('INSERT INTO coordinators VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(c.id,JSON.stringify(c));}
  task(id) {const r=this.db.prepare('SELECT data FROM tasks WHERE id=?').get(id);return r?JSON.parse(r.data):undefined;}
  tasks(coordinatorId=undefined) {
    const rows=coordinatorId===undefined?this.db.prepare('SELECT data FROM tasks ORDER BY rowid').all():this.db.prepare('SELECT data FROM tasks WHERE coordinator IS ? ORDER BY rowid').all(coordinatorId);
    return rows.map(r=>JSON.parse(r.data));
  }
  putTask(t) {this.db.prepare('INSERT INTO tasks(id,project,status,data,coordinator) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,data=excluded.data,coordinator=excluded.coordinator').run(t.id,t.projectKey,t.status,JSON.stringify(t),t.coordinatorId??null);}
  run(id) {const r=this.db.prepare('SELECT data FROM runs WHERE id=?').get(id);return r?JSON.parse(r.data):undefined;}
  runs() {return this.db.prepare('SELECT data FROM runs ORDER BY rowid').all().map(r=>JSON.parse(r.data));}
  putRun(r) {this.db.prepare('INSERT INTO runs VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,data=excluded.data').run(r.id,r.owner,r.status,JSON.stringify(r));}
  event(kind,owner,data={},coordinatorId='c1') {return Number(this.db.prepare('INSERT INTO events(kind,owner,data,coordinator) VALUES (?,?,?,?)').run(kind,owner,JSON.stringify({at:new Date().toISOString(),...data}),coordinatorId).lastInsertRowid);}
  events(limit=100,coordinatorId=undefined) {
    const rows=coordinatorId===undefined?this.db.prepare('SELECT * FROM events WHERE consumed=0 ORDER BY seq LIMIT ?').all(limit):this.db.prepare('SELECT * FROM events WHERE consumed=0 AND coordinator IS ? ORDER BY seq LIMIT ?').all(coordinatorId,limit);
    return rows.map(r=>({...r,data:JSON.parse(r.data)}));
  }
  consume(ids) {const q=this.db.prepare('UPDATE events SET consumed=1 WHERE seq=?');for(const id of ids)q.run(id);}
  consumeKind(kind,coordinatorId) {this.db.prepare('UPDATE events SET consumed=1 WHERE kind=? AND coordinator IS ?').run(kind,coordinatorId);}
  receipt(id) {const r=this.db.prepare('SELECT value FROM requests WHERE id=?').get(id);return r?JSON.parse(r.value):undefined;}
  saveReceipt(id,value) {this.db.prepare('INSERT INTO requests VALUES (?,?)').run(id,JSON.stringify(value));}
  updateReceipt(id,value) {this.db.prepare('UPDATE requests SET value=? WHERE id=?').run(JSON.stringify(value),id);}
  addCandidates(coordinatorId,candidates,projectKey) {const insert=this.db.prepare('INSERT INTO candidates(coordinator,key,data) VALUES (?,?,?)');for(const candidate of candidates)insert.run(coordinatorId,projectKey(candidate.project??candidate),JSON.stringify(candidate));}
  candidate(key,coordinatorId='c1') {const r=this.db.prepare('SELECT data,disposition FROM candidates WHERE coordinator=? AND key=?').get(coordinatorId,key);return r?{...JSON.parse(r.data),disposition:r.disposition?JSON.parse(r.disposition):undefined}:undefined;}
  skipCandidate(key,disposition,coordinatorId='c1') {this.db.prepare('UPDATE candidates SET disposition=? WHERE coordinator=? AND key=?').run(JSON.stringify(disposition),coordinatorId,key);}
  remainingCandidates(coordinatorId='c1') {return this.db.prepare("SELECT count(*) AS n FROM candidates c WHERE c.coordinator=? AND c.disposition IS NULL AND NOT EXISTS(SELECT 1 FROM tasks t WHERE t.project=c.key AND t.coordinator=c.coordinator AND COALESCE(json_extract(t.data,'$.queueWithdrawn'),0)=0)").get(coordinatorId).n;}
  candidatePage(limit,coordinatorId='c1') {return this.db.prepare("SELECT data FROM candidates c WHERE c.coordinator=? AND c.disposition IS NULL AND NOT EXISTS(SELECT 1 FROM tasks t WHERE t.project=c.key AND t.coordinator=c.coordinator AND COALESCE(json_extract(t.data,'$.queueWithdrawn'),0)=0) ORDER BY rowid LIMIT ?").all(coordinatorId,limit).map(r=>JSON.parse(r.data));}
  skippedCandidates(coordinatorId='c1') {return this.db.prepare('SELECT count(*) AS n FROM candidates WHERE coordinator=? AND disposition IS NOT NULL').get(coordinatorId).n;}
  decision(run) {const r=this.db.prepare('SELECT data FROM decisions WHERE run=?').get(run);return r?JSON.parse(r.data):undefined;}
  putDecision(run,task,data) {this.db.prepare('INSERT INTO decisions VALUES (?,?,?) ON CONFLICT(run) DO UPDATE SET data=excluded.data').run(run,task,JSON.stringify(data));}
  incident(id) {const r=this.db.prepare('SELECT data FROM incidents WHERE id=?').get(id);return r?JSON.parse(r.data):undefined;}
  incidents(status='open') {return this.db.prepare('SELECT data FROM incidents WHERE status=? ORDER BY rowid').all(status).map(r=>JSON.parse(r.data));}
  putIncident(i) {this.db.prepare('INSERT INTO incidents VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,data=excluded.data').run(i.id,i.status,JSON.stringify(i));}
  transaction(fn) {this.db.exec('BEGIN IMMEDIATE');try{const result=fn();this.db.exec('COMMIT');return result;}catch(e){this.db.exec('ROLLBACK');throw e;}}
  close(){this.db.close();}
}
