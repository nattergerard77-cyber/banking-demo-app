-- Migration: ajouter la table de tâches planifiées pour emails et blocages

CREATE TABLE IF NOT EXISTS scheduled_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid REFERENCES transfers(id) ON DELETE CASCADE,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  task_type text NOT NULL CHECK (task_type IN ('block_account', 'send_receipt_pdf')),
  execute_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (transfer_id IS NOT NULL OR account_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS scheduled_tasks_status_execute_at_idx
ON scheduled_tasks(status, execute_at);

CREATE INDEX IF NOT EXISTS scheduled_tasks_task_type_idx
ON scheduled_tasks(task_type);

DROP TRIGGER IF EXISTS scheduled_tasks_set_updated_at ON scheduled_tasks;
CREATE TRIGGER scheduled_tasks_set_updated_at
BEFORE UPDATE ON scheduled_tasks
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
