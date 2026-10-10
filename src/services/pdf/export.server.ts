import { getUserSupabase } from "@/integrations/supabase/user-client.server";
import { withCredits } from "@/services/ai/engine/credits.server";
import { createWisoPdf } from "./template.server";
import type { PdfExportRequest, PdfExportResult, PdfDocumentType } from "./types";

const SAFE_TYPES: PdfDocumentType[] = ["worksheet", "exam"];

function safeFileName(value: string) {
  return (
    value
      .replace(/[\\/:*?"<>|]/g, "-")
      .split("")
      .filter((character) => character.charCodeAt(0) >= 32)
      .join("")
      .trim()
      .slice(0, 80) || "wiso"
  );
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

export async function exportPersonalizedPdf(
  userId: string,
  input: PdfExportRequest,
): Promise<PdfExportResult> {
  if (!input.requestId || !SAFE_TYPES.includes(input.documentType))
    throw new Error("invalid_pdf_request");
  if (!input.questions.length || input.questions.length > 500)
    throw new Error("invalid_pdf_questions");

  const supabase = getUserSupabase();
  const [
    { data: profile, error: profileError },
    { data: settingsRows, error: settingsError },
    { data: flag, error: flagError },
  ] = await Promise.all([
    supabase.from("profiles").select("national_id,national_id_verified").eq("id", userId).single(),
    supabase
      .from("site_settings")
      .select("key,value")
      .in("key", [
        "pdf_enabled",
        "pdf_credit_cost",
        "pdf_supported_types",
        "pdf_default_title",
        "pdf_footer_notice",
        "pdf_promotional_text",
      ]),
    supabase.from("feature_flags").select("enabled").eq("flag_key", "pdf_features").maybeSingle(),
  ]);
  if (profileError || !profile) throw new Error("pdf_profile_unavailable");
  if (settingsError || flagError) throw new Error("pdf_settings_unavailable");
  // Ownership is resolved only from the authenticated token. The request accepts no user or National ID field.
  if (!profile.national_id_verified || !profile.national_id)
    throw new Error("verified_national_id_required");

  const settings = Object.fromEntries(
    (settingsRows ?? []).map((row) => [row.key, row.value ?? ""]),
  );
  if (flag?.enabled === false || settings["pdf_enabled"] === "false")
    throw new Error("pdf_generation_disabled");
  let supported: string[] = SAFE_TYPES;
  try {
    supported = JSON.parse(settings["pdf_supported_types"] || "[]") as string[];
  } catch {
    supported = SAFE_TYPES;
  }
  if (!supported.includes(input.documentType)) throw new Error("unsupported_pdf_type");
  const creditCost = Math.max(0, Math.min(100, Number(settings["pdf_credit_cost"] ?? "1") || 0));

  const execute = async () => {
    const bytes = await createWisoPdf({
      nationalId: profile.national_id!,
      title: input.title?.trim() || settings["pdf_default_title"] || "ورقة أسئلة WISO",
      subjectName: input.subjectName,
      ...(input.topicName ? { topicName: input.topicName } : {}),
      documentType: input.documentType,
      footerNotice: settings["pdf_footer_notice"] || "WISO Agent — للاستخدام التعليمي الشخصي",
      ...(settings["pdf_promotional_text"]
        ? { promotionalText: settings["pdf_promotional_text"] }
        : {}),
      questions: input.questions,
    });
    return {
      base64: bytesToBase64(bytes),
      filename: `${safeFileName(input.title || settings["pdf_default_title"] || "WISO")}.pdf`,
      mimeType: "application/pdf" as const,
    };
  };
  return creditCost > 0
    ? withCredits(
        userId,
        `pdf:${input.requestId}:${input.documentType}`,
        "pdfs",
        creditCost,
        execute,
      )
    : execute();
}
