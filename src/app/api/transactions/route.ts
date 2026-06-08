import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type TransactionsResponse =
  | { success: true; transactions: unknown[] }
  | { success: false; error: "TRANSACTIONS_FETCH_FAILED" };

function jsonResponse(body: TransactionsResponse, status: number) {
  return Response.json(body, { status });
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Unknown transactions error";
}

function getLimit(searchParams: URLSearchParams): number {
  const limitParam = searchParams.get("limit");
  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : 50;

  if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) return 50;

  return Math.min(parsedLimit, 100);
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const accountId = url.searchParams.get("accountId");
    const limit = getLimit(url.searchParams);
    const supabase = createServerSupabaseClient();

    let query = supabase
      .from("transactions")
      .select("id, account_id, transfer_id, reference, label, merchant, category, amount, currency, direction, status, transaction_date, transaction_time, iban, bank, sender_iban, note, metadata, created_at, updated_at")
      .eq("status", "executed")
      .order("transaction_date", { ascending: false })
      .order("transaction_time", { ascending: false })
      .limit(limit);

    if (accountId) {
      query = query.eq("account_id", accountId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[api/transactions] fetch failed:", error.message);
      return jsonResponse({ success: false, error: "TRANSACTIONS_FETCH_FAILED" }, 500);
    }

    return jsonResponse({ success: true, transactions: data ?? [] }, 200);
  } catch (error) {
    console.error("[api/transactions] fetch failed:", getSafeErrorMessage(error));
    return jsonResponse({ success: false, error: "TRANSACTIONS_FETCH_FAILED" }, 500);
  }
}
