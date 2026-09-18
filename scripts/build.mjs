import {build} from 'esbuild';
import {readFile,mkdir,writeFile,cp,readdir} from 'node:fs/promises';
import path from 'node:path';
const assets={};
for(const file of ['index.html','manifest.webmanifest','sw.js',...(await readdir('dist/assets')).map(x=>'assets/'+x)]){
 const bytes=await readFile('dist/'+file);const ext=path.extname(file);assets['/'+file]={body:bytes.toString('utf8'),type:({'.html':'text/html','.css':'text/css','.js':'text/javascript','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'})[ext]||'text/plain'};
}
await mkdir('dist/server',{recursive:true});await mkdir('dist/.openai',{recursive:true});
const entry=`import {api} from './server/api.mjs';const assets=${JSON.stringify(assets)};export default {async fetch(request,env){const p=new URL(request.url).pathname;if(p.startsWith('/api/'))return api(request,env);if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});const a=assets[p==='/'?'/index.html':p];if(!a)return new Response('Not found',{status:404});return new Response(request.method==='HEAD'?null:a.body,{headers:{'Content-Type':a.type+'; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'}})}};`;
await build({stdin:{contents:entry,resolveDir:process.cwd(),sourcefile:'entry.js'},bundle:true,format:'esm',platform:'browser',target:'es2022',outfile:'dist/server/index.js'});
await cp('.openai/hosting.json','dist/.openai/hosting.json');await cp('drizzle','dist/.openai/drizzle',{recursive:true});
console.log('Worker, interface and migrations built.');
