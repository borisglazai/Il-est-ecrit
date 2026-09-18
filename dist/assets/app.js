const {reviews, paths, testament} = window.IEE_DATA || {reviews:[], paths:[], testament:{}};

const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const L=window.IEE_LEARNING;
let storage;try{storage=window.localStorage;}catch{storage={getItem(){throw Error('unavailable')},setItem(){throw Error('unavailable')}};}
const loaded=L.load(storage);let progress=loaded.data;let storageBlocked=!!loaded.error;
let accountSync=null,syncStatus='loading',syncLocked=false,legacyOffer=null;
const state = { route:progress.onboarded?'today':'onboarding', onboarding:0, level:progress.preferences.level, goals:progress.preferences.goals, time:progress.preferences.minutes, session:progress.active?.step||0, memo:progress.active?.memo||0, diagnosticIndex:0, feedback:'', hint:false };
const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>new Date().toISOString();
function persist(){
 if(accountSync){if(syncLocked)return false;const saved=accountSync.enqueue(progress);if(!saved)state.feedback='La sauvegarde a échoué. Exporte tes données avant de fermer cette page.';return saved;}
 if(storageBlocked||!L.save(storage,progress)){state.feedback='Sauvegarde indisponible. Garde cette page ouverte et exporte tes données depuis Moi.';return false;}return true;
}
function record(skill,answer,correct,hint=false){progress=L.attempt(progress,{id:crypto.randomUUID(),skill,answer,correct,hint,now:now()});persist();}
function nextStep(){state.feedback='';state.hint=false;state.session++;progress.active.step=state.session;persist();render();}
function feedback(message){state.feedback=message;render();}
function exportProgress(){const raw=storageBlocked?(()=>{try{return storage.getItem(L.KEY)||JSON.stringify(progress)}catch{return JSON.stringify(progress)}})():JSON.stringify(progress,null,2);const url=URL.createObjectURL(new Blob([raw],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='il-est-ecrit-progression.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}

const icons = {today:'⌂', written:'✦', bible:'▤', paths:'◇', profile:'○'};

function notify(text){ toast.textContent=text; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2200); }
function go(route){ state.route=route; location.hash=route; render(); window.scrollTo({top:0,behavior:'smooth'}); }
function button(label, action, cls='primary'){ return `<button class="${cls}" data-action="${action}">${label}</button>`; }
function header(kicker,title,sub=''){ return `<header class="page-head"><span class="eyebrow">${kicker}</span><h1>${title}</h1>${sub?`<p>${sub}</p>`:''}</header>`; }

function onboarding(){
 const d=L.diagnostic[state.diagnosticIndex];
 const steps=[
 `<span class="eyebrow">Bienvenue</span><h1>Jusqu’à ce que la Parole devienne un réflexe.</h1><p>Commençons par une séance autour de Matthieu 4:4. ${accountSync?'Tes progrès seront enregistrés dans ton compte.':'Tes progrès seront enregistrés sur cet appareil.'}</p>${button('Continuer','on-next')}`,
 `<span class="eyebrow">Ton point de départ</span><h1>Où en es-tu aujourd’hui ?</h1><div class="option-list">${['Je débute','Je connais quelques histoires et versets','Je connais assez bien la Bible','Je maîtrise beaucoup de passages','J’enseigne régulièrement'].map((x,i)=>`<button class="option" data-level="${i}"><span>${x}</span></button>`).join('')}</div>`,
 `<span class="eyebrow">Tes objectifs</span><h1>Que souhaites-tu travailler ?</h1><div class="chips">${['Comprendre la Bible','Retenir les versets','Retrouver les références','Connaître les livres','Répondre avec les Écritures','Approfondir','Mieux enseigner'].map(x=>`<button class="chip ${state.goals.includes(x)?'selected':''}" aria-pressed="${state.goals.includes(x)}" data-goal="${x}">${x}</button>`).join('')}</div>${button('Continuer','on-next')}`,
 `<span class="eyebrow">Ton rythme</span><h1>Ton objectif quotidien</h1><div class="time-grid">${['5 min','10 min','15 min','20 min+'].map(x=>`<button class="time ${state.time===x?'selected':''}" aria-pressed="${state.time===x}" data-time="${x}">${x}</button>`).join('')}</div><p>Cette première séance dure environ 5 à 8 minutes. L’adaptation de sa durée arrivera avec les prochaines séances.</p>${button('Quelques questions pour commencer','on-next')}`,
 `<span class="eyebrow">Premiers repères · ${state.diagnosticIndex+1}/3</span><h1>${d.question}</h1><div class="option-list">${d.options.map((x,i)=>`<button class="option" data-diagnostic="${i}" ${state.feedback?'disabled':''}>${x}</button>`).join('')}</div>${state.feedback?`<p role="status">${esc(state.feedback)}</p>${button('Continuer','diagnostic-next')}`:''}`,
 `<span class="eyebrow">Profil en construction</span><h1>Ton point de départ</h1><p>${progress.diagnostic.filter(x=>x.correct).length} réponse(s) juste(s) sur ${progress.diagnostic.length}. Ces premiers repères ne mesurent ni ta spiritualité ni toute ta connaissance de la Bible.</p><p>Nous allons maintenant exercer la compréhension, la mémoire et le rappel d’une référence.</p>${button('Commencer mon parcours','finish-onboarding')}`
 ];
 return `<section class="onboarding"><div class="on-progress">${steps.map((_,i)=>`<i class="${i<=state.onboarding?'active':''}"></i>`).join('')}</div><div class="on-card">${steps[state.onboarding]}</div>${state.onboarding>0&&state.onboarding<4?button('Retour','on-back','secondary'):''}</section>`;
}

function today(){
 const metrics=L.stats(progress),review=progress.reviews[L.lesson.id],due=review&&new Date(review.dueAt)<=new Date();
 return `${header(new Date().toLocaleDateString('fr-CA',{weekday:'long',day:'numeric',month:'long'}),'Un peu plus ancré, chaque jour.')}<section class="daily-card"><div><span class="card-kicker">TA SESSION · MATTHIEU 4:4</span><h2>${progress.active?'Reprenons là où tu en étais.':'La Parole comme réponse.'}</h2><div class="session-meta"><strong>5–8 min estimées</strong><span>Comprendre</span><span>Mémoriser</span><span>Appliquer</span></div></div>${button(progress.active?'Reprendre':due?'Réviser':'Commencer','start-session','light-button')}</section><section><div class="section-title"><h2>Ma progression</h2><span>${accountSync?'Mon compte':'Sur cet appareil'}</span></div><div class="stats"><article><small>Sessions terminées</small><strong>${metrics.sessions}</strong></article><article><small>Passages travaillés</small><strong>${metrics.encountered}</strong></article><article><small>Retenus à distance</small><strong>${metrics.retained}</strong></article><article><small>Objectif quotidien</small><strong>${esc(progress.preferences.minutes)}</strong></article></div></section><section><h2>${due?'À revoir aujourd’hui':'Prochaine révision'}</h2>${review?`<div class="context"><strong>${L.lesson.ref} · ${review.state}</strong><p>${new Date(review.dueAt).toLocaleString('fr-CA',{dateStyle:'long',timeStyle:'short'})}</p>${due?button('Réviser ce passage','start-session'):''}</div>`:'<p>Ta première séance préparera une révision pour demain.</p>'}<p class="muted">${accountSync?'La progression est liée à ton compte. Consulte son état de sauvegarde dans Moi.':'Les données restent dans ce navigateur. Tu peux les exporter depuis Moi.'}</p></section>`;
}
const sessionSteps=['Découvrir','Comprendre','Mémoriser','Retrouver','Appliquer','Bilan'];
function session(){
 if(!progress.active){state.route='today';return today();}
 const s=state.session;let body='';
 if(s===0)body=`<span class="eyebrow">DÉCOUVRIR</span><h1>Jésus dans le désert</h1><div class="verse-ref">${L.lesson.ref} · ${L.lesson.translation}</div><blockquote>${L.lesson.text}</blockquote><div class="context"><strong>Le texte dans son contexte</strong><p>${L.lesson.context}</p></div>${button('J’ai lu le passage','session-next')}`;
 if(s===1)body=`<span class="eyebrow">COMPRENDRE</span><h1>Que souligne la réponse de Jésus ?</h1><div class="option-list">${['La nourriture est inutile','L’homme dépend aussi de la parole de Dieu','La foi garantit une vie sans épreuve'].map((x,i)=>`<button class="option" data-answer="${i}">${x}</button>`).join('')}</div>${button('Relire le contexte','context','secondary')}`;
 if(s===2)body=`<span class="eyebrow">MÉMORISER · ${state.memo===0?'1/2':'2/2'}</span><h1>${L.lesson.ref}</h1>${state.memo===0?'<p>L’homme ne vivra pas de <strong>____</strong> seulement, mais de toute <strong>____</strong> qui sort de la bouche de Dieu.</p><label for="memory-answer">Les deux mots manquants, dans l’ordre</label><input id="memory-answer" autocomplete="off" placeholder="Premier mot, deuxième mot">':`<label for="memory-answer">Écris le passage de mémoire, sans « Jésus répondit : Il est écrit ».</label><textarea id="memory-answer" rows="5" autocomplete="off" spellcheck="false"></textarea>`}<p>La ponctuation, les majuscules et les accents ne sont pas évalués.</p>${button('Vérifier','check-memory')}${button('Revoir le texte','memory-hint','secondary')}${state.hint?`<div class="context">${L.lesson.text}</div>`:''}`;
 if(s===3)body=`<span class="eyebrow">RETROUVER</span><h1>Où est-ce écrit ?</h1><blockquote>${L.lesson.text}</blockquote><label for="reference-answer">Livre, chapitre et verset</label><input id="reference-answer" placeholder="Ex. Jean 3:16" autocomplete="off">${button('Vérifier la référence','check-reference')}`;
 if(s===4)body=`<span class="eyebrow">APPLIQUER</span><h1>Une parole pour répondre</h1><p class="situation">« Seuls mes besoins matériels comptent ; je peux négliger ce que Dieu dit. »</p><div class="written-call">IL EST ÉCRIT…</div><div class="option-list">${['Matthieu 4:4 — vivre aussi de la parole de Dieu','Deutéronome 8:3 — la leçon de la manne','Genèse 1:1 — la création des cieux et de la terre'].map((x,i)=>`<button class="option" data-challenge="${i}">${x}</button>`).join('')}</div><p>Plusieurs passages peuvent répondre à cette situation.</p>`;
 if(s===5)body=`<span class="eyebrow">BILAN</span><h1>IL EST ÉCRIT.</h1><p>Matthieu 4:4 et Deutéronome 8:3 relient la vie à la parole de Dieu. Cette réponse ne supprime pas les besoins matériels : elle rappelle la dépendance envers Dieu.</p><p>Tu as travaillé le contexte, la mémoire, la référence et l’application. Un rappel à distance sera nécessaire pour consolider ce passage.</p>${button('Terminer et enregistrer','complete-session')}`;
 return `<section class="session-page"><button class="back-link" data-route="today">← Enregistrer et quitter</button><div class="session-progress" role="progressbar" aria-label="Session" aria-valuemin="0" aria-valuemax="6" aria-valuenow="${s+1}"><span style="width:${(s+1)/6*100}%"></span></div><div class="session-count">${s+1}/6 · ${sessionSteps[s]}</div><div class="lesson-card">${body}${state.feedback?`<div class="context" role="status">${esc(state.feedback)}</div>`:''}</div></section>`;
}

function written(){ return `${header('METTRE LA PAROLE EN ACTION','Il est écrit','Entraîne-toi à retrouver une réponse biblique juste, précise et adaptée au contexte.')}
 <div class="feature-grid"><button class="feature gold" data-route="quick"><span>3 min</span><b>Défi rapide</b><p>Une situation, une réponse biblique.</p><em>Commencer →</em></button><button class="feature dark" data-route="desert"><span>AVANCÉ · 7 QUESTIONS</span><b>Mode Désert</b><p>Sans indice. Ta compréhension, ta mémoire, le contexte.</p><em>Entrer →</em></button><button class="feature"><span>APPROFONDIR</span><b>Par thème</b><p>Foi, pardon, identité, peur, prière…</p></button><button class="feature"><span>PERSONNALISÉ</span><b>Mes points faibles</b><p>Travaille ce qui demande encore d’être consolidé.</p></button><button class="feature"><span>SURPRISE</span><b>Défi aléatoire</b><p>Laisse-toi surprendre par une situation nouvelle.</p></button></div>`; }

function quick(){ return `<section class="session-page">${header('DÉFI RAPIDE · DÉMONSTRATION','Que répondrais-tu avec la Parole ?')}<div class="lesson-card"><p class="situation">« J’ai tellement péché que Dieu ne peut plus me pardonner. »</p><div class="written-call big">IL EST ÉCRIT…</div><div class="option-list">${['1 Jean 1:9 — Il est fidèle et juste pour nous pardonner','Proverbes 3:5 — Confie-toi en l’Éternel','Psaume 119:105 — Ta parole est une lampe'].map((x,i)=>`<button class="option" data-quick="${i}"><span>${x}</span><b>${String.fromCharCode(65+i)}</b></button>`).join('')}</div></div></section>`; }
function correction(){ return `<section class="session-page">${header('CORRECTION','Réponse pertinente')}<div class="lesson-card correction"><div class="success-mark">✓</div><h2>1 Jean 1:9</h2><blockquote>« Si nous confessons nos péchés, il est fidèle et juste pour nous les pardonner… »</blockquote><p>Ce passage répond directement à l’idée que le pardon serait devenu inaccessible. Il relie le pardon à la fidélité et à la justice de Dieu.</p><div class="context"><strong>Regardons le contexte</strong><p>Jean écrit à des croyants et les appelle à marcher dans la lumière, sans nier le péché ni perdre de vue la grâce.</p></div><small>Autres passages possibles · Ésaïe 1:18 · Psaume 103:12</small>${button('Nouveau défi','quick')}</div></section>`; }
function desert(){ return `<section class="desert-page"><button class="back-link" data-route="written">← Quitter</button><span class="eyebrow">MODE DÉSERT</span><div class="desert-top"><span>Précision · Pertinence · Contexte</span><strong>3 / 7</strong></div><div class="desert-line"><i></i></div><div class="desert-core"><p>«&nbsp;Dieu m’a abandonné parce que je traverse une épreuve.&nbsp;»</p><div class="written-call big">IL EST ÉCRIT…</div><label for="desert-answer">Écris une référence ou un passage pertinent</label><textarea id="desert-answer" placeholder="Ta réponse…"></textarea>${button('Soumettre ma réponse','desert-submit','desert-button')}</div></section>`; }

function bible(){ return `${header('66 LIVRES · UNE HISTOIRE','Explorer la Bible','Découvre les grandes familles de livres et consolide tes repères.')}${Object.entries(testament).map(([name,cats])=>`<section><div class="section-title"><h2>${name}</h2><span>${name.startsWith('Ancien')?'39':'27'} livres</span></div><div class="category-grid">${cats.map(([a,b])=>`<button data-route="mark"><span class="book-lines">▥</span><b>${a}</b><small>${b}</small><em>Explorer →</em></button>`).join('')}</div></section>`).join('')}`; }
function mark(){ return `<section>${header('NOUVEAU TESTAMENT · ÉVANGILE','MARC','Un récit vivant et direct qui présente Jésus en action, serviteur puissant et Fils de Dieu.')}<div class="book-summary"><div><small>Progression personnelle</small><strong>18 %</strong></div><div class="bar"><span style="width:18%"></span></div></div><div class="tabs" role="tablist">${['Aperçu','Structure','Passages clés','Personnages','Quiz','Ma progression'].map((x,i)=>`<button class="${i===0?'active':''}" data-tab="${i}">${x}</button>`).join('')}</div><div id="tab-panel" class="tab-panel"><h2>Un Évangile tourné vers l’action</h2><p>Marc montre Jésus enseignant, guérissant et servant avec autorité. Le récit avance rapidement vers la croix et la résurrection.</p><div class="mini-grid"><article><small>Auteur traditionnel</small><strong>Marc</strong></article><article><small>Chapitres</small><strong>16</strong></article><article><small>Passage clé</small><strong>Marc 10:45</strong></article></div></div></section>`; }
function pathsPage(){ return `${header('APPRENDRE AVEC UN CAP','Mes parcours','Choisis un itinéraire progressif adapté à ce que tu souhaites consolider.') }<div class="path-list">${paths.map((p,i)=>`<article><div class="path-number">${String(i+1).padStart(2,'0')}</div><div class="path-content"><div><span>${p.days} · ${p.level}</span><h2>${p.title}</h2><p>${p.skill}</p></div><div class="path-progress"><span>${p.progress}%</span><div><i style="width:${p.progress}%"></i></div></div></div><button data-action="path-open" aria-label="Ouvrir ${p.title}">›</button></article>`).join('')}</div>`; }
function profile(){
 const m=L.stats(progress),r=progress.reviews[L.lesson.id];
 return `${header('TON APPRENTISSAGE','Mon profil biblique','Des traces de ton apprentissage, jamais une mesure de ta spiritualité.')}<div class="stats"><article><small>Sessions</small><strong>${m.sessions}</strong></article><article><small>Passages travaillés</small><strong>${m.encountered}</strong></article><article><small>Réponses enregistrées</small><strong>${m.answers}</strong></article><article><small>Rappels consolidés</small><strong>${m.retained}</strong></article></div><section><h2>Mémoire</h2><p>${r?`${L.lesson.ref} · ${r.state}`:'Aucun passage travaillé pour le moment.'}</p><p>Le statut Retenu demande plusieurs rappels sans indice à distance. Il ne signifie pas que toutes les compétences sont maîtrisées.</p></section><section><h2>Mes préférences</h2><p>Objectif : ${esc(progress.preferences.minutes)} par jour.</p><p>${progress.preferences.goals.map(esc).join(' · ')||'Découvrir progressivement la Bible.'}</p>${accountPanel()}${button('Exporter ma progression','export-progress','secondary')}</section>`;
}

function render(){
 if(syncLocked){renderSyncGate();return;}
 if(legacyOffer&&accountSync?.revision===0&&!progress.onboarded){renderLegacyGate();return;}
 const routes={onboarding,today,session,written,quick,correction,desert,bible,mark,paths:pathsPage,profile};
 app.innerHTML=(routes[state.route]||today)();
 if(['bible','mark','paths','written','quick','correction','desert'].includes(state.route))app.insertAdjacentHTML('afterbegin','<p class="preview-note">Aperçu du projet · Ce module n’est pas encore relié à ta progression.</p>');
 if(storageBlocked)app.insertAdjacentHTML('afterbegin','<p role="alert">'+esc(loaded.error)+' <button data-action="export-progress">Exporter</button></p>');
 document.body.classList.toggle('desert-mode',state.route==='desert');
 document.querySelector('.bottom-nav').hidden=state.route==='onboarding'||state.route==='desert';
 document.querySelectorAll('[data-route]').forEach(b=>{ b.onclick=()=>go(b.dataset.route); b.classList.toggle('active',b.dataset.route===state.route); });
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));
 document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{state.level=b.querySelector('span').textContent;state.onboarding++;render()});
 document.querySelectorAll('[data-goal]').forEach(b=>b.onclick=()=>{const x=b.dataset.goal;state.goals=state.goals.includes(x)?state.goals.filter(v=>v!==x):[...state.goals,x];render()});
 document.querySelectorAll('[data-time]').forEach(b=>b.onclick=()=>{state.time=b.dataset.time;render()});
 document.querySelectorAll('[data-diagnostic]').forEach(b=>b.onclick=()=>{if(state.feedback)return;const d=L.diagnostic[state.diagnosticIndex];progress.diagnostic[state.diagnosticIndex]={skill:d.skill,correct:Number(b.dataset.diagnostic)===d.correct,answer:Number(b.dataset.diagnostic)};persist();feedback(d.feedback);});
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const correct=b.dataset.answer==='1';record('comprendre',b.dataset.answer,correct,state.hint);if(correct)nextStep();else feedback('Pas encore. Le passage ne nie pas nos besoins matériels et ne promet pas une vie sans épreuve.');});
 document.querySelectorAll('[data-challenge]').forEach(b=>b.onclick=()=>{const correct=['0','1'].includes(b.dataset.challenge);record('appliquer',b.dataset.challenge,correct);if(correct)nextStep();else feedback('Ce passage parle de la création. Matthieu 4:4 et Deutéronome 8:3 répondent plus directement à cette situation.');});
 document.querySelectorAll('[data-quick]').forEach(b=>b.onclick=()=>{if(b.dataset.quick==='0'){b.classList.add('correct');setTimeout(()=>go('correction'),500)}else{b.classList.add('wrong');notify('Pas encore. Cherche un passage qui parle directement du pardon.')}});
 document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.remove('active'));b.classList.add('active');notify(`${b.textContent} · contenu de démonstration`)});
}
function action(a){
 if(syncLocked)return;
 if(a==='sign-out'){accountSync?.flush().finally(()=>window.IEE_AUTH.signOut());return;}
 if(a==='skip-legacy'){legacyOffer=null;render();return;}
 if(a==='sync-retry'){accountSync?.flush();return;}
 if(a==='import-legacy'){if(legacyOffer&&accountSync?.revision===0){progress=legacyOffer;legacyOffer=null;syncPreferences();persist();go(progress.onboarded?'today':'onboarding');}return;}
 if(a==='on-next'){state.onboarding++;state.feedback='';render();}
 if(a==='on-back'){state.onboarding--;state.feedback='';render();}
 if(a==='diagnostic-next'){state.feedback='';if(state.diagnosticIndex<2)state.diagnosticIndex++;else state.onboarding=5;render();}
 if(a==='finish-onboarding'){progress.onboarded=true;progress.preferences={level:state.level,goals:state.goals,minutes:state.time};persist();go('today');}
 if(a==='start-session'){progress=L.start(progress,crypto.randomUUID(),now());state.session=progress.active.step;state.memo=progress.active.memo;state.hint=false;state.feedback='';persist();go('session');}
 if(a==='session-next')nextStep();
 if(a==='context'){state.hint=true;feedback(L.lesson.context);}
 if(a==='memory-hint'){state.hint=true;progress.active.memoryHint=true;persist();render();}
 if(a==='check-memory'){
  const answer=document.querySelector('#memory-answer').value.trim();if(!answer)return feedback('Écris ta réponse, ou utilise « Revoir le texte ».');
  const correct=L.normalize(answer)===L.normalize(state.memo===0?'pain parole':L.lesson.text);
  record(state.memo===0?'texte à trous':'mémoriser',answer,correct,state.hint||!!progress.active.memoryHint);
  if(!correct)return feedback('Pas encore. Relis le texte si nécessaire, puis reprends calmement.');
  if(state.memo===0){state.memo=1;progress.active.memo=1;state.feedback='Les deux mots sont justes. Essaie maintenant le passage entier.';persist();render();}else nextStep();
 }
 if(a==='check-reference'){const answer=document.querySelector('#reference-answer').value.trim();if(!answer)return feedback('Indique un livre, un chapitre et un verset.');const correct=['matthieu44','mt44','mat44'].includes(L.normalize(answer));record('retrouver',answer,correct,!!progress.active.referenceHint);if(correct)nextStep();else {progress.active.referenceHint=true;persist();feedback('Pas encore. Nous travaillons le premier Évangile, au chapitre 4, verset 4.');}}
 if(a==='complete-session'){progress=L.complete(progress,now());const saved=persist();go('today');notify(saved?(accountSync?'Session terminée. Sauvegarde en cours…':'Session enregistrée sur cet appareil.'):'Sauvegarde impossible. Exporte tes données depuis Moi.');}
 if(a==='export-progress')exportProgress();
 if(a==='quick')go('quick');
 if(a==='desert-submit')notify('Aperçu : la correction libre n’est pas encore disponible.');
 if(a==='path-open')notify('Aperçu : les parcours complets ne sont pas encore disponibles.');
}

