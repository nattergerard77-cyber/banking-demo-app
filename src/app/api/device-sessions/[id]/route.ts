import { NextRequest, NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: deviceId } = await params;
    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!deviceId || !accountId) {
      return NextResponse.json({ error: "Missing deviceId or accountId" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const { data: device, error: fetchError } = await supabase
      .from("device_sessions")
      .select("id, account_id, device_name")
      .eq("id", deviceId)
      .eq("account_id", accountId)
      .maybeSingle();

    if (fetchError || !device) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    const { error: deleteError } = await supabase
      .from("device_sessions")
      .delete()
      .eq("id", deviceId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      message: `${device.device_name} déconnecté`,
    });
  } catch (error) {
    console.error("Error deleting device:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
