-- Execute this entire script in Supabase SQL Editor. No password is required here.
-- Transactional installation; records the same checksum as db:migrate.
BEGIN;
SELECT pg_advisory_xact_lock(48761302);
CREATE TABLE IF NOT EXISTS public.iee_schema_migrations(name text PRIMARY KEY,checksum text NOT NULL,applied_at timestamptz NOT NULL DEFAULT now());
DO $install$
BEGIN
 IF EXISTS (SELECT 1 FROM public.iee_schema_migrations WHERE name='001_accounts.sql' AND checksum<>'af05d912690c0a6c97e69afa0bef0a6c97745c52cb0b3cecf6cd817fb3145428') THEN
  RAISE EXCEPTION 'Migration checksum mismatch: stop and inspect existing installation';
 END IF;
 IF NOT EXISTS (SELECT 1 FROM public.iee_schema_migrations WHERE name='001_accounts.sql') THEN

CREATE SCHEMA IF NOT EXISTS iee;
DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='iee_app') THEN CREATE ROLE iee_app NOLOGIN NOSUPERUSER NOBYPASSRLS; END IF; END $$;
CREATE TABLE iee.users (
 id uuid PRIMARY KEY, provider text NOT NULL, subject text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(provider,subject)
);
CREATE TABLE iee.progress (
 user_id uuid PRIMARY KEY REFERENCES iee.users(id), payload jsonb,
 revision integer NOT NULL DEFAULT 0 CHECK(revision>=0), last_write_id text,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE iee.learning_sessions (
 user_id uuid NOT NULL REFERENCES iee.users(id), id text NOT NULL,
 lesson_id text NOT NULL, completed_at timestamptz NOT NULL, evidence jsonb NOT NULL,
 PRIMARY KEY(user_id,id)
);
CREATE TABLE iee.learning_attempts (
 user_id uuid NOT NULL, session_id text NOT NULL, id text NOT NULL,
 skill text NOT NULL, answer text NOT NULL, correct boolean NOT NULL,
 hint boolean NOT NULL, answered_at timestamptz NOT NULL,
 PRIMARY KEY(user_id,session_id,id),
 FOREIGN KEY(user_id,session_id) REFERENCES iee.learning_sessions(user_id,id)
);
CREATE INDEX sessions_user_date ON iee.learning_sessions(user_id,completed_at);
CREATE INDEX attempts_user_skill ON iee.learning_attempts(user_id,skill);
ALTER TABLE iee.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE iee.users FORCE ROW LEVEL SECURITY;
CREATE POLICY own_user ON iee.users USING(id::text=current_setting('iee.user_id',true)) WITH CHECK(id::text=current_setting('iee.user_id',true));
ALTER TABLE iee.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE iee.progress FORCE ROW LEVEL SECURITY;
CREATE POLICY own_progress ON iee.progress USING(user_id::text=current_setting('iee.user_id',true)) WITH CHECK(user_id::text=current_setting('iee.user_id',true));
ALTER TABLE iee.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE iee.learning_sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY own_sessions ON iee.learning_sessions USING(user_id::text=current_setting('iee.user_id',true)) WITH CHECK(user_id::text=current_setting('iee.user_id',true));
ALTER TABLE iee.learning_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE iee.learning_attempts FORCE ROW LEVEL SECURITY;
CREATE POLICY own_attempts ON iee.learning_attempts USING(user_id::text=current_setting('iee.user_id',true)) WITH CHECK(user_id::text=current_setting('iee.user_id',true));
REVOKE ALL ON SCHEMA iee FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA iee FROM PUBLIC;
GRANT USAGE ON SCHEMA iee TO iee_app;
GRANT SELECT,INSERT ON iee.users,iee.learning_sessions,iee.learning_attempts TO iee_app;
GRANT SELECT,INSERT,UPDATE ON iee.progress TO iee_app;

INSERT INTO public.iee_schema_migrations(name,checksum) VALUES ('001_accounts.sql','af05d912690c0a6c97e69afa0bef0a6c97745c52cb0b3cecf6cd817fb3145428');
 END IF;
END;
$install$;
ALTER TABLE public.iee_schema_migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iee_schema_migrations FROM PUBLIC;
DO $security$ BEGIN
 IF EXISTS (SELECT FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON public.iee_schema_migrations FROM anon; END IF;
 IF EXISTS (SELECT FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON public.iee_schema_migrations FROM authenticated; END IF;
END $security$;
COMMIT;
SELECT name,applied_at FROM public.iee_schema_migrations WHERE name='001_accounts.sql';
