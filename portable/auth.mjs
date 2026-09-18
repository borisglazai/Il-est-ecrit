export function createAuthenticator({url,key,fetcher=fetch}){
 return async request=>{
  const token=request.headers.get('authorization');
  if(!token?.startsWith('Bearer ')||token.length>16000)return null;
  const response=await fetcher(url+'/auth/v1/user',{headers:{apikey:key,Authorization:token},signal:AbortSignal.timeout(8000)});
  if(response.status===401||response.status===403)return null;
  if(!response.ok)throw Error('identity_unavailable');
  const user=await response.json();
  if(!/^[0-9a-f-]{36}$/i.test(user.id||''))return null;
  return {id:user.id,subject:user.id,provider:'supabase',email:user.email||null};
 };
}
