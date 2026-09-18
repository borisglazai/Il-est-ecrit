const {test}=require('node:test');
const assert=require('node:assert/strict');
const L=require('../dist/assets/learning.js');
const startAt='2026-09-11T12:00:00.000Z';
function session(d,id,at,correct=true,hint=false){d=L.start(d,id,at);d=L.attempt(d,{id:id+'a',skill:'mémoriser',answer:'texte',correct,hint,now:at});return L.complete(d,at)}
test('first success creates a due review, never mastery',()=>{const d=session(L.blank(),'1',startAt);assert.equal(d.reviews[L.lesson.id].state,'En apprentissage');assert.equal(d.reviews[L.lesson.id].dueAt,'2026-09-12T12:00:00.000Z');assert.equal(L.stats(d).retained,0)});
test('same-day repetitions cannot manufacture delayed success',()=>{let d=session(L.blank(),'1',startAt);d=session(d,'2','2026-09-11T14:00:00.000Z');assert.equal(d.reviews[L.lesson.id].successes,1);assert.equal(d.reviews[L.lesson.id].dueAt,'2026-09-12T12:00:00.000Z');d=session(d,'3','2026-09-12T12:00:00.000Z');assert.equal(d.reviews[L.lesson.id].state,'Retenu')});
test('failure or hint remains consolidation and next day',()=>{for(const [correct,hint] of [[false,false],[true,true]]){const d=session(L.blank(),'1',startAt,correct,hint);assert.equal(d.reviews[L.lesson.id].state,'À consolider');assert.equal(d.reviews[L.lesson.id].successes,0)}});
test('attempt deduplication and completion are idempotent',()=>{let d=L.start(L.blank(),'1',startAt);const a={id:'a',skill:'mémoriser',correct:true,now:startAt};d=L.attempt(d,a);d=L.attempt(d,a);assert.equal(d.active.attempts.length,1);d=L.complete(d,startAt);assert.deepEqual(L.complete(d,startAt),d)});
test('round trip retains preferences, cursor, answers, schedule',()=>{const storage={v:null,getItem(){return this.v},setItem(k,v){this.v=v}};let d=session(L.blank(),'1',startAt);d.preferences.minutes='5 min';d=L.start(d,'2',startAt);d.active.step=3;assert.ok(L.save(storage,d));assert.deepEqual(L.load(storage).data,d)});
test('storage corruption and quota failure are explicit',()=>{const s={getItem(){return '{bad'},setItem(){throw Error('quota')}};assert.ok(L.load(s).error);assert.equal(L.save(s,L.blank()),false)});
test('normalization tolerates accents punctuation and case, not wrong words',()=>{assert.equal(L.normalize('PAROLE, Dieu.'),L.normalize('parole Dieu'));assert.notEqual(L.normalize('pain'),L.normalize('vin'))});
