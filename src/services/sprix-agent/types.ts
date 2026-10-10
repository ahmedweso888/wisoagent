export const SPRIX_PLATFORM = "sprix" as const;
export const SPRIX_SUBJECT = "الثقافة المالية" as const;

export type SprixAnswerVerificationStatus =
  | "unresolved"
  | "ai_suggested"
  | "verified"
  | "rejected";

export type SprixRunStatus =
  | "queued"
  | "running"
  | "paused"
  | "completed"
  | "failed"
  | "needs_review"
  | "cancelled";

export type SprixOption = {
  text: string;
  value?: string;
};

export type SprixDetectedQuestion = {
  questionText: string;
  options: SprixOption[];
  fingerprint: string;
  normalizedQuestionText: string;
};

export type SprixRunSnapshot = {
  runId: string;
  status: SprixRunStatus;
  questionsProcessed: number;
  questionsCompleted: number;
  unresolvedQuestions: number;
  currentQuestionFingerprint: string | null;
  errorCode: string | null;
  errorMessageSafe: string | null;
  lastActivityAt: string | null;
};

export type SprixWorkerResult = {
  status: "completed" | "needs_review" | "failed";
  questionsProcessed: number;
  questionsCompleted: number;
  unresolvedQuestions: number;
  currentQuestionFingerprint?: string | null;
  unresolvedQuestionText?: string | null;
  unresolvedQuestionOptions?: string[] | null;
  errorCode?: string;
  errorMessageSafe?: string;
};
