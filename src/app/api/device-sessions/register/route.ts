import { NextRequest, NextResponse } from "next/server";

import { detectDevice } from "@/lib/device-detection";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { accountId } = (await request.json()) as { accountId?: string };

    if (!accountId) {
      return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
    }

    const userAgent = request.headers.get("user-agent") || "Unknown";
    const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("cf-connecting-ip")
      || "unknown";

    const device = detectDevice(userAgent);
    const supabase = createServerSupabaseClient();

    const { data: existingSession } = await supabase
      .from("device_sessions")
      .select("id")
      .eq("account_id", accountId)
      .eq("device_name", device.deviceName)
      .eq("ip_address", ipAddress)
      .maybeSingle();

    if (existingSession?.id) {
      const { error: updateError } = await supabase
        .from("device_sessions")
        .update({
          last_activity: new Date().toISOString(),
          user_agent: device.userAgent,
        })
        .eq("id", existingSession.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from("device_sessions")
        .insert({
          account_id: accountId,
          user_agent: device.userAgent,
          device_name: device.deviceName,
          device_type: device.deviceType,
          ip_address: ipAddress,
          city: null,
          country: null,
          latitude: null,
          longitude: null,
        });

      if (insertError) throw insertError;
    }

    return NextResponse.json({
      success: true,
      device: device.deviceName,
    });
  } catch (error) {
    console.error("Error registering device:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
