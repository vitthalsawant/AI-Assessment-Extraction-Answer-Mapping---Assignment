import { promises as fs } from "fs";
import path from "path";
import { del, get, put } from "@vercel/blob";
import { PROCESSING_MAX_WAIT_MS } from "@/lib/session-config";
import { ExtractionSession } from "./types";

/** How long completed/failed sessions remain available for viewing. */
const COMPLETED_TTL_MS = 60 * 60 * 1000;

const MAX_SESSIONS = 50;
const BLOB_PREFIX = "veda-sessions";

const globalForSessions = globalThis as typeof globalThis & {
  __vedaSessions?: Map<string, ExtractionSession>;
};

const memoryCache =
  globalForSessions.__vedaSessions ?? new Map<string, ExtractionSession>();
globalForSessions.__vedaSessions = memoryCache;

function getSessionDir(): string {
  if (process.env.SESSION_DIR) return process.env.SESSION_DIR;
  if (process.env.VERCEL) return "/tmp/veda-sessions";
  return path.join(process.cwd(), ".data", "sessions");
}

function sessionFilePath(id: string): string {
  return path.join(getSessionDir(), `${id}.json`);
}

function blobPath(id: string): string {
  return `${BLOB_PREFIX}/${id}.json`;
}

function isBlobStorageEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function isExpired(session: ExtractionSession): boolean {
  const age = Date.now() - new Date(session.createdAt).getTime();

  if (session.status === "processing") {
    return age > PROCESSING_MAX_WAIT_MS;
  }

  return age > COMPLETED_TTL_MS;
}

async function readPersistedSession(
  id: string
): Promise<ExtractionSession | null> {
  if (isBlobStorageEnabled()) {
    try {
      const result = await get(blobPath(id), {
        access: "private",
        useCache: false,
      });

      if (!result || result.statusCode !== 200 || !result.stream) {
        return null;
      }

      const raw = await new Response(result.stream).text();
      return JSON.parse(raw) as ExtractionSession;
    } catch {
      return null;
    }
  }

  try {
    const raw = await fs.readFile(sessionFilePath(id), "utf-8");
    return JSON.parse(raw) as ExtractionSession;
  } catch {
    return null;
  }
}

async function writePersistedSession(session: ExtractionSession): Promise<void> {
  const payload = JSON.stringify(session);

  if (isBlobStorageEnabled()) {
    await put(blobPath(session.id), payload, {
      access: "private",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      multipart: payload.length > 4_500_000,
    });
    return;
  }

  const dir = getSessionDir();
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(sessionFilePath(session.id), payload, "utf-8");
}

async function deletePersistedSession(id: string): Promise<void> {
  memoryCache.delete(id);

  if (isBlobStorageEnabled()) {
    try {
      await del(blobPath(id));
    } catch {
      // blob may already be gone
    }
    return;
  }

  try {
    await fs.unlink(sessionFilePath(id));
  } catch {
    // ignore missing files
  }
}

async function cleanupExpiredSessions(): Promise<void> {
  if (isBlobStorageEnabled()) {
    return;
  }

  const dir = getSessionDir();

  try {
    const files = await fs.readdir(dir);
    await Promise.all(
      files.map(async (file) => {
        if (!file.endsWith(".json")) return;
        const id = file.replace(/\.json$/, "");
        const session = await readPersistedSession(id);
        if (session && isExpired(session)) {
          await deletePersistedSession(id);
        }
      })
    );
  } catch {
    // directory may not exist yet
  }

  if (memoryCache.size > MAX_SESSIONS) {
    const overflow = memoryCache.size - MAX_SESSIONS;
    const keys = [...memoryCache.keys()].slice(0, overflow);
    keys.forEach((key) => memoryCache.delete(key));
  }
}

export async function saveSession(session: ExtractionSession): Promise<void> {
  await cleanupExpiredSessions();
  memoryCache.set(session.id, session);
  await writePersistedSession(session);
}

export async function getSession(
  id: string
): Promise<ExtractionSession | undefined> {
  const cached = memoryCache.get(id);
  if (cached && !isExpired(cached)) {
    return cached;
  }

  const session = await readPersistedSession(id);
  if (!session) {
    memoryCache.delete(id);
    return undefined;
  }

  if (isExpired(session)) {
    await deletePersistedSession(id);
    return undefined;
  }

  memoryCache.set(id, session);
  return session;
}

export async function updateSession(
  id: string,
  updates: Partial<ExtractionSession>
): Promise<ExtractionSession | undefined> {
  const session = await getSession(id);
  if (!session) return undefined;

  const updated = { ...session, ...updates };
  await saveSession(updated);
  return updated;
}
