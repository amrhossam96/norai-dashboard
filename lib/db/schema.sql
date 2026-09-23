-- Dashboard-owned tables. They live beside the norai data plane in the same
-- Postgres but in their own schema, so nothing here touches the backend's
-- contract (api/openapi.yaml, storage/postgres/schema.sql) or its RLS policies.
-- Applied idempotently on first pool use (lib/db/pg.ts).
CREATE SCHEMA IF NOT EXISTS dashboard;

CREATE TABLE IF NOT EXISTS dashboard.users (
  user_id       text PRIMARY KEY,
  email         text NOT NULL,
  password_hash text NOT NULL,
  first_name    text NOT NULL DEFAULT '',
  last_name     text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS dashboard_users_email_idx ON dashboard.users (lower(email));

CREATE TABLE IF NOT EXISTS dashboard.sessions (
  token_hash text PRIMARY KEY,
  user_id    text NOT NULL REFERENCES dashboard.users(user_id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS dashboard_sessions_user_idx ON dashboard.sessions (user_id);

-- Who may open which project. The backend has no notion of a human user; the
-- project is its top-level unit, so membership is the dashboard's to keep.
CREATE TABLE IF NOT EXISTS dashboard.memberships (
  user_id    text NOT NULL REFERENCES dashboard.users(user_id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES public.projects(project_id),
  role       text NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

-- One secret key per project, minted at project creation and held encrypted
-- (AES-256-GCM under DASHBOARD_SECRET). The dashboard uses it to call the
-- gateway on the project's behalf: config uploads go through PUT /v1/config/*
-- so they get the gateway's validation, and the playground calls /v1/recommend
-- and /v1/explain. It is never shown to a user.
CREATE TABLE IF NOT EXISTS dashboard.project_keys (
  project_id text PRIMARY KEY REFERENCES public.projects(project_id),
  key_id     text NOT NULL,
  ciphertext text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dashboard.waitlist (
  email      text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
