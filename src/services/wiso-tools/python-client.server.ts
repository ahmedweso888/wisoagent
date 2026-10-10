import type { ToolKey } from "./server";

const DEFAULT_URL = "https://tools-platform-production.up.railway.app";

function apiUrl(): string {
  return (process.env["SPRIX_TOOLS_API_URL"] ?? DEFAULT_URL).replace(
    /\/$/,
    "",
  );
}

function apiKey(): string | undefined {
  const key = process.env["SPRIX_TOOLS_API_KEY"]?.trim();

  return key || undefined;
}

function createHeaders(init?: HeadersInit): Headers {
  const headers = new Headers(init);

  headers.set("content-type", "application/json");

  const key = apiKey();

  if (key) {
    headers.set("authorization", `Bearer ${key}`);
  }

  return headers;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return {
      message: text.slice(0, 1000),
    };
  }
}

function extractErrorMessage(body: unknown): string {
  if (typeof body === "string") {
    return body;
  }

  if (!isRecord(body)) {
    return "unknown error";
  }

  const detail = body["detail"];

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (!isRecord(item)) {
          return null;
        }

        const loc = Array.isArray(item["loc"])
          ? item["loc"]
              .filter((part): part is string | number => {
                return (
                  typeof part === "string" ||
                  typeof part === "number"
                );
              })
              .join(".")
          : "";

        const message =
          typeof item["msg"] === "string"
            ? item["msg"]
            : "validation error";

        return loc ? `${loc}: ${message}` : message;
      })
      .filter((item): item is string => Boolean(item));

    if (messages.length > 0) {
      return messages.join(" | ");
    }
  }

  const message = body["message"];

  if (typeof message === "string") {
    return message;
  }

  const error = body["error"];

  if (typeof error === "string") {
    return error;
  }

  return "unknown error";
}

async function request(
  path: string,
  init: RequestInit = {},
  timeoutMs = 30_000,
): Promise<unknown> {
  const headers = createHeaders(init.headers);

  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    headers,
    signal: init.signal ?? AbortSignal.timeout(timeoutMs),
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    const detail = extractErrorMessage(body);

    throw new Error(
      `TOOLS_API_${response.status}: ${detail}`,
    );
  }

  return body;
}

export async function getToolsHealth(): Promise<Record<string, unknown>> {
  const response = await fetch(`${apiUrl()}/health`, {
    headers: createHeaders(),
    signal: AbortSignal.timeout(10_000),
  });

  const body = await parseResponseBody(response);

  if (!response.ok) {
    const detail = extractErrorMessage(body);

    throw new Error(`TOOLS_HEALTH_${response.status}: ${detail}`);
  }

  if (!isRecord(body)) {
    throw new Error("INVALID_TOOLS_HEALTH_RESPONSE");
  }

  return body;
}

export async function getToolsHealthDetails(): Promise<unknown> {
  return request("/health/tools", { method: "GET" }, 15_000);
}

export type SprixToolCredentials = {
  id: string;
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSprixSubject(value: unknown): value is SprixSubject {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value["id"] === "string" &&
    typeof value["name"] === "string"
  );
}

function isSprixSubjectsResult(
  value: unknown,
): value is SprixSubjectsResult {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value["success"] !== "boolean") {
    return false;
  }

  if (!Array.isArray(value["subjects"])) {
    return false;
  }

  if (!value["subjects"].every(isSprixSubject)) {
    return false;
  }

  const message = value["message"];

  return (
    message === undefined ||
    typeof message === "string"
  );
}

export async function getSprixSubjects(
  credentials: SprixToolCredentials,
): Promise<SprixSubjectsResult> {
  const result = await request(
    "/api/tools/sprix/subjects",
    {
      method: "POST",
      body: JSON.stringify({
        code: credentials.id,
        password: credentials.password,
      }),
    },
    120_000,
  );

  if (!isSprixSubjectsResult(result)) {
    throw new Error("INVALID_SPRIX_SUBJECTS_RESPONSE");
  }

  return {
    success: result.success,
    subjects: result.subjects,
    message:
      typeof result.message === "string"
        ? result.message
        : "",
  };
}

export type PythonJobStartResult = {
  success: boolean;
  request_id: string;
  status: "queued" | "in_progress";
};

function isPythonJobStartResult(
  value: unknown,
): value is PythonJobStartResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    value["success"] === true &&
    typeof value["request_id"] === "string" &&
    (value["status"] === "queued" ||
      value["status"] === "in_progress")
  );
}

