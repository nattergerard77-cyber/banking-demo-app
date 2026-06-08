import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type AccountsResponse =
  | { success: true; accounts: unknown[] }
  | { success: false; error: "ACCOUNTS_FETCH_FAILED" };

function jsonResponse(body: AccountsResponse, status: number) {
  return Response.json(body, { status });
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Unknown accounts error";
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("accounts")
      .select("id, code, name, type, iban, currency, balance, available_balance, status, holder_name, holder_email, display_order, created_at, updated_at")
      .eq("status", "active")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("[api/accounts] fetch failed:", error.message);
      return jsonResponse({ success: false, error: "ACCOUNTS_FETCH_FAILED" }, 500);
    }

    return jsonResponse({ success: true, accounts: data ?? [] }, 200);
  } catch (error) {
    console.error("[api/accounts] fetch failed:", getSafeErrorMessage(error));
    return jsonResponse({ success: false, error: "ACCOUNTS_FETCH_FAILED" }, 500);
  }
}
