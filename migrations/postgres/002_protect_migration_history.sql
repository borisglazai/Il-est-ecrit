BEGIN;
ALTER TABLE public.iee_schema_migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.iee_schema_migrations FROM PUBLIC;
DO $security$ BEGIN
 IF EXISTS (SELECT FROM pg_roles WHERE rolname='anon') THEN REVOKE ALL ON public.iee_schema_migrations FROM anon; END IF;
 IF EXISTS (SELECT FROM pg_roles WHERE rolname='authenticated') THEN REVOKE ALL ON public.iee_schema_migrations FROM authenticated; END IF;
END $security$;
COMMIT;
