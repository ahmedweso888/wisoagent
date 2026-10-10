import type { SprixWorkerResult } from "./types";

/* ============================================================================
 * Legacy WISO / SPRIX Agent
 * ========================================================================== */

function agentUrl(): string {
  return (process.env["WISO_AGENT_URL"] ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    "",
  );
}

function agentSecret(): string {
  const secret = process.env["WISO_AGENT_SECRET"];

  if (!secret) {
    throw new Error("WISO_AGENT_SECRET is not configured on the server.");
  }

  return secret;
}

export type PythonSprixRunRequest = {
  runId: string;
  username: string;
  password: string;
  baseUrl: string;
  subject: string;
  timeoutMs: number;
  maxQuestions: number;
  verifiedAnswers: Array<{
    fingerprint: string;
    normalizedQuestionText: string;
    correctOptionText: string;
  }>;
};

export async function verifySprixCredentials(input: {
  username: string;
  password: string;
  baseUrl: string;
}): Promise<{
  verified: boolean;
  errorCode: string | null;
}> {
  const response = await fetch(`${agentUrl()}/v1/sprix/verify`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${agentSecret()}`,
    },
    body: JSON.stringify({
      username: input.username,
      password: input.password,
      base_url: input.baseUrl,
    }),
    signal: AbortSignal.timeout(135_000),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`SPRIX verification failed (${response.status})`);
  }

  const payload = JSON.parse(body) as {
    verified?: boolean;
    errorCode?: string | null;
  };

  return {
    verified: payload.verified === true,
    errorCode: payload.errorCode ?? null,
  };
}

export async function executeSprixInWorker(
  input: PythonSprixRunRequest,
): Promise<SprixWorkerResult> {
  const response = await fetch(`${agentUrl()}/v1/sprix/run`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${agentSecret()}`,
    },
    body: JSON.stringify({
      run_id: input.runId,
      username: input.username,
      password: input.password,
      base_url: input.baseUrl,
      subject: input.subject,
      timeout_ms: input.timeoutMs,
      max_questions: input.maxQuestions,
      verified_answers: input.verifiedAnswers.map((answer) => ({
        fingerprint: answer.fingerprint,
        normalized_question_text: answer.normalizedQuestionText,
        correct_option_text: answer.correctOptionText,
      })),
    }),
    signal: AbortSignal.timeout(input.timeoutMs + 15_000),
  });

  const body = await response.text();

  if (!response.ok) {
    throw new Error(
      `SPRIX worker request failed (${response.status}): ${body.slice(0, 500)}`,
    );
  }

  const payload = JSON.parse(body) as SprixWorkerResult;

  if (!payload || typeof payload["status"] !== "string") {
    throw new Error("Invalid SPRIX worker response.");
  }

  return payload;
}

/* ============================================================================
 * Railway WISO Tools Platform
 * ========================================================================== */

function toolsApiUrl(): string {
  const url =
    process.env["SPRIX_TOOLS_API_URL"] ??
    "https://tools-platform-production.up.railway.app";

  return url.replace(/\/$/, "");
}

/**
 * The Railway Tools Platform currently does not expose an API-key variable.
 * Therefore the key is optional.
 *
 * If SPRIX_TOOLS_API_KEY is configured later, it will automatically be sent.
 */
function toolsApiKey(): string | undefined {
  const key = process.env["SPRIX_TOOLS_API_KEY"]?.trim();

  return key || undefined;
}

function toolsHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  const key = toolsApiKey();

  if (key) {
    headers["authorization"] = `Bearer ${key}`;
  }

  return headers;
}

/* ============================================================================
 * SPRIX Subjects
 * ========================================================================== */

export type SprixToolCredentials = {
  code: string;
  password: string;
};

export type SprixSubject = {
  id: string;
  name: string;
};

export type SprixSubjectsResult = {
  success: boolean;
  subjects: SprixSubject[];
  message: string;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function getSubject(value: unknown): SprixSubject | null {
  if (!isRecord(value)) {
    return null;
  }

  const rawId = value["id"];

  const rawName =
    value["name"] ??
    value["title"] ??
    value["name_ar"] ??
    value["label"];

  const id =
    typeof rawId === "string"
      ? rawId
      : typeof rawId === "number"
        ? String(rawId)
        : null;

  const name = getString(rawName);

  if (!id || !name) {
    return null;
  }

  return {
    id,
    name,
  };
}

export async function getSprixSubjects(
  credentials: SprixToolCredentials,
): Promise<SprixSubjectsResult> {
  const response = await fetch(
    `${toolsApiUrl()}/api/tools/sprix/subjects`,
    {
      method: "POST",
      headers: toolsHeaders(),
      body: JSON.stringify({
        accounts: [
          {
            code: credentials.code,
            password: credentials.password,
          },
        ],
      }),
      signal: AbortSignal.timeout(135_000),
    },
  );

  const body = await response.text();

  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(
      `Invalid JSON response from WISO Tools Platform (${response.status}).`,
    );
  }

  if (!response.ok) {
    if (isRecord(payload)) {
      const error = getString(payload["error"]);
      const message = getString(payload["message"]);

      if (error) {
        throw new Error(error);
      }

      if (message) {
        throw new Error(message);
      }
    }

    throw new Error(
      `WISO Tools Platform request failed (${response.status}).`,
    );
  }

  if (!isRecord(payload)) {
    throw new Error("Invalid SPRIX subjects response.");
  }

  const success = payload["success"] === true;
  const message = getString(payload["message"]) ?? "";

  const rawSubjects = payload["subjects"];

  if (!Array.isArray(rawSubjects)) {
    return {
      success,
      subjects: [],
      message,
    };
  }

  const subjects: SprixSubject[] = [];

  for (const rawSubject of rawSubjects) {
    const subject = getSubject(rawSubject);

    if (subject) {
      subjects.push(subject);
    }
  }

  return {
    success,
    subjects,
    message,
  };
}

