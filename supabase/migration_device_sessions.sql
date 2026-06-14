CREATE TABLE IF NOT EXISTS device_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_agent text,
  device_name text,
  device_type text CHECK (device_type IN ('mobile', 'tablet', 'desktop')),
  ip_address text,
  city text,
  country text,
  latitude float8,
  longitude float8,
  last_activity timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (device_name IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS device_sessions_account_id_idx
ON device_sessions(account_id);

CREATE INDEX IF NOT EXISTS device_sessions_last_activity_idx
ON device_sessions(last_activity);

CREATE INDEX IF NOT EXISTS device_sessions_account_last_activity_idx
ON device_sessions(account_id, last_activity DESC);

DROP TRIGGER IF EXISTS device_sessions_set_updated_at ON device_sessions;
CREATE TRIGGER device_sessions_set_updated_at
BEFORE UPDATE ON device_sessions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
