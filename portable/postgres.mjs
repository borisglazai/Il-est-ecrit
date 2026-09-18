// Domain storage uses ordinary PostgreSQL, without a Sites or Supabase database API.
export class ProgressRepository {
 constructor(pool){this.pool=pool;}
 async transaction(user,fn){const c=await this.pool.connect();try{await c.query('BEGIN');await c.query("SELECT set_config('iee.user_id',$1,true)",[user.id]);const result=await fn(c);await c.query('COMMIT');return result;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
 async load(user){return this.transaction(user,async c=>{const {rows}=await c.query('SELECT payload,revision,last_write_id,updated_at FROM iee.progress WHERE user_id=$1',[user.id]);const r=rows[0];return r?{progress:r.payload,revision:r.revision,writeId:r.last_write_id,updatedAt:r.updated_at}:{progress:null,revision:0,writeId:null};});}
 async save(user,p,revision,writeId){return this.transaction(user,async c=>{
  await c.query('INSERT INTO iee.users(id,provider,subject) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING',[user.id,user.provider,user.subject]);
  await c.query('INSERT INTO iee.progress(user_id) VALUES($1) ON CONFLICT(user_id) DO NOTHING',[user.id]);
  const {rows:[current]}=await c.query('SELECT revision,last_write_id FROM iee.progress WHERE user_id=$1 FOR UPDATE',[user.id]);
  if(current.last_write_id===writeId)return {revision:current.revision,writeId};
  if(current.revision!==revision)return {error:'revision_conflict'};
  const {rows:old}=await c.query('SELECT id,evidence FROM iee.learning_sessions WHERE user_id=$1',[user.id]);
  const submitted=new Map(p.sessions.map(s=>[s.id,s]));
  const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
  const stable=x=>JSON.stringify(canonical(x));
  // Completed learning evidence is append-only. Never delete history with a snapshot.
  for(const row of old){if(!submitted.has(row.id)||stable(submitted.get(row.id))!==stable(row.evidence))return {error:'history_conflict'};}
  const known=new Set(old.map(x=>x.id));
  for(const s of p.sessions){if(known.has(s.id))continue;
   await c.query('INSERT INTO iee.learning_sessions(user_id,id,lesson_id,completed_at,evidence) VALUES($1,$2,$3,$4,$5)',[user.id,s.id,s.lessonId,s.completedAt,s]);
   for(const a of s.attempts)await c.query('INSERT INTO iee.learning_attempts(user_id,session_id,id,skill,answer,correct,hint,answered_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[user.id,s.id,a.id,a.skill,a.answer,a.correct,a.hint,a.at]);
  }
  const {rows:[saved]}=await c.query('UPDATE iee.progress SET payload=$1,revision=revision+1,last_write_id=$2,updated_at=now() WHERE user_id=$3 RETURNING revision,updated_at',[p,writeId,user.id]);
  return {revision:saved.revision,writeId,updatedAt:saved.updated_at};
 });}
}
