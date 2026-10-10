import assert from "node:assert/strict";
import test from "node:test";
import { PDFDocument } from "pdf-lib";

import { createWisoPdf, visualRtl, WISO_A4_SIZE } from "@/services/pdf/template.server";
import type { GeneratedQuestion } from "@/services/ai/types";

const question: GeneratedQuestion = {
  prompt: "ما نتيجة جمع اثنين وثلاثة؟",
  questionType: "mcq",
  difficulty: "basic",
  difficultyScore: 1,
  options: [
    { key: "أ", text: "أربعة" },
    { key: "ب", text: "خمسة" },
  ],
  correctAnswer: "ب",
  explanation: "اثنان زائد ثلاثة يساوي خمسة.",
  conceptsTested: ["الجمع"],
  commonTrap: "الطرح بدلاً من الجمع",
  estimatedTimeSeconds: 30,
  sourceReferences: [],
};

test("PDF template creates valid A4 pages with ownership metadata and official logo", async () => {
  const nationalId = "29801010100126";
  const bytes = await createWisoPdf({
    nationalId,
    title: "ورقة أسئلة WISO",
    subjectName: "الرياضيات",
    topicName: "الجمع",
    documentType: "worksheet",
    footerNotice: "WISO Agent",
    questions: Array.from({ length: 40 }, () => question),
    generatedAt: new Date("2026-01-01T00:00:00Z"),
  });
  assert.equal(String.fromCharCode(...bytes.slice(0, 5)), "%PDF-");
  const document = await PDFDocument.load(bytes);
  assert.ok(document.getPageCount() > 1);
  for (const page of document.getPages()) {
    assert.ok(Math.abs(page.getWidth() - WISO_A4_SIZE[0]) < 0.1);
    assert.ok(Math.abs(page.getHeight() - WISO_A4_SIZE[1]) < 0.1);
  }
  assert.ok(document.getKeywords()?.includes(nationalId));
  assert.equal(document.getAuthor(), "WISO Agent");
  assert.ok(bytes.length > 20_000, "embedded Arabic font and official WISO logo must be present");
});

test("Arabic text is shaped and visually ordered without losing its content", () => {
  const rendered = visualRtl("سؤال عربي 123");
  assert.notEqual(rendered, "سؤال عربي 123");
  assert.ok(rendered.includes("123"));
});

test("PDF refuses unverified-shaped identity and empty content", async () => {
  await assert.rejects(
    createWisoPdf({
      nationalId: "123",
      title: "اختبار",
      subjectName: "مادة",
      documentType: "exam",
      footerNotice: "WISO",
      questions: [question],
    }),
    /verified_national_id_required/,
  );
});
