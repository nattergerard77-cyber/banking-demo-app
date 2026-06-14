import { createServerSupabaseClient } from "./supabase/server";

type ScheduledBlockTask = {
  id: string;
  account_id: string;
};

const DEFAULT_BLOCK_DELAY_HOURS = 24;
const BLOCK_REASON = "Une activité inhabituelle a été détectée sur votre compte.";

export async function scheduleAccountBlock(accountId: string, delayHours = DEFAULT_BLOCK_DELAY_HOURS) {
  const supabase = createServerSupabaseClient();
  const executeAt = new Date();
  executeAt.setHours(executeAt.getHours() + delayHours);

  const { error } = await supabase.from("scheduled_tasks").insert({
    account_id: accountId,
    task_type: "block_account",
    execute_at: executeAt.toISOString(),
    status: "pending",
  });

  if (error) {
    console.error("[ACCOUNT BLOCK] schedule failed", {
      accountId,
      error: error.message,
    });
    throw error;
  }

  console.log("[ACCOUNT BLOCK] scheduled", {
    accountId,
    executeAt: executeAt.toISOString(),
  });

  return executeAt.toISOString();
}

export async function processAccountBlocks() {
  const supabase = createServerSupabaseClient();
  const now = new Date().toISOString();

  const { data: tasks, error } = await supabase
    .from("scheduled_tasks")
    .select("id, account_id")
    .eq("status", "pending")
    .eq("task_type", "block_account")
    .lte("execute_at", now);

  if (error) {
    console.error("[ACCOUNT BLOCK] failed to fetch pending tasks", error);
    throw error;
  }

  let processed = 0;
  let failed = 0;

  for (const task of (tasks ?? []) as ScheduledBlockTask[]) {
    try {
      const { error: blockError } = await supabase
        .from("accounts")
        .update({
          is_blocked: true,
          blocked_reason: BLOCK_REASON,
          blocked_at: new Date().toISOString(),
        })
        .eq("id", task.account_id)
        .eq("is_blocked", false);

      if (blockError) throw blockError;

      const { error: taskUpdateError } = await supabase
        .from("scheduled_tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      if (taskUpdateError) throw taskUpdateError;

      processed += 1;
    } catch (processingError) {
      failed += 1;

      console.error("[ACCOUNT BLOCK] failed", {
        accountId: task.account_id,
        taskId: task.id,
        error: processingError instanceof Error ? processingError.message : String(processingError),
      });

      const { error: taskUpdateError } = await supabase
        .from("scheduled_tasks")
        .update({
          status: "failed",
          error: processingError instanceof Error ? processingError.message : String(processingError),
        })
        .eq("id", task.id);

      if (taskUpdateError) {
        console.error("[ACCOUNT BLOCK] failed to persist task failure", {
          taskId: task.id,
          error: taskUpdateError.message,
        });
      }
    }
  }

  return {
    processed,
    failed,
    timestamp: new Date().toISOString(),
  };
}
