import { parseApiJson } from "@/lib/api-client";

const POLL_INTERVAL_MS = 2500;
const MAX_POLL_MS = 5 * 60 * 1000;

export type SessionStatus = "processing" | "completed" | "failed";

export interface SessionPollResult {
  sessionId: string;
  status: SessionStatus;
  error?: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function pollSessionUntilComplete(
  sessionId: string
): Promise<SessionPollResult> {
  const started = Date.now();

  while (Date.now() - started < MAX_POLL_MS) {
    const response = await fetch(`/api/session/${sessionId}`, {
      cache: "no-store",
    });

    if (response.status === 404) {
      await sleep(POLL_INTERVAL_MS);
      continue;
    }

    const data = await parseApiJson<{
      status?: SessionStatus;
      error?: string;
    }>(response);

    if (!response.ok) {
      throw new Error(data.error || "Failed to check extraction status.");
    }

    if (data.status === "completed") {
      return { sessionId, status: "completed" };
    }

    if (data.status === "failed") {
      return {
        sessionId,
        status: "failed",
        error: data.error || "Extraction failed. Please try again.",
      };
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error(
    "Extraction is taking longer than expected. Try smaller files and try again."
  );
}
