import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
    }

    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const supabase = createServerSupabaseClient();
    const { data: devices, error } = await supabase
      .from("device_sessions")
      .select("id, device_name, device_type, ip_address, city, country, last_activity, created_at")
      .eq("account_id", accountId)
      .gt("last_activity", oneHourAgo.toISOString())
      .order("last_activity", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      devices: devices ?? [],
      count: devices?.length ?? 0,
    });
  } catch (error) {
    console.error("Error fetching device sessions:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
