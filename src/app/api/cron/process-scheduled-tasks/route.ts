import { NextRequest, NextResponse } from "next/server";

import { processScheduledTasks } from "@/lib/schedule-transfer-receipt";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[CRON] Démarrage du traitement des avis de virement différés...");
    const result = await processScheduledTasks();

    console.log(`[CRON] Complété : ${result.processed} avis différés traités (${result.sent} envoyés, ${result.failed} en échec)`);

    return NextResponse.json({
      success: true,
      message: "Scheduled tasks processed",
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("[CRON] Erreur traitement avis différés:", error);
    return NextResponse.json(
      {
        error: "Failed to process scheduled tasks",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
