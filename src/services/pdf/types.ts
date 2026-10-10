import type { GeneratedQuestion } from "@/services/ai/types";

export type PdfDocumentType = "worksheet" | "exam";

export type PdfExportRequest = {
  requestId: string;
  documentType: PdfDocumentType;
  title?: string;
  subjectName: string;
  topicName?: string;
  questions: GeneratedQuestion[];
};

export type PdfExportResult = {
  base64: string;
  filename: string;
  mimeType: "application/pdf";
};
