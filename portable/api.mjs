import {normalizeProgress} from '../server/state.mjs';
export function createApi({authenticate,repository,origin}){
 const reply=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','Vary':'Authorization','X-Content-Type-Options':'nosniff'}});
 return async request=>{
  const path=new URL(request.url).pathname;
  if(!['/api/account','/api/progress'].includes(path))return reply({error:'not_found'},404);
  let user;try{user=await authenticate(request)}catch{return reply({error:'identity_unavailable'},503)}
  if(!user)return reply({error:'authentication_required'},401);
  if(path==='/api/account')return request.method==='GET'?reply({id:user.id,email:user.email}):reply({error:'method_not_allowed'},405);
  try{
   if(request.method==='GET')return reply(await repository.load(user));
   if(request.method!=='PUT')return reply({error:'method_not_allowed'},405);
   if(request.headers.get('origin')!==origin)return reply({error:'origin_rejected'},403);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return reply({error:'json_required'},415);
   const raw=await request.text();if(new TextEncoder().encode(raw).length>2000000)return reply({error:'payload_too_large'},413);
   let body;try{body=JSON.parse(raw)}catch{return reply({error:'invalid_body'},400)}
   if(!Number.isSafeInteger(body.revision)||body.revision<0||!/^[a-zA-Z0-9_-]{1,100}$/.test(body.writeId||''))return reply({error:'invalid_request'},400);
   let progress;try{progress=normalizeProgress(body.progress)}catch{return reply({error:'invalid_progress'},422)}
   const result=await repository.save(user,progress,body.revision,body.writeId);return reply(result,result.error?409:200);
  }catch{return reply({error:'storage_unavailable'},503)}
 };
}
