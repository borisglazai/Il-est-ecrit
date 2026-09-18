const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');const fs=require('node:fs');const path=require('node:path');
function boot(saved=null){
 const store={value:saved,getItem(){return this.value},setItem(k,v){this.value=v}};
 const element={innerHTML:'',value:'',classList:{add(){},remove(){},toggle(){}},insertAdjacentHTML(){}};
 const ctx={console,Date,JSON,Blob,URL,crypto:require('node:crypto').webcrypto,setTimeout(){},localStorage:store,location:{hash:''},document:{querySelector(){return element},querySelectorAll(){return []},body:element},scrollTo(){},addEventListener(){}};
 ctx.window=ctx;vm.createContext(ctx);
 for(const file of ['data.js','learning.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/assets',file),'utf8'),ctx);
 return {ctx,store,element,run:x=>vm.runInContext(x,ctx)};
}
test('session checks answers, resumes and persists completion',()=>{
 let b=boot();b.run("state.level='Je débute';state.goals=['Retenir les versets'];action('finish-onboarding');action('start-session');action('session-next')");
 assert.equal(b.run('state.session'),1);
 b.run("record('comprendre','1',true);nextStep()");
 b.element.value='vin parole';b.run("action('check-memory')");assert.equal(b.run('state.memo'),0);
 b.element.value='pain parole';b.run("action('check-memory')");assert.equal(b.run('state.memo'),1);
 b=boot(b.store.value);b.run("action('start-session')");assert.equal(b.run('state.memo'),1);
 b.element.value=b.run('L.lesson.text');b.run("action('check-memory')");assert.equal(b.run('state.session'),3);
 b.element.value='Jean 3:16';b.run("action('check-reference')");assert.equal(b.run('state.session'),3);
 b.element.value='Matthieu 4:4';b.run("action('check-reference')");assert.equal(b.run('state.session'),4);
 b.run("record('appliquer','1',true);nextStep();action('complete-session');action('complete-session')");
 b=boot(b.store.value);assert.equal(b.run('progress.sessions.length'),1);assert.equal(b.run('progress.active'),null);assert.equal(b.run('L.stats(progress).retained'),0);assert.equal(b.run('progress.preferences.level'),'Je débute');
});
