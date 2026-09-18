(function(root){
  'use strict';
  const KEY='iee-learning-v1';
  const text='L’homme ne vivra pas de pain seulement, mais de toute parole qui sort de la bouche de Dieu.';
  const lesson={id:'mat-4-4-v1',ref:'Matthieu 4:4',translation:'Louis Segond 1910',text,
    context:'Dans Matthieu 4:1–11, Jésus est tenté dans le désert. En Matthieu 4:4, Il cite Deutéronome 8:3 : ce passage rappelle comment Dieu a nourri Israël de la manne et lui a appris à dépendre de Sa parole. Le texte ne nie pas le besoin de nourriture.',
    source:'https://ebible.org/fraLSG/copyright.htm',editorialStatus:'À relire'};
  const diagnostic=[
    {question:'Dans quelle partie de la Bible trouve-t-on Matthieu ?',options:['Ancien Testament','Nouveau Testament','Je ne sais pas'],correct:1,skill:'connaître',feedback:'Matthieu est le premier des quatre Évangiles, dans le Nouveau Testament.'},
    {question:'Pour comprendre un verset, que faut-il regarder en premier ?',options:['Sa popularité','Ce qui précède, ce qui suit et les destinataires','Je ne sais pas'],correct:1,skill:'comprendre',feedback:'Le contexte aide à comprendre ce que le passage affirme et à qui il s’adresse.'},
    {question:'Où lit-on « L’Éternel est mon berger » ?',options:['Psaume 23:1','Jean 3:16','Je ne sais pas'],correct:0,skill:'retrouver',feedback:'Cette phrase ouvre le Psaume 23, au verset 1.'}
  ];
  const blank=()=>({schemaVersion:1,onboarded:false,preferences:{level:'',goals:[],minutes:'10 min'},diagnostic:[],sessions:[],active:null,reviews:{},updatedAt:null});
  const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
  function load(storage){try{const raw=storage.getItem(KEY);if(!raw)return {data:blank(),error:null};const d=JSON.parse(raw);if(d.schemaVersion!==1||!Array.isArray(d.sessions)||!Array.isArray(d.diagnostic)||!d.preferences||!d.reviews)throw Error('format');return {data:d,error:null};}catch{return {data:blank(),error:'La sauvegarde ne peut pas être lue. Elle a été conservée ; exporte-la avant de poursuivre.'};}}
  function save(storage,data){try{storage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}
  function start(data,id,now){if(data.active)return data;return {...data,active:{id,lessonId:lesson.id,step:0,memo:0,attempts:[],startedAt:now},updatedAt:now};}
  function attempt(data,{id,skill,answer,correct,hint=false,now}){if(!data.active||data.active.attempts.some(a=>a.id===id))return data;return {...data,active:{...data.active,attempts:[...data.active.attempts,{id,skill,answer,correct,hint,at:now}]},updatedAt:now};}
  function complete(data,now){if(!data.active)return data;const s=data.active;if(data.sessions.some(x=>x.id===s.id))return {...data,active:null};
    const old=data.reviews[lesson.id];const memory=s.attempts.filter(a=>a.skill==='mémoriser');const unaided=memory.length===1&&memory[0].correct&&!memory[0].hint;
    const at=new Date(now).getTime();const delayed=!old||at-new Date(old.lastReviewedAt).getTime()>=86400000;
    const successes=unaided&&delayed?(old?.successes||0)+1:(old?.successes||0);
    const days=!unaided?1:([1,3,7,14,30][Math.min(Math.max(successes-1,0),4)]);
    const review={successes,lastReviewedAt:delayed||!unaided?now:old.lastReviewedAt,firstReviewedAt:old?.firstReviewedAt||now,
      dueAt:delayed||!unaided?new Date(at+days*86400000).toISOString():old.dueAt,
      state:!unaided?'À consolider':successes>=3&&at-new Date(old?.firstReviewedAt||now).getTime()>=30*86400000?'Solide':successes>=2?'Retenu':'En apprentissage',algorithm:'pilot-intervals-v1'};
    return {...data,active:null,sessions:[...data.sessions,{...s,completedAt:now}],reviews:{...data.reviews,[lesson.id]:review},updatedAt:now};
  }
  function stats(data){const attempts=data.sessions.flatMap(s=>s.attempts);return {sessions:data.sessions.length,encountered:Object.keys(data.reviews).length,retained:Object.values(data.reviews).filter(x=>['Retenu','Solide'].includes(x.state)).length,answers:attempts.length,correct:attempts.filter(a=>a.correct).length};}
  root.IEE_LEARNING={KEY,lesson,diagnostic,blank,normalize,load,save,start,attempt,complete,stats};
  if(typeof module!=='undefined')module.exports=root.IEE_LEARNING;
})(typeof window==='undefined'?globalThis:window);