export async function startSprixJob(input: {
  accounts: Array<{
    code: string;
    password: string;
  }>;
  subjectId: string;
}): Promise<PythonJobStartResult> {
  const result = await request(
    "/api/tools/sprix/solve",
    {
      method: "POST",
      body: JSON.stringify({
        accounts: input.accounts,
        subject_id: input.subjectId,
      }),
    },
    30_000,
  );

  if (!isPythonJobStartResult(result)) {
    throw new Error("INVALID_SPRIX_JOB_RESPONSE");
  }

  return result;
}

export async function startQureoJob(input: {
  accounts: Array<{
    code: string;
    password: string;
  }>;
}): Promise<PythonJobStartResult> {
  const result = await request(
    "/api/tools/qureo/solve",
    {
      method: "POST",
      body: JSON.stringify({
        accounts: input.accounts,
        courses: ["Python", "JavaScript"],
      }),
    },
    30_000,
  );

  if (!isPythonJobStartResult(result)) {
    throw new Error("INVALID_QUREO_JOB_RESPONSE");
  }

  return result;
}

export type PythonJobSnapshot = {
  request_id?: string;
  status?: string;
  success?: boolean;
  message?: string;
  error?: string;
  logs?: string[];
  progress?: number | null;
  tool?: string;
  created_at?: number;
  updated_at?: number;
  results?: unknown[];
  [key: string]: unknown;
};

function isPythonJobSnapshot(
  value: unknown,
): value is PythonJobSnapshot {
  if (!isRecord(value)) {
    return false;
  }

  const validStatus =
    value["status"] === "queued" ||
    value["status"] === "in_progress" ||
    value["status"] === "completed" ||
    value["status"] === "completed_with_errors" ||
    value["status"] === "failed" ||
    value["status"] === "stopped";

  if (!validStatus) {
    return false;
  }

  if (typeof value["request_id"] !== "string") {
    return false;
  }

  if (
    value["message"] !== undefined &&
    typeof value["message"] !== "string"
  ) {
    return false;
  }

  if (
    value["error"] !== undefined &&
    value["error"] !== null &&
    typeof value["error"] !== "string"
  ) {
    return false;
  }

  if (
    value["logs"] !== undefined &&
    (!Array.isArray(value["logs"]) ||
      !value["logs"].every(
        (item): item is string => typeof item === "string",
      ))
  ) {
    return false;
  }

  if (
    value["progress"] !== undefined &&
    value["progress"] !== null &&
    typeof value["progress"] !== "number"
  ) {
    return false;
  }

  if (
    value["tool"] !== undefined &&
    typeof value["tool"] !== "string"
  ) {
    return false;
  }

  if (
    value["created_at"] !== undefined &&
    typeof value["created_at"] !== "number"
  ) {
    return false;
  }

  if (
    value["updated_at"] !== undefined &&
    typeof value["updated_at"] !== "number"
  ) {
    return false;
  }

  if (
    value["results"] !== undefined &&
    !Array.isArray(value["results"])
  ) {
    return false;
  }

  return true;
}

export async function getPythonJob(
  requestId: string,
): Promise<PythonJobSnapshot> {
  const result = await request(
    `/api/jobs/${encodeURIComponent(requestId)}`,
    {
      method: "GET",
    },
    15_000,
  );

  if (!isPythonJobSnapshot(result)) {
    throw new Error("INVALID_PYTHON_JOB_RESPONSE");
  }

  return result;
}

export async function stopPythonJob(
  requestId: string,
): Promise<unknown> {
  return request(
    `/api/jobs/${encodeURIComponent(requestId)}/stop`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
    15_000,
  );
}

export function normalizePythonStatus(
  value: string | undefined,
):
  | "queued"
  | "in_progress"
  | "completed"
  | "completed_with_errors"
  | "failed"
  | "stopped" {
  switch (value) {
    case "queued":
      return "queued";

    case "completed":
      return "completed";

    case "completed_with_errors":
      return "completed_with_errors";

    case "failed":
      return "failed";

    case "stopped":
    case "cancelled":
      return "stopped";

    case "in_progress":
    case "running":
    case "processing":
    default:
      return "in_progress";
  }
}

export function isToolKey(value: string): value is ToolKey {
  return (
    value === "financial_literacy" ||
    value === "qureo"
  );
}