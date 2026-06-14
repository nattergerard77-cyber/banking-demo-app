import { NextRequest, NextResponse } from "next/server";

import { processAccountBlocks } from "@/lib/schedule-account-block";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    console.log("[CRON] Processing scheduled account blocks...");
    const result = await processAccountBlocks();

    return NextResponse.json({
      success: true,
      message: "Account blocks processed",
      processed: result.processed,
      failed: result.failed,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error("[CRON] Error processing account blocks:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
