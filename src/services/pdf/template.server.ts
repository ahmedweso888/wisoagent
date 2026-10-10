import fontkit from "@pdf-lib/fontkit";
import bidiFactory from "bidi-js";
import { PDFDocument, PDFPage, PDFFont, rgb } from "pdf-lib";
import reshaper from "arabic-persian-reshaper";

import { PDF_ARABIC_FONT_BASE64 } from "@/assets/pdf-font.generated";
import { PDF_WISO_LOGO_BASE64 } from "@/assets/pdf-logo.generated";
import type { GeneratedQuestion } from "@/services/ai/types";
import type { PdfDocumentType } from "./types";

const A4: [number, number] = [595.28, 841.89];
const MARGIN = 48;
const OLIVE = rgb(0.22, 0.31, 0.13);
const GOLD = rgb(0.58, 0.52, 0.25);
const INK = rgb(0.11, 0.14, 0.09);
const MUTED = rgb(0.37, 0.39, 0.33);
const bidi = bidiFactory();

function bytesFromBase64(value: string): Uint8Array {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

/** Shapes Arabic glyphs and applies the Unicode bidi algorithm for PDF drawing. */
export function visualRtl(value: string): string {
  const shaped = reshaper.ArabicShaper.convertArabic(value);
  const levels = bidi.getEmbeddingLevels(shaped, "rtl");
  return bidi.getReorderedString(shaped, levels);
}

function splitLogicalLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.replace(/\s+/g, " ").trim().split("\n")) {
    let current = "";
    for (const word of paragraph.split(" ")) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && font.widthOfTextAtSize(visualRtl(candidate), size) > maxWidth) {
        lines.push(current);
        current = word;
      } else current = candidate;
    }
    if (current) lines.push(current);
  }
  return lines.length ? lines : [""];
}

function drawRtl(
  page: PDFPage,
  text: string,
  font: PDFFont,
  size: number,
  y: number,
  options?: {
    color?: ReturnType<typeof rgb>;
    xRight?: number;
  },
) {
  const visual = visualRtl(text);
  const right = options?.xRight ?? A4[0] - MARGIN;
  page.drawText(visual, {
    x: right - font.widthOfTextAtSize(visual, size),
    y,
    size,
    font,
    color: options?.color ?? INK,
  });
}

function drawWatermark(page: PDFPage, nationalId: string, font: PDFFont) {
  const size = 42;
  const width = font.widthOfTextAtSize(nationalId, size);
  page.drawText(nationalId, {
    x: Math.max(MARGIN, (A4[0] - width) / 2),
    y: A4[1] / 2 - 12,
    size,
    font,
    color: OLIVE,
    opacity: 0.095,
  });
}

function drawChrome(
  page: PDFPage,
  font: PDFFont,
  logo: Awaited<ReturnType<PDFDocument["embedPng"]>>,
  nationalId: string,
  footerNotice: string,
  pageNumber: number,
) {
  drawWatermark(page, nationalId, font);
  page.drawRectangle({ x: 0, y: A4[1] - 15, width: A4[0], height: 15, color: OLIVE });
  page.drawImage(logo, { x: MARGIN, y: A4[1] - 64, width: 45, height: 27 });
  page.drawText("WISO Agent", { x: MARGIN + 52, y: A4[1] - 52, size: 10, font, color: OLIVE });
  page.drawLine({
    start: { x: MARGIN, y: 40 },
    end: { x: A4[0] - MARGIN, y: 40 },
    thickness: 0.7,
    color: GOLD,
  });
  drawRtl(page, footerNotice, font, 8.5, 24, { color: MUTED });
  page.drawText(String(pageNumber), { x: MARGIN, y: 24, size: 8.5, font, color: MUTED });
}

export type WisoPdfInput = {
  nationalId: string;
  title: string;
  subjectName: string;
  topicName?: string;
  documentType: PdfDocumentType;
  footerNotice: string;
  promotionalText?: string;
  questions: GeneratedQuestion[];
  generatedAt?: Date;
};

/** One code-controlled, A4, selectable-text template for every personalized WISO PDF. */
export async function createWisoPdf(input: WisoPdfInput): Promise<Uint8Array> {
  if (!/^\d{14}$/.test(input.nationalId)) throw new Error("verified_national_id_required");
  if (!input.questions.length || input.questions.length > 500)
    throw new Error("invalid_pdf_questions");

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(bytesFromBase64(PDF_ARABIC_FONT_BASE64), { subset: true });
  const logo = await pdf.embedPng(bytesFromBase64(PDF_WISO_LOGO_BASE64));
  const pages: PDFPage[] = [];
  let page = pdf.addPage(A4);
  pages.push(page);
  let y = A4[1] - 95;

  const newPage = () => {
    page = pdf.addPage(A4);
    pages.push(page);
    y = A4[1] - 76;
  };

  drawRtl(page, input.title, font, 22, y, { color: OLIVE });
  y -= 34;
  drawRtl(page, `المادة: ${input.subjectName}`, font, 11, y, { color: MUTED });
  y -= 20;
  if (input.topicName) {
    drawRtl(page, `الوحدة / الدرس: ${input.topicName}`, font, 11, y, { color: MUTED });
    y -= 20;
  }
  drawRtl(
    page,
    `${input.documentType === "exam" ? "نموذج اختبار" : "ورقة تدريب"} • ${new Intl.DateTimeFormat("ar-EG", { dateStyle: "long" }).format(input.generatedAt ?? new Date())}`,
    font,
    9.5,
    y,
    { color: MUTED },
  );
  y -= 28;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: A4[0] - MARGIN, y },
    thickness: 1.2,
    color: GOLD,
  });
  y -= 28;

  for (const [index, question] of input.questions.entries()) {
    const promptLines = splitLogicalLines(
      `${index + 1}. ${question.prompt}`,
      font,
      12,
      A4[0] - MARGIN * 2,
    );
    const optionLines = question.options.flatMap((option) =>
      splitLogicalLines(`${option.key}) ${option.text}`, font, 10.5, A4[0] - MARGIN * 2 - 18),
    );
    const requiredHeight = promptLines.length * 20 + optionLines.length * 17 + 28;
    if (y - requiredHeight < 58) newPage();
    for (const line of promptLines) {
      drawRtl(page, line, font, 12, y);
      y -= 20;
    }
    for (const line of optionLines) {
      drawRtl(page, line, font, 10.5, y, { color: MUTED, xRight: A4[0] - MARGIN - 18 });
      y -= 17;
    }
    y -= 13;
  }

  if (input.promotionalText) {
    if (y < 90) newPage();
    drawRtl(page, input.promotionalText, font, 9, y, { color: GOLD });
  }

  pages.forEach((pdfPage, index) =>
    drawChrome(pdfPage, font, logo, input.nationalId, input.footerNotice, index + 1),
  );
  pdf.setTitle(input.title);
  pdf.setAuthor("WISO Agent");
  pdf.setCreator("WISO secure PDF service");
  pdf.setSubject(input.subjectName);
  pdf.setKeywords(["WISO", "Arabic", "RTL", input.nationalId]);
  pdf.setCreationDate(input.generatedAt ?? new Date());
  return pdf.save({ useObjectStreams: false });
}

export const WISO_A4_SIZE = A4;
