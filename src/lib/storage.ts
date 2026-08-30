import { put, list } from "@vercel/blob";
import { ExtractionSession } from "./types";

const globalForSessions = globalThis as typeof globalThis & {
  __vedaSessions?: Map<string, ExtractionSession>;
  __vedaBlobUrls?: Map<string, string>;
};

const sessions =
  globalForSessions.__vedaSessions ?? new Map<string, ExtractionSession>();
globalForSessions.__vedaSessions = sessions;

const blobUrls =
  globalForSessions.__vedaBlobUrls ?? new Map<string, string>();
globalForSessions.__vedaBlobUrls = blobUrls;

const MAX_SESSIONS = 50;
const SESSION_TTL_MS = 60 * 60 * 1000;
const BLOB_PREFIX = "veda-sessions";

function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isExpired(session: ExtractionSession): boolean {
  const age = Date.now() - new Date(session.createdAt).getTime();
  return age > SESSION_TTL_MS;
}

async function persistToBlob(session: ExtractionSession): Promise<void> {
  if (!blobEnabled()) return;

  const { url } = await put(
    `${BLOB_PREFIX}/${session.id}.json`,
    JSON.stringify(session),
    {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
    }
  );

  blobUrls.set(session.id, url);
}

async function loadFromBlob(id: string): Promise<ExtractionSession | undefined> {
  if (!blobEnabled()) return undefined;

  try {
    let url = blobUrls.get(id);

    if (!url) {
      const { blobs } = await list({ prefix: `${BLOB_PREFIX}/${id}.json` });
      url = blobs[0]?.url;
      if (url) blobUrls.set(id, url);
    }

    if (!url) return undefined;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return undefined;

    return (await response.json()) as ExtractionSession;
  } catch {
    return undefined;
  }
}

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    const age = now - new Date(session.createdAt).getTime();
    if (age > SESSION_TTL_MS) {
      sessions.delete(id);
      blobUrls.delete(id);
    }
  }
}

export async function saveSession(session: ExtractionSession): Promise<void> {
  cleanupExpiredSessions();

  if (sessions.size >= MAX_SESSIONS) {
    const oldestKey = sessions.keys().next().value;
    if (oldestKey) {
      sessions.delete(oldestKey);
      blobUrls.delete(oldestKey);
    }
  }

  sessions.set(session.id, session);
  await persistToBlob(session);
}

export async function getSession(
  id: string
): Promise<ExtractionSession | undefined> {
  let session = sessions.get(id);

  if (!session) {
    session = await loadFromBlob(id);
    if (session) sessions.set(id, session);
  }

  if (!session) return undefined;

  if (isExpired(session)) {
    sessions.delete(id);
    blobUrls.delete(id);
    return undefined;
  }

  return session;
}

export async function updateSession(
  id: string,
  updates: Partial<ExtractionSession>
): Promise<ExtractionSession | undefined> {
  const session = await getSession(id);
  if (!session) return undefined;

  const updated = { ...session, ...updates };
  sessions.set(id, updated);
  await persistToBlob(updated);
  return updated;
}
