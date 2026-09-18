import '../dist/assets/learning.js';
const L=globalThis.IEE_LEARNING;
const skills=['comprendre','texte à trous','mémoriser','retrouver','appliquer'];
const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(x);
const validDate=x=>typeof x==='string'&&Number.isFinite(Date.parse(x))&&Date.parse(x)>946684800000&&Date.parse(x)<Date.now()+300000;
const fail=()=>{throw new Error('invalid_progress')};
function answerIsCorrect(skill,answer){
 const n=L.normalize(answer);
 if(skill==='comprendre')return answer==='1';
 if(skill==='appliquer')return answer==='0'||answer==='1';
 if(skill==='texte à trous')return n==='painparole';
 if(skill==='mémoriser')return n===L.normalize(L.lesson.text);
 return ['matthieu44','mt44','mat44'].includes(n);
}
function session(s,completed){
 if(!s||!validId(s.id)||s.lessonId!==L.lesson.id||!validDate(s.startedAt)||!Number.isInteger(s.step)||s.step<0||s.step>5||![0,1].includes(s.memo)||!Array.isArray(s.attempts)||s.attempts.length>300)fail();
 const seen=new Set();
 const attempts=s.attempts.map(a=>{if(!a||!validId(a.id)||seen.has(a.id)||!skills.includes(a.skill)||typeof a.answer!=='string'||a.answer.length>3000||typeof a.hint!=='boolean'||!validDate(a.at)||Date.parse(a.at)<Date.parse(s.startedAt))fail();seen.add(a.id);return {id:a.id,skill:a.skill,answer:a.answer,correct:answerIsCorrect(a.skill,a.answer),hint:a.hint,at:a.at};});
 const clean={id:s.id,lessonId:s.lessonId,step:s.step,memo:s.memo,attempts,startedAt:s.startedAt,memoryHint:!!s.memoryHint,referenceHint:!!s.referenceHint};
 if(completed){if(s.step!==5||!validDate(s.completedAt)||Date.parse(s.completedAt)<Date.parse(s.startedAt)||attempts.some(a=>Date.parse(a.at)>Date.parse(s.completedAt))||skills.some(skill=>!attempts.some(a=>a.skill===skill&&a.correct)))fail();clean.completedAt=s.completedAt;}
 return clean;
}
export function normalizeProgress(p){
 if(!p||p.schemaVersion!==1||typeof p.onboarded!=='boolean'||!p.preferences||!Array.isArray(p.sessions)||p.sessions.length>2000||!Array.isArray(p.diagnostic)||p.diagnostic.length>3)fail();
 const pref=p.preferences;
 if(typeof pref.level!=='string'||pref.level.length>150||!['5 min','10 min','15 min','20 min+'].includes(pref.minutes)||!Array.isArray(pref.goals)||pref.goals.length>7||pref.goals.some(x=>typeof x!=='string'||x.length>120))fail();
 let result=L.blank();result.onboarded=p.onboarded;result.preferences={level:pref.level,goals:pref.goals,minutes:pref.minutes};
 result.diagnostic=p.diagnostic.map((x,i)=>{if(!x||!Number.isInteger(x.answer)||x.answer<0||x.answer>2)fail();return {skill:L.diagnostic[i].skill,answer:x.answer,correct:x.answer===L.diagnostic[i].correct};});
 const seen=new Set();
 for(const s of p.sessions.map(x=>session(x,true)).sort((a,b)=>Date.parse(a.completedAt)-Date.parse(b.completedAt))){if(seen.has(s.id))fail();seen.add(s.id);result.active=s;result=L.complete(result,s.completedAt);}
 result.active=p.active===null?null:session(p.active,false);if(result.active&&seen.has(result.active.id))fail();
 result.updatedAt=new Date().toISOString();return result;
}
