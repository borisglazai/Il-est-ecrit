import {createClient} from '@supabase/supabase-js';
let client,initializing,recovery=false;
const safe=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function ready(){
 if(initializing)return initializing;
 initializing=(async()=>{const r=await fetch('/api/config',{cache:'no-store'});if(!r.ok)throw Error('Configuration indisponible');const config=await r.json();client=createClient(config.authUrl,config.authKey,{auth:{flowType:'pkce',detectSessionInUrl:true}});client.auth.onAuthStateChange(event=>{if(event==='PASSWORD_RECOVERY')recovery=true;});await client.auth.getSession();})();
 try{return await initializing}catch(e){initializing=null;throw e}
}
async function authorizedFetch(url,options={}){await ready();const {data:{session}}=await client.auth.getSession();const headers=new Headers(options.headers);if(session)headers.set('Authorization','Bearer '+session.access_token);return fetch(url,{...options,headers});}
function mount(container,resume,mode='login'){
 if(recovery)mode='password';
 const titles={login:'Retrouve ton parcours.',signup:'Ton chemin commence ici.',reset:'Retrouve ton accès.',password:'Choisis ton nouveau mot de passe.'};
 container.innerHTML=`<section class="on-card account-form"><span class="eyebrow">IL EST ÉCRIT…</span><h1>${titles[mode]}</h1><p>${mode==='signup'?'Crée ton compte pour retrouver tes progrès sur tous tes appareils.':mode==='reset'?'Nous t’enverrons un lien pour choisir un nouveau mot de passe.':'Chaque jour, un peu plus ancré dans la Parole.'}</p><form id="auth-form">${mode!=='password'?'<label for="auth-email">Adresse courriel</label><input id="auth-email" name="email" type="email" autocomplete="email" required>':''}${mode!=='reset'?`<label for="auth-password">Mot de passe</label><input id="auth-password" name="password" type="password" autocomplete="${mode==='login'?'current-password':'new-password'}" minlength="${mode==='login'?1:12}" required>${mode==='login'?'':'<small>Au moins 12 caractères.</small>'}`:''}<p id="auth-message" role="status"></p><button class="primary" type="submit">${{login:'Se connecter',signup:'Créer mon compte',reset:'Recevoir le lien',password:'Enregistrer'}[mode]}</button></form><div class="account-links">${mode!=='login'?'<button type="button" data-auth-mode="login">J’ai déjà un compte</button>':'<button type="button" data-auth-mode="signup">Créer un compte</button><button type="button" data-auth-mode="reset">Mot de passe oublié</button>'}</div></section>`;
 container.querySelectorAll('[data-auth-mode]').forEach(b=>b.onclick=()=>{recovery=false;mount(container,resume,b.dataset.authMode)});
 container.querySelector('form').onsubmit=async event=>{
  event.preventDefault();const form=event.currentTarget;const button=form.querySelector('button');const message=form.querySelector('#auth-message');button.disabled=true;message.textContent='';
  try{
   const email=form.elements.email?.value.trim(),password=form.elements.password?.value;
   let result;
   if(mode==='login')result=await client.auth.signInWithPassword({email,password});
   if(mode==='signup')result=await client.auth.signUp({email,password,options:{emailRedirectTo:location.origin+'/'}});
   if(mode==='reset')result=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/'});
   if(mode==='password')result=await client.auth.updateUser({password});
   if(result.error){message.textContent=mode==='login'?'Connexion impossible. Vérifie tes identifiants et la confirmation de ton adresse.':'Cette demande n’a pas abouti. Vérifie ta saisie ou réessaie dans quelques instants.';return;}
   if(mode==='reset'){message.textContent='Si cette adresse correspond à un compte, un lien de réinitialisation sera envoyé.';return;}
   if(mode==='signup'&&!result.data.session){message.textContent='Consulte tes courriels pour confirmer ton adresse, puis reviens te connecter.';return;}
   recovery=false;form.reset();await resume();
  }catch{message.textContent='Connexion indisponible. Réessaie dans un instant.';}finally{button.disabled=false;}
 };
}
window.IEE_AUTH={ready,mount,authorizedFetch,async needsLogin(){await ready();const {data:{session}}=await client.auth.getSession();return !session||recovery},async signOut(){await client.auth.signOut({scope:'local'});location.assign('/');}};
