import { ExtractionSession, MappedAnswer, BoundingBox } from "./types";

const globalForSessions = globalThis as typeof globalThis & {
  __vedaSessions?: Map<string, ExtractionSession>;
};

const sessions =
  globalForSessions.__vedaSessions ?? new Map<string, ExtractionSession>();
globalForSessions.__vedaSessions = sessions;

const MAX_SESSIONS = 50;
const SESSION_TTL_MS = 60 * 60 * 1000;

export function saveSession(session: ExtractionSession): void {
  cleanupExpiredSessions();

  if (sessions.size >= MAX_SESSIONS) {
    const oldestKey = sessions.keys().next().value;
    if (oldestKey) sessions.delete(oldestKey);
  }

  sessions.set(session.id, session);
}

export function getSession(id: string): ExtractionSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;

  const age = Date.now() - new Date(session.createdAt).getTime();
  if (age > SESSION_TTL_MS) {
    sessions.delete(id);
    return undefined;
  }

  return session;
}

export function updateSession(
  id: string,
  updates: Partial<ExtractionSession>
): ExtractionSession | undefined {
  const session = getSession(id);
  if (!session) return undefined;

  const updated = { ...session, ...updates };
  sessions.set(id, updated);
  return updated;
}

function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [id, session] of sessions.entries()) {
    const age = now - new Date(session.createdAt).getTime();
    if (age > SESSION_TTL_MS) {
      sessions.delete(id);
    }
  }
}