window.addEventListener('hashchange',()=>{const r=location.hash.slice(1);if(r && progress.onboarded) {state.route=r;render();}});
setTimeout(()=>document.querySelector('#splash')?.classList.add('hide'),900);
if(location.hash && state.route!=='onboarding') state.route=location.hash.slice(1);
if(window.IEE_AccountSync)initializeAccount();else render();

function syncPreferences(){state.level=progress.preferences.level;state.goals=progress.preferences.goals;state.time=progress.preferences.minutes;state.session=progress.active?.step||0;state.memo=progress.active?.memo||0;}
function accountPanel(){
 if(!accountSync)return '<p>Progression sur cet appareil.</p>';
 const labels={loading:'Connexion…',pending:'Sauvegarde en cours…',saved:'Progression sauvegardée dans ton compte.',offline:'Connexion interrompue. Tes changements sont conservés sur cet appareil, en attente d’envoi.',invalid:'La progression n’a pas pu être validée. Exporte-la pour la conserver.', 'cache-error':'Sauvegarde locale indisponible. Exporte ta progression avant de fermer.'};
 return `<div class="context"><strong>Mon compte</strong><p>${esc(accountSync.account?.email||'Connecté')}</p><p id="account-sync-status" role="status">${esc(labels[syncStatus]||syncStatus)}</p>${accountSync.lastSaved?`<small>Dernière sauvegarde : ${new Date(accountSync.lastSaved).toLocaleString('fr-CA')}</small>`:''}${button('Réessayer la sauvegarde','sync-retry','secondary')}<p><button data-action="sign-out" class="secondary">Se déconnecter</button></p></div>${legacyOffer&&accountSync.revision===0?`<div class="context"><strong>Une ancienne progression existe sur cet appareil.</strong><p>Si elle t’appartient, tu peux la transférer vers ce compte. La copie d’origine sera conservée.</p>${button('Transférer mon ancienne progression','import-legacy','secondary')}</div>`:''}`;
}
function renderSyncGate(){
 if(syncStatus==='sign-in'&&window.IEE_AUTH){window.IEE_AUTH.mount(app,initializeAccount);document.querySelector('.bottom-nav').hidden=true;return;}
 const conflict=syncStatus==='conflict';
 app.innerHTML=`<section class="on-card"><h1>${conflict?'Une progression plus récente existe.':syncStatus==='sign-in'?'Reconnecte-toi pour continuer.':'Connexion à ton compte'}</h1><p>${conflict?'Un autre appareil a enregistré des changements. Tes réponses locales sont conservées. Tu peux les exporter, puis reprendre la version de ton compte.':syncStatus==='sign-in'?'Ta session de connexion a expiré. Tes réponses restent conservées sur cet appareil.':'La progression de ton compte doit être chargée avant de commencer.'}</p>${conflict?'<button class="secondary" id="export-conflict">Exporter mes réponses locales</button><button class="primary" id="resolve-conflict">Reprendre la version du compte</button>':syncStatus==='sign-in'?'<button class="primary" id="retry-connect">Se reconnecter</button>':'<button class="secondary" id="retry-connect">Réessayer</button>'}</section>`;
 document.querySelector('.bottom-nav').hidden=true;
 document.querySelector('#export-conflict')?.addEventListener('click',exportProgress);
 document.querySelector('#retry-connect')?.addEventListener('click',initializeAccount);
 document.querySelector('#resolve-conflict')?.addEventListener('click',async()=>{try{progress=await accountSync.useServer()||L.blank();syncLocked=false;syncPreferences();go(progress.onboarded?'today':'onboarding');}catch{notify('Connexion impossible. Les réponses locales sont conservées.');}});
}
async function initializeAccount(){
 syncLocked=true;syncStatus='loading';renderSyncGate();
 try{if(window.IEE_AUTH&&await window.IEE_AUTH.needsLogin()){syncStatus='sign-in';renderSyncGate();return;}}catch{renderSyncGate();notify('La connexion au service de comptes n’est pas encore disponible.');return;}
 const controller=new window.IEE_AccountSync(storage,window.IEE_AUTH?window.IEE_AUTH.authorizedFetch:window.fetch.bind(window),status=>{
  syncStatus=status;
  if(['conflict','sign-in'].includes(status)){syncLocked=true;renderSyncGate();}
  else {const el=document.querySelector('#account-sync-status');if(el)el.textContent=({saved:'Progression sauvegardée dans ton compte.',pending:'Sauvegarde en cours…',offline:'Hors connexion : changements conservés ici, en attente d’envoi.',invalid:'Progression non validée. Exporte tes données.','cache-error':'Sauvegarde indisponible. Exporte tes données.'})[status]||status;}
 });
 try{
  const result=await controller.open();accountSync=controller;
  legacyOffer=!loaded.error&&(loaded.data.onboarded||loaded.data.active||loaded.data.sessions.length)?loaded.data:null;
  progress=result.progress||L.blank();storageBlocked=false;syncPreferences();
  syncLocked=!!result.conflict;syncStatus=result.conflict?'conflict':controller.pending?'pending':'saved';
  if(syncLocked){renderSyncGate();return;}
 if(legacyOffer&&accountSync?.revision===0&&!progress.onboarded){renderLegacyGate();return;}
  state.route=progress.onboarded?(location.hash.slice(1)||'today'):'onboarding';render();
 }catch(e){syncStatus=e.status===401?'sign-in':'loading';renderSyncGate();notify(e.message==='invalid_cache'?'La copie locale est illisible. Elle a été conservée.':'Connexion indisponible. Réessaie dans un instant.');}
}
window.addEventListener('online',()=>accountSync?.flush());

function renderLegacyGate(){
 app.innerHTML=`<section class="on-card"><span class="eyebrow">Bienvenue dans ton compte</span><h1>Retrouvons tes progrès.</h1><p>Une progression de l’ancienne version existe sur ce navigateur. Si elle t’appartient, transfère-la vers ton compte : tu pourras la retrouver sur tes autres appareils.</p><p>La copie d’origine sera conservée.</p>${button('Transférer ma progression','import-legacy')}${button('Commencer un nouveau parcours','skip-legacy','secondary')}</section>`;
 document.querySelector('.bottom-nav').hidden=true;
 document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));
}
