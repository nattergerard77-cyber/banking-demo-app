import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("banking_demo_session")?.value === "authenticated";
  } catch {
    return false;
  }
}

type PostBeneficiaryBody = {
  name: string;
  iban: string;
  bic?: string;
  bank?: string;
  email?: string;
  phone?: string;
};

type PostBeneficiaryResponse =
  | { success: true; beneficiary: Record<string, unknown> }
  | { success: false; error: string; message: string };

function jsonResponse<T>(body: T, status: number) {
  return Response.json(body, { status });
}

function getSafeErrorMessage(error: unknown): string {
  return error instanceof Error && error.message ? error.message : "Unknown beneficiaries error";
}

function generateCode(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function generateInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "NB";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  try {
    if (!(await isAuthenticated())) {
      return jsonResponse({ success: false, error: "UNAUTHORIZED" }, 401);
    }
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("beneficiaries")
      .select("id, code, name, type, iban, bic, bank, email, phone, initials, favorite, active, created_at, updated_at")
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

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticated())) {
      return jsonResponse<PostBeneficiaryResponse>({ success: false, error: "UNAUTHORIZED", message: "Non authentifié" }, 401);
    }
    const body = (await request.json()) as PostBeneficiaryBody;

    if (!body.name?.trim()) {
      return jsonResponse<PostBeneficiaryResponse>(
        { success: false, error: "MISSING_NAME", message: "Le nom du bénéficiaire est obligatoire." },
        400,
      );
    }

    if (!body.iban?.trim()) {
      return jsonResponse<PostBeneficiaryResponse>(
        { success: false, error: "MISSING_IBAN", message: "L'IBAN du bénéficiaire est obligatoire." },
        400,
      );
    }

    if (body.email && !isValidEmail(body.email)) {
      return jsonResponse<PostBeneficiaryResponse>(
        { success: false, error: "INVALID_EMAIL", message: "Le format de l'email est invalide." },
        400,
      );
    }

    const name = body.name.trim();
    const iban = body.iban.trim().toUpperCase();
    const bic = body.bic?.trim().toUpperCase() ?? null;
    const bank = body.bank?.trim() ?? "";
    const email = body.email?.trim() ?? null;
    const phone = body.phone?.trim() ?? null;

    const supabase = createServerSupabaseClient();

    const { data: existing } = await supabase
      .from("beneficiaries")
      .select("id")
      .eq("iban", iban)
      .maybeSingle();

    if (existing) {
      const { data: beneficiary } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("id", existing.id)
        .single();

      return jsonResponse<PostBeneficiaryResponse>(
        { success: true, beneficiary: beneficiary ?? {} },
        200,
      );
    }

    const code = generateCode(name);
    const initials = generateInitials(name);

    const { data: beneficiary, error: insertError } = await supabase
      .from("beneficiaries")
      .insert({
        code,
        name,
        type: "Particulier",
        iban,
        bic,
        bank,
        email,
        phone,
        initials,
        favorite: false,
        active: true,
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("[api/beneficiaries] insert failed:", insertError.message);
      return jsonResponse<PostBeneficiaryResponse>(
        { success: false, error: "INSERT_FAILED", message: "Impossible de créer le bénéficiaire." },
        500,
      );
    }

    return jsonResponse<PostBeneficiaryResponse>({ success: true, beneficiary }, 201);
  } catch (error) {
    console.error("[api/beneficiaries] post failed:", getSafeErrorMessage(error));
    return jsonResponse<PostBeneficiaryResponse>(
      { success: false, error: "UNEXPECTED_ERROR", message: "Une erreur inattendue est survenue." },
      500,
    );
  }
}