/* ============================================================================
 * Railway Jobs
 * ========================================================================== */

export type PythonJobStatus =
  | "queued"
  | "in_progress"
  | "completed"
  | "completed_with_errors"
  | "failed"
  | "stopped";

export type PythonJobStartResult = {
  success: boolean;
  request_id: string;
  status: "queued" | "in_progress";
};

export type PythonJobResult = {
  request_id: string;
  status: PythonJobStatus;
  error: string | null;
  message: string;
};

/* ============================================================================
 * SPRIX Solve
 * ========================================================================== */

export type StartSprixJobInput = {
  accounts: Array<{
    code: string;
    password: string;
  }>;
  subjectId: string;
};

export async function startSprixJob(
  input: StartSprixJobInput,
): Promise<PythonJobStartResult> {
  const response = await fetch(
    `${toolsApiUrl()}/api/tools/sprix/solve`,
    {
      method: "POST",
      headers: toolsHeaders(),
      body: JSON.stringify({
        accounts: input.accounts,
        subject_id: input.subjectId,
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );

  const body = await response.text();

  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(
      `Invalid JSON response from WISO Tools Platform (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `SPRIX solve request failed (${response.status}).`,
    );
  }

  if (!isRecord(payload)) {
    throw new Error("Invalid SPRIX solve response.");
  }

  const success = payload["success"];
  const requestId = payload["request_id"];
  const status = payload["status"];

  if (
    success !== true ||
    typeof requestId !== "string" ||
    (status !== "queued" && status !== "in_progress")
  ) {
    throw new Error("Invalid SPRIX solve response.");
  }

  return {
    success: true,
    request_id: requestId,
    status,
  };
}

/* ============================================================================
 * Qureo Solve
 * ========================================================================== */

export type StartQureoJobInput = {
  accounts: Array<{
    code: string;
    password: string;
  }>;
};

export async function startQureoJob(
  input: StartQureoJobInput,
): Promise<PythonJobStartResult> {
  const response = await fetch(
    `${toolsApiUrl()}/api/tools/qureo/solve`,
    {
      method: "POST",
      headers: toolsHeaders(),
      body: JSON.stringify({
        accounts: input.accounts,
      }),
      signal: AbortSignal.timeout(30_000),
    },
  );

  const body = await response.text();

  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(
      `Invalid JSON response from WISO Tools Platform (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Qureo solve request failed (${response.status}).`,
    );
  }

  if (!isRecord(payload)) {
    throw new Error("Invalid Qureo solve response.");
  }

  const success = payload["success"];
  const requestId = payload["request_id"];
  const status = payload["status"];

  if (
    success !== true ||
    typeof requestId !== "string" ||
    (status !== "queued" && status !== "in_progress")
  ) {
    throw new Error("Invalid Qureo solve response.");
  }

  return {
    success: true,
    request_id: requestId,
    status,
  };
}

/* ============================================================================
 * Get Job
 * ========================================================================== */

function parsePythonJobResult(
  payload: unknown,
): PythonJobResult {
  if (!isRecord(payload)) {
    throw new Error("Invalid Python job response.");
  }

  const requestId = payload["request_id"];
  const status = payload["status"];

  if (typeof requestId !== "string") {
    throw new Error("Invalid Python job request_id.");
  }

  if (
    status !== "queued" &&
    status !== "in_progress" &&
    status !== "completed" &&
    status !== "completed_with_errors" &&
    status !== "failed" &&
    status !== "stopped"
  ) {
    throw new Error("Invalid Python job status.");
  }

  return {
    request_id: requestId,
    status,
    error: getString(payload["error"]) ?? null,
    message: getString(payload["message"]) ?? "",
  };
}

export async function getPythonJob(
  requestId: string,
): Promise<PythonJobResult> {
  const response = await fetch(
    `${toolsApiUrl()}/api/jobs/${encodeURIComponent(requestId)}`,
    {
      method: "GET",
      headers: toolsHeaders(),
      signal: AbortSignal.timeout(30_000),
    },
  );

  const body = await response.text();

  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(
      `Invalid JSON response from WISO Tools Platform (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Python job request failed (${response.status}).`,
    );
  }

  return parsePythonJobResult(payload);
}

/* ============================================================================
 * Stop Job
 * ========================================================================== */

export async function stopPythonJob(
  requestId: string,
): Promise<PythonJobResult> {
  const response = await fetch(
    `${toolsApiUrl()}/api/jobs/${encodeURIComponent(requestId)}/stop`,
    {
      method: "POST",
      headers: toolsHeaders(),
      signal: AbortSignal.timeout(30_000),
    },
  );

  const body = await response.text();

  let payload: unknown;

  try {
    payload = JSON.parse(body);
  } catch {
    throw new Error(
      `Invalid JSON response from WISO Tools Platform (${response.status}).`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Python stop-job request failed (${response.status}).`,
    );
  }

  return parsePythonJobResult(payload);
}

/* ============================================================================
 * Status normalization
 * ========================================================================== */

export function normalizePythonStatus(
  status: PythonJobStatus,
): PythonJobStatus {
  return status;
}