import {normalizeProgress} from './state.mjs';
const MAX_BYTES=2000000;
const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store, private','Vary':'Cookie','X-Content-Type-Options':'nosniff'}});
async function readBody(request){const reader=request.body?.getReader();if(!reader)throw Error('invalid_body');const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BYTES){await reader.cancel();throw Error('too_large')}chunks.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength}return JSON.parse(new TextDecoder().decode(bytes));}
export async function api(request,env){
 const path=new URL(request.url).pathname;
 if(!['/api/account','/api/progress'].includes(path))return reply({error:'not_found'},404);
 // These identity headers are supplied by the Sites dispatcher, never by a body/query parameter.
 const userId=request.headers.get('oai-authenticated-user-id');
 if(!userId)return reply({error:'authentication_required'},401);
 if(path==='/api/account'){if(request.method!=='GET')return reply({error:'method_not_allowed'},405);return reply({id:userId,email:request.headers.get('oai-authenticated-user-email')||null});}
 if(!env.DB)return reply({error:'storage_unavailable'},503);
 if(!['GET','PUT'].includes(request.method))return reply({error:'method_not_allowed'},405);
 if(request.method==='PUT'){
  const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return reply({error:'origin_rejected'},403);
  if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'json_required'},415);
 }
 try{
  if(request.method==='GET'){const row=await env.DB.prepare('SELECT payload, revision, last_write_id, updated_at FROM learner_states WHERE user_id = ?').bind(userId).first();return reply(row?{progress:JSON.parse(row.payload),revision:row.revision,writeId:row.last_write_id,updatedAt:row.updated_at}:{progress:null,revision:0,writeId:null});}
  let body;try{body=await readBody(request);}catch(e){return reply({error:e.message==='too_large'?'payload_too_large':'invalid_body'},e.message==='too_large'?413:400);}
  if(!Number.isSafeInteger(body?.revision)||body.revision<0||typeof body.writeId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(body.writeId))return reply({error:'invalid_request'},400);
  let progress;try{progress=normalizeProgress(body.progress);}catch{return reply({error:'invalid_progress'},422);}
  const payload=JSON.stringify(progress),updatedAt=new Date().toISOString();
  // One atomic compare-and-swap: parallel devices cannot silently replace each other.
  const result=body.revision===0
   ?await env.DB.prepare('INSERT INTO learner_states (user_id,payload,revision,last_write_id,updated_at) VALUES (?,?,1,?,?) ON CONFLICT(user_id) DO NOTHING').bind(userId,payload,body.writeId,updatedAt).run()
   :await env.DB.prepare('UPDATE learner_states SET payload=?, revision=revision+1,last_write_id=?,updated_at=? WHERE user_id=? AND revision=? AND last_write_id<>?').bind(payload,body.writeId,updatedAt,userId,body.revision,body.writeId).run();
  if(result.meta.changes===1)return reply({revision:body.revision+1,writeId:body.writeId,updatedAt});
  const row=await env.DB.prepare('SELECT revision,last_write_id,updated_at FROM learner_states WHERE user_id=?').bind(userId).first();
  if(row?.last_write_id===body.writeId)return reply({revision:row.revision,writeId:row.last_write_id,updatedAt:row.updated_at});
  return reply({error:'revision_conflict'},409);
 }catch{console.error('Progress storage operation failed');return reply({error:'storage_unavailable'},503);}
}
