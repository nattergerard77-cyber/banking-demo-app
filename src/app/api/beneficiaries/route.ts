import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type BeneficiariesResponse =
  | { success: true; beneficiaries: unknown[] }
  | { success: false; error: "BENEFICIARIES_FETCH_FAILED" };

function jsonResponse(body: BeneficiariesResponse, status: number) {
  return Response.json(body, { status });
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Unknown beneficiaries error";
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("id, code, name, type, iban, bank, email, phone, initials, favorite, active, created_at, updated_at")
      .eq("active", true)
      .order("favorite", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      console.error("[api/beneficiaries] fetch failed:", error.message);
      return jsonResponse({ success: false, error: "BENEFICIARIES_FETCH_FAILED" }, 500);
    }

    return jsonResponse({ success: true, beneficiaries: data ?? [] }, 200);
  } catch (error) {
    console.error("[api/beneficiaries] fetch failed:", getSafeErrorMessage(error));
    return jsonResponse({ success: false, error: "BENEFICIARIES_FETCH_FAILED" }, 500);
  }
}
