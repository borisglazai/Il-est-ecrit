import pg from 'pg';import {readFile,readdir} from 'node:fs/promises';import {createHash} from 'node:crypto';
if(!process.env.MIGRATION_DATABASE_URL)throw Error('MIGRATION_DATABASE_URL is required; never run migrations with runtime credentials.');
const c=new pg.Client({connectionString:process.env.MIGRATION_DATABASE_URL});await c.connect();
try{
 await c.query('SELECT pg_advisory_lock(48761302)');
 await c.query('CREATE TABLE IF NOT EXISTS public.iee_schema_migrations(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now())');
 for(const name of (await readdir('migrations/postgres')).filter(x=>x.endsWith('.sql')).sort()){
  const sql=await readFile('migrations/postgres/'+name,'utf8');const checksum=createHash('sha256').update(sql).digest('hex');const {rows}=await c.query('SELECT checksum FROM public.iee_schema_migrations WHERE name=$1',[name]);
  if(rows.length){if(rows[0].checksum!==checksum)throw Error('Applied migration changed: '+name);continue;}
  await c.query('BEGIN');try{await c.query(sql.replace(/^BEGIN;\s*/,'').replace(/COMMIT;\s*$/,''));await c.query('INSERT INTO public.iee_schema_migrations(name,checksum) VALUES($1,$2)',[name,checksum]);await c.query('COMMIT');console.log('Applied '+name)}catch(e){await c.query('ROLLBACK');throw e;}
 }
}finally{await c.query('SELECT pg_advisory_unlock(48761302)');await c.end();}
