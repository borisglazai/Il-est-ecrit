/* Account-scoped recovery cache; the server is authoritative after synchronization. */
(function(root){
 const copy=x=>JSON.parse(JSON.stringify(x));
 class AccountSync{
  constructor(storage,fetcher,onStatus){this.storage=storage;this.fetcher=fetcher;this.onStatus=onStatus;this.account=null;this.revision=0;this.pending=null;this.busy=false;this.conflict=false;this.lastSaved=null;}
  key(){return 'iee-account-v1:'+this.account.id;}
  cache(){this.storage.setItem(this.key(),JSON.stringify({revision:this.revision,pending:this.pending,lastSaved:this.lastSaved}));}
  async request(url,options){const r=await this.fetcher(url,{credentials:'same-origin',cache:'no-store',...options});if(!r.ok){const e=Error('http');e.status=r.status;throw e}return r.json();}
  async open(){
   this.account=await this.request('/api/account');
   const remote=await this.request('/api/progress');
   const raw=this.storage.getItem(this.key());let cache=null;
   if(raw){try{cache=JSON.parse(raw);if(!Number.isSafeInteger(cache.revision)||cache.revision<0||!('pending'in cache))throw Error();}catch{throw Error('invalid_cache')}}
   this.revision=remote.revision;this.lastSaved=remote.updatedAt||null;
   if(cache?.pending){
    this.pending=cache.pending;
    if(remote.writeId===cache.pending.writeId){this.pending=null;this.cache();return {progress:remote.progress,account:this.account}}
    if(cache.revision!==remote.revision){this.conflict=true;this.onStatus('conflict');return {progress:cache.pending.progress,account:this.account,conflict:true};}
    const progress=cache.pending.progress;this.flush();return {progress,account:this.account};
   }
   return {progress:remote.progress,account:this.account};
  }
  enqueue(progress){if(!this.account||this.conflict)return false;this.pending={writeId:crypto.randomUUID(),progress:copy(progress)};try{this.cache()}catch{this.onStatus('cache-error');return false}this.onStatus('pending');this.flush();return true;}
  async flush(){
   if(this.busy||!this.pending||this.conflict)return;this.busy=true;
   try{
    while(this.pending&&!this.conflict){
     const sending=this.pending;
     const result=await this.request('/api/progress',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({...sending,revision:this.revision})});
     this.revision=result.revision;this.lastSaved=result.updatedAt;
     if(this.pending.writeId===sending.writeId)this.pending=null;
     this.cache();
    }
    this.onStatus('saved');
   }catch(e){if(e.status===409){this.conflict=true;this.onStatus('conflict')}else if(e.status===401){this.conflict=true;this.onStatus('sign-in')}else this.onStatus(e.status===422?'invalid':'offline');}
   finally{this.busy=false;}
  }
  async useServer(){
   const remote=await this.request('/api/progress');
   // Keep a recoverable copy before accepting a newer server revision.
   if(this.pending)this.storage.setItem(this.key()+':recovery:'+Date.now(),JSON.stringify(this.pending.progress));
   this.pending=null;this.conflict=false;this.revision=remote.revision;this.lastSaved=remote.updatedAt||null;this.cache();this.onStatus('saved');return remote.progress;
  }
 }
 root.IEE_AccountSync=AccountSync;
 if(typeof module!=='undefined')module.exports=AccountSync;
})(typeof window==='undefined'?globalThis:window);
