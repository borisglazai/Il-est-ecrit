import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import {fileURLToPath} from 'node:url';
import {createApi} from './api.mjs';
import {createAuthenticator} from './auth.mjs';
import {ProgressRepository} from './postgres.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const {DATABASE_URL,SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,APP_ORIGIN}=process.env;
if(!DATABASE_URL||!SUPABASE_URL||!SUPABASE_PUBLISHABLE_KEY||!APP_ORIGIN)throw Error('Configure DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and APP_ORIGIN before starting.');
const origin=new URL(APP_ORIGIN).origin;
if(!SUPABASE_URL.startsWith('https://')&&!/^http:\/\/(localhost|127\.0\.0\.1)(:|\/)/.test(SUPABASE_URL))throw Error('HTTPS required for authentication provider');
const pool=new pg.Pool({connectionString:DATABASE_URL,max:10,connectionTimeoutMillis:8000,idleTimeoutMillis:30000,statement_timeout:10000});
const {rows:[role]}=await pool.query('SELECT rolsuper,rolbypassrls FROM pg_roles WHERE rolname=current_user');
if(role.rolsuper||role.rolbypassrls)throw Error('Runtime database role must not bypass RLS or be superuser.');
const api=createApi({authenticate:createAuthenticator({url:SUPABASE_URL.replace(/\/$/,''),key:SUPABASE_PUBLISHABLE_KEY}),repository:new ProgressRepository(pool),origin});
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,origin);
  if(url.origin!==origin){res.writeHead(400);res.end();return;}
  if(url.pathname==='/api/config'){res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({authUrl:SUPABASE_URL,authKey:SUPABASE_PUBLISHABLE_KEY}));return;}
  if(url.pathname.startsWith('/api/')){
   const chunks=[];let bytes=0;for await(const chunk of req){bytes+=chunk.length;if(bytes>2000000){res.writeHead(413);res.end();return;}chunks.push(chunk)}
   const body=Buffer.concat(chunks);const request=new Request(url,{method:req.method,headers:req.headers,...(['GET','HEAD'].includes(req.method)?{}:{body})});
   const response=await api(request);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
  const route=decodeURIComponent(url.pathname);const allowed=route==='/'||route==='/index.html'||route==='/manifest.webmanifest'||/^\/assets\/[a-zA-Z0-9_.-]+$/.test(route);
  if(!allowed){res.writeHead(404);res.end();return;}
  const file=path.join(root,route==='/'?'index.html':route.slice(1));let data;try{data=await readFile(file)}catch{res.writeHead(404);res.end();return;}
  const mime={'.html':'text/html','.css':'text/css','.js':'text/javascript','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime+'; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' "+new URL(SUPABASE_URL).origin+"; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(500);res.end('Service temporarily unavailable');}
});
server.requestTimeout=15000;server.headersTimeout=10000;
server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Il est écrit server ready.'));
async function stop(){server.close();await pool.end();}process.on('SIGTERM',stop);process.on('SIGINT',stop);
