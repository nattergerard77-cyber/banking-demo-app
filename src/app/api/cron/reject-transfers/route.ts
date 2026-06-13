import { NextRequest, NextResponse } from "next/server";
import { rejectTransfersAfter3Days } from "@/lib/reject-transfer";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[CRON] Démarrage du cron de rejet de virements...");
    const result = await rejectTransfersAfter3Days();

    console.log(`[CRON] Complété : ${result.processed} virements traités`);

    return NextResponse.json({
      success: true,
      message: `${result.processed} virements rejetés et notifiés`,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("[CRON] Erreur:", error);
    return NextResponse.json(
      {
        error: "Failed to process rejections",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
